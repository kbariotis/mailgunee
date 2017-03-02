/* eslint-env mocha */

import { expect } from 'chai'
import sinon from 'sinon'
import fs from 'fs'
import inquirer from 'inquirer'

import {
  run,
  request,
  setup,
  getSelectionUrl,
  formatOptions,
  formatDate
} from '../src'

import eventsFixture from './fixtures/events.json'
import messageBodyFixture from './fixtures/message.json'

describe('Format options', () => {
  it('should test awesome function', () => {
    const options = formatOptions(eventsFixture.items)
    expect(options.length).to.eql(10)
  })
})

describe('Format date', () => {
  it('should test awesome function', () => {
    const options = formatDate(new Date(1488401806.37272 * 1000))
    expect(options).to.equal('3/1/17 - 22:56:46')
  })
})

describe('Setup for the first time', () => {
  let stub

  before(() => {
    stub = sinon.stub(fs, 'readFileSync').returns('kostarelo')
  })

  it('should test awesome function', (done) => {
    setup()
    .then(key => expect(key).to.equal('kostarelo'))
    .then(() => done())
    .catch(err => done(err))
  })

  after(() => {
    stub.restore()
  })
})

describe('Setup', () => {
  let fsStub
  let fsStub2
  let inquirerStub

  before(() => {
    fsStub = sinon.stub(fs, 'readFileSync')
      .throws(new Error())
    fsStub2 = sinon.stub(fs, 'writeFileSync')
      .returns()
    inquirerStub = sinon.stub(inquirer, 'prompt')
      .returns(new Promise(resolve => resolve({ key: 'kostarelo' })))
  })

  it('should test awesome function', (done) => {
    setup()
    .then(key => expect(key).to.equal('kostarelo'))
    .then(() => done())
    .catch(err => done(err))
  })

  after(() => {
    fsStub.restore()
    fsStub2.restore()
    inquirerStub.restore()
  })
})

describe('Get URL from selection', () => {
  it('should test awesome function', () => {
    const options = formatOptions(eventsFixture.items)

    const url = getSelectionUrl(eventsFixture.items, options[0])

    expect(url).to.equal('https://api:@sw.api.mailgun.net/v3/domains/gityeller.com/messages/eyJwIjpmYWxzZSwiayI6ImExZDAyYTEyLWFlYjYtNDM2Yy05ZTkyLTA1YzI1MjcwYjJlOCIsInMiOiIzY2MwYjk1Mzc5IiwiYyI6InRhbmtiIn0=')
  })
})
