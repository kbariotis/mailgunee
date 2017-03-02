#!/usr/bin/env node

const run = require('../lib').default

run().catch(err => console.log(err))
