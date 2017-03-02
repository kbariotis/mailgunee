import 'babel-core/register'
import 'babel-polyfill'

import fs from 'fs'
import os from 'os'
import r from 'request'
import inquirer from 'inquirer'
import {Spinner} from 'cli-spinner'

let apiKey = ''
let domain = ''
let baseMessagesUrl = ''
let baseDomainsUrl = ''

const setup = async () => {
  const file = `${os.homedir()}/.mailgun-previewer`

  let key = null

  try {
    key = fs.readFileSync(file)
  } catch (e) {
    console.log('This is the first time you are using Mailgun previewer')
    console.log('You need to provide the API key (stored in ~/.mailgun-previewer')

    const answer = await inquirer.prompt([{
      type: 'input',
      name: 'key',
      message: 'Provide your API key'
    }])

    key = answer.key

    try {
      fs.writeFileSync(file, key)
    } catch (e) {
      console.log(e)
    }
  }

  return key
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
    const spinner = new Spinner('processing.. %s')
    spinner.setSpinnerString('|/-\\')
    spinner.start()

    r(`${url}`, (err, response) => {
      spinner.stop()
      console.log('\x1Bc')
      if (err) {
        reject(err)
      } else {
        resolve(JSON.parse(response.body))
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
  message: 'Choose a message to render',
  choices: messages,
  paginated: false
}]).then(answer => answer.message)

const renderDomainsList = (domains) => inquirer.prompt([{
  type: 'list',
  name: 'domain',
  message: 'Choose a domain',
  choices: domains,
  paginated: false
}]).then(answer => answer.domain)

const renderConfirmationToExit = () => inquirer.prompt([{
  type: 'confirm',
  name: 'exit',
  message: 'Quit now?',
  default: false
}]).then(answer => answer.exit)

const renderDomains = async (url = baseDomainsUrl) => {
  const eventsBody = await request(url)

  let items = eventsBody.items.map(item => item.name)

  return await renderDomainsList(items)
}

const renderMessages = async (url = baseMessagesUrl) => {
  const eventsBody = await request(url)

  let items = eventsBody.items
  const presentedItems = formatOptions(items).concat(['more'])

  const selection = await renderMessagesList(presentedItems)

  if (selection === 'more') {
    renderMessages(`${baseMessagesUrl}&begin=${items[items.length - 1].timestamp}`)
  } else {
    const url = getSelectionUrl(items, selection)

    const messageBody = await request(`${url}`)

    console.log(messageBody['body-html'])

    const exit = await renderConfirmationToExit()

    if (!exit) {
      renderMessages()
    }
  }
}

const run = async () => {
  apiKey = await setup()

  baseDomainsUrl = `https://api:${apiKey}@api.mailgun.net/v3/domains`
  domain = await renderDomains()

  baseMessagesUrl = `https://api:${apiKey}@api.mailgun.net/v3/${domain}/events?limit=10`
  renderMessages()
}

export {
  renderMessages,
  run as default,
  request,
  setup,
  getSelectionUrl,
  formatOptions,
  formatDate
}
