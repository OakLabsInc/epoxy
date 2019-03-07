module.exports = config => {
  // we're mostly just using these resolvers as a way to inject the config
  // into the utility functions that need it
  const util = {
    gcs: require('../util/gcs')(config),
    contentful: require('../util/contentful')(config),
    config: config,
    getWritePath: require('../util/getWritePath')
  }
  return {
    util: name => util[name]
  }
}
