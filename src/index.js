import 'babel-core/register'
import 'babel-polyfill'

import fs from 'fs'
import os from 'os'
import r from 'request'
import inquirer from 'inquirer'
import {Spinner} from 'cli-spinner'
import chalk from 'chalk'

const log = console.log

let apiKey = ''
let domain = ''
let baseMessagesUrl = ''
let baseDomainsUrl = ''

let apiKeyFile = '.mailgunee'

/**
 * Orchestrate the CLI interface
 */
const run = async () => {
  apiKey = await setup()

  baseDomainsUrl = `https://api:${apiKey}@api.mailgun.net/v3/domains`
  let domainsList = await fetchDomains()

  domain = await renderDomainsList(domainsList)
  baseMessagesUrl = `https://api:${apiKey}@api.mailgun.net/v3/${domain}/events?limit=10`
  await renderMessages()

  const exit = await renderConfirmationToExit()

  if (!exit) {
    run()
  }
}

/**
 * Initial setup to get the API key
 */
const setup = async () => {
  const file = `${os.homedir()}/${apiKeyFile}`

  let key = null

  try {
    key = fs.readFileSync(file)
  } catch (e) {
    log(`
This is the first time you are using mailgunee. ${chalk.bold('Thank you for checking it out!')}
You need to provide your API key (stored in ~/${apiKeyFile}).
`)

    const answer = await inquirer.prompt([{
      type: 'input',
      name: 'key',
      message: 'Provide your API key'
    }])

    key = answer.key

    try {
      fs.writeFileSync(file, key)
    } catch (e) {
      log(`${chalk.bold('Oh no!')}, e`)
    }
  }

  return key
}

/**
 * Render domains list
 */
const fetchDomains = async (url = baseDomainsUrl) => {
  const eventsBody = await request(url)

  return eventsBody.items.map(item => item.name)
}

/**
 * Render messages list
 *
 * Will recursively call itself if user chooses not to exit
 */
const renderMessages = async (url = baseMessagesUrl) => {
  const eventsBody = await request(url)

  let items = eventsBody.items

  if (!items.length) {
    chalk.bold('There are no messages to preview.')
    return
  }

  const presentedItems = formatOptions(items).concat(['More'])

  const selection = await renderMessagesList(presentedItems)

  if (selection === 'More') {
    await renderMessages(`${baseMessagesUrl}&begin=${items[items.length - 1].timestamp}`)
  } else {
    const url = getSelectionUrl(items, selection)

    const messageBody = await request(`${url}`)

    log(`
${chalk.bold(messageBody['Subject'])}
${messageBody['stripped-html']}
    `)
  }
}

const formatDate = date => {
  const dd = date.getDate()
  const MM = date.getMonth() + 1
  const yy = date.getFullYear().toString().substring(2, 4)
  const hh = date.getHours()
  const mm = date.getMinutes()
  const ss = date.getSeconds()

  return `${MM}/${dd}/${yy} - ${hh}:${mm}:${ss}`
}

const request = url => {
  return new Promise((resolve, reject) => {
    const spinner = new Spinner('Wait.. %s')

    spinner.setSpinnerString('|/-\\')
    spinner.start()

    r(`${url}`, (err, response) => {
      spinner.stop()

      log('\x1Bc') // clear the terminal

      if (err) {
        reject(err)
      } else {
        let body = null

        try {
          body = JSON.parse(response.body)
        } catch (e) {
          reject(e)
          return
        }

        resolve(body)
      }
    })
  })
}

const formatOptions = options => options.map(item => `${formatDate(new Date(item.timestamp * 1000))} / ${item.recipient} / ${item.id}`)

const getSelectionUrl = (items, selection) => {
  const id = selection.split(' / ')[2]

  const message = items.filter(item => item.id === id)[0]
  return message.storage.url.replace('https://', `https://api:${apiKey}@`)
}

const renderMessagesList = (messages) => inquirer.prompt([{
  type: 'list',
  name: 'message',
  message: 'Choose a message to preview',
  choices: messages,
  paginated: false,
  pageSize: 11
}]).then(answer => answer.message)

const renderDomainsList = (domains) => inquirer.prompt([{
  type: 'list',
  name: 'domain',
  message: 'Choose a domain',
  choices: domains,
  paginated: false,
  pageSize: 20
}]).then(answer => answer.domain)

const renderConfirmationToExit = () => inquirer.prompt([{
  type: 'confirm',
  name: 'exit',
  message: 'Quit now?',
  default: false
}]).then(answer => answer.exit)

export {
  renderMessages,
  run as default,
  request,
  setup,
  getSelectionUrl,
  formatOptions,
  formatDate
}
