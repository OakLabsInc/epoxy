const async = require('async')

module.exports = {
  dependencies: {
    services: ['processAction'],
    util: ['contentful']
  },
  optional: ['_id', 'resource'],
  required: ['data', 'action'],
  service({_id, data, resource, action}, done, {util: {contentful}, services}) {
    if (!resource) {
      const type = contentful.getType(data)
      if (type === 'Entry') resource = contentful.getResource(data)
      else if (type === 'Asset') resource = 'asset'
    }
    // normalize the contentful fields, or fetch missing fields, they
    // contain i18n properties
    contentful.getFields(data, function (err, fields) {
      if (err) return done(err)
      // look through the field keys, see if there is a sys field that
      // needs to be resolved (for assets or linked references)
      async.mapValues(
        fields,
        function (field, key, cb) {
          // bring the linked items into the field with a reference
          contentful.resolveSys(field, cb)
        },
        function (err, result) {
          if (err) console.error(err)
          process(result)
        }
      )
    })

    function process (cleanData) {
      services.processAction({
        _id,
        resource,
        action,
        data: cleanData,
      }, done)
    }
  }
}
