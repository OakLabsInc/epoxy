#!/usr/bin/env node
/* eslint-disable no-unused-expressions */

const loadServices = require('./load-services')

// load up yargs config, and the relevant commands
const loadCmd = (s) =>
  require('yargs')
    .usage('usage: $0 <command>')
    .command('deploy', 'deploy to local or cloud', require('./deploy')(s))
    .command('log', 'get logs from local instance', require('./log')(s))
    .command(require('./transfer-all')(s))
    .help('h')
    .alias('h', 'help')
    .demandCommand()
    .strict()
    .argv

const main = async () => {
  const services = await loadServices()
  loadCmd(services)
}

main()
  .catch(e => {
    console.log(e.stack)
    process.exit(1)
  })
