// we're mostly just using these resolvers as a way to inject the config
// into the utility functions that need it
module.exports = config => {
  const Contentful = require('../util/contentful')
  const contentful = new Contentful(config)

  const util = {
    gcs: require('../util/gcs')(config),
    contentful,
    config: config,
    getWritePath: require('../util/getWritePath')
  }
  return {
    util: name => util[name]
  }
}
