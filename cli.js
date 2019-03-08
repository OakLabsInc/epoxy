#!/usr/bin/env node

/* eslint-disable no-unused-expressions */
require('yargs')
  .usage('usage: $0 <command>')
  .command('deploy', 'deploy to local or cloud', require('./commands/deploy'))
  .command('log', 'get logs from local instance', require('./commands/log'))
  .command('transfer-all', 'initiate a transfer of all resources', require('./commands/transfer-all'))
  .help('h')
  .alias('h', 'help')
  .demandCommand()
  .strict()
  .argv
