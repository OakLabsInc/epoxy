const _ = require('lodash')
const async = require('async')

const Contentful = require('./util/contentful')

// custom function to extract json
function rawBodyJSON (req, cb) {
  if (req.body && _.size(req.body) > 0) {
    let err = null
    if (_.isBuffer(req.body)) {
      try {
        req.body = JSON.parse(req.body.toString('utf8').trim())
        console.log('BUFFER PARSED', req.body)
      } catch (e) {
        err = e
      }
    }
    return cb(err, req.body)
  }
  let buf
  req.on('data', function (d) {
    if (d) {
      buf += d
    }
  })
  req.on('end', function () {
    let err = null
    try {
      // no idea why undefined gets added to the start, but we will take it out
      buf = buf.replace('undefined{', '{')
      buf = JSON.parse(buf)
    } catch (e) {
      err = e
    }
    return cb(err, buf)
  })
}

module.exports = ({config, services}) => {
  const contentful = new Contentful(config)
  return {
    epoxyEvent(req, res) {
      /**
       * action is the high level property that determines which actions to take
       * currently is publish and unpublish
       */
      services.processAction({
        config,
        _id: req.headers['x-epoxy-id'] || false,
        resource: req.headers['x-epoxy-resource'],
        action: req.headers['x-epoxy-action'],
        data: req.body,
      }, (err, result) => {
        if (err) return res.status(500).send(err)
        res.status(200).json(result)
      })
    },

    contentfulEvent(req, res) {
      // we parse the raw body because GCF body parser skips over the non-standard content-type of contentful requests
      rawBodyJSON(req, (err, payload) => {
        if (err) return res.status(500).json({error: 'No data sent'})

        // pull out the entry id fron the contentful payload
        let id = req.headers['x-epoxy-id'] || contentful.getId(payload) || false

        /**
         * the request action for contentful is located in this header like so:
         * "X-Contentful-Topic": "ContentManagement.Entry.publish"
         */
        let action = req.headers['x-epoxy-action'] || _.chain(req.headers['x-contentful-topic'])
          .split('.')
          .last()
          .value()

        // In contentful, the contentType contains the name of the resource
        // we associate with our actions.
        let resource = req.headers['x-epoxy-resource'] || contentful.getResource(payload)

        // normalize the contentful fields, or fetch missing fields, they
        // contain i18n properties
        contentful.getFields(payload, function (err, fields) {
          if (err) return res.status(500).send(err)
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
            config,
            _id: id,
            resource,
            action,
            data: cleanData,
          }, (err, result) => {
            if (err) return res.status(500).send(err)
            res.status(200).json(result)
          })
        }
      })
    },

  }
}
