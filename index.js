const Joi = require('joi')
const getServices = require('./law')
const getHandlers = require('./handlers')

// param schema
const validateConfig = Joi.object().required().keys({
  contentful: {
    space_id: Joi.string().required(),
    environment: Joi.string().required(),
    token: Joi.string().required(),
  },
  gcloud: {
    project: Joi.string().required(),
    bucket: Joi.string().required(),
    path_prefix: Joi.string(),
    auth_file: Joi.string().required(),
  },
  service_url: Joi.string().required(),
  resource_config: Joi.object().required().keys({
    resources: Joi.object().required(),
  }),
  custom_services: Joi.object(),
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

  // add law_services in case we want to call them directly...
  // enumerable: false so deploy script does not pick them up
  Object.defineProperty(handlers, 'law_services', {
    value: services,
    enumerable: false
  })

  // There are two main handlers: epoxyEvent and contentfulEvent
  //  - contentfulEvent handles HTTP callback data directly from contentful
  //  - epoxyEvent handles a trimmed-down, internal format
  // We use epoxyEvent if we need to trigger further actions from our initial
  // entry point.
  return handlers
}
