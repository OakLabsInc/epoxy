const async = require('async')
const _ = require('lodash')
const debug = require('../util/debug')

module.exports = {
  dependencies: {
    // these are called dynamically, based on the resource_config
    services: '*',
    util: ['getWritePath', 'config'],
  },
  optional: ['_id'],
  required: ['resource', 'action', 'data'],
  service: ({_id, resource, action, data}, done, {services, util}) => {
    const {config: {resource_config, service_url, recurse_internal}} = util
    debug(`processing ${resource} -> ${action}`)

    // we store the ID for easy generic reference
    if (_id) _.assign(data, {_id})

    let resourceConfig = resource_config.resources[resource]
    let actionList = resourceConfig.actions[action]

    // looks through the config.json, returns the correct write path
    // for the file based on the resource
    let writePath = util.getWritePath(data, resourceConfig.params)

    const processAction = (actionDef, next) => {

      // check to see if we have a service or action definition
      const serviceName = _.get(actionDef, '$service')
      const resourceName = _.get(actionDef, '$resource')

      // look for a service that matches the $service
      if (serviceName) {
        const service = _.get(services, serviceName)
        if (!service) {
          return next(new Error(
            `Could not find service ${serviceName} for resource ${resourceName}.`
          ))
        }
        service({data, writePath, ...resourceConfig.params}, next)

      // call triggerAction for $resource
      } else if (resourceName) {
        const params = {
          _id,
          url: service_url + '/epoxyEvent',
          resource: resourceName,
          action,
          data
        }

        // call internal service or network request
        if (recurse_internal) {
          services.processAction(params, next)
        } else {
          services.triggerAction(params, next)
        }
      } else next()
    }

    async.forEach(actionList, processAction, done)
  }
}
