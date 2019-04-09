const _ = require('lodash')
const {join} = require('path')
const {load, create, printFilters} = require('law')
const debug = require('../util/debug')

const jargon = require('./jargon')
const policy = require('./policy')
const services = load(join(__dirname, '../services'))

// accept config and pass it to resolvers
module.exports = (config) => {
  const resolvers = require('./resolvers')(config)

  // load any custom services if they were provided
  // ignore any attempts to rename builtin services
  if (config.custom_services) {
    _.defaults(services, config.custom_services)
  }

  // this processes all our services and middleware into ready to use functions
  const _services = create({
    services,
    jargon,
    policy,
    resolvers,
  })
  debug('I am the law:', printFilters(_services))
  return _services
}
