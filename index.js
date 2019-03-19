const Joi = require('joi')
const getServices = require('./law')
const getHandlers = require('./handlers')

// param schema
const validateConfig = Joi.object().required().keys({

  // contentful access configurations
  contentful: {
    space_id: Joi.string().required(),
    environment: Joi.string().required(),
    token: Joi.string().required(),
  },

  // google cloud access configurations
  gcloud: {
    project: Joi.string().required(),
    bucket: Joi.string().required(),
    path_prefix: Joi.string(),
    auth_file: Joi.string().required(),
  },

  // used for self-referencing services if recurse_internal is false
  service_url: Joi.string().required(),

  // describes what should happen when we receive change events for
  // different contentful resources
  resource_config: Joi.object().required().keys({
    resources: Joi.object().required(),
  }),

  // custom services provided by epoxy user
  custom_services: Joi.object(),

  // This flag determines whether we should treat '$resource' as an
  // internal service call, or initiate a network request.  Service
  // call has less overhead, but network request can be
  // scaled/redirected/logged.  Default is true (internal service call).
  recurse_internal: Joi.boolean(),
})

// validate the config and return the services
module.exports = (config = {}) => {
  const {error} = Joi.validate(config, validateConfig)
  if (error) {
    error.message = `epoxy received invalid config: ${error.message}`
    throw error
  }

  // pass the config to the service initialization
  const services = getServices(config)

  // injects handlers with config and services
  const handlers = getHandlers({config, services})

  // enumerable: false so deploy script does not pick them up
  const hidden = (key, value) =>
    Object.defineProperty(handlers, key,
      {value, enumerable: false})

  // add services, configuration, meta data
  // mostly to help CLI consume the resulting exports
  hidden('isEpoxyService', true)
  hidden('lawServices', services)
  hidden('config', config)

  // There are two main handlers: epoxyEvent and contentfulEvent
  //  - contentfulEvent handles HTTP callback data directly from contentful
  //  - epoxyEvent handles a trimmed-down, internal format
  // We use epoxyEvent if we need to trigger further actions from our initial
  // entry point.
  return handlers
}
