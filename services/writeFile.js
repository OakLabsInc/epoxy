const _ = require('lodash')
const request = require('request')
const formatUrl = require('../util/url')

module.exports = {
  dependencies: {
    util: ['gcs']
  },
  required: ['fetchUrlKey', 'writePath', 'data'],
  service: ({fetchUrlKey, writePath, data}, done, {util: {gcs}}) => {
    console.log('writing file:', writePath)

    // pull the image URL from the config fetchUrlKey and then pipe to the write stream
    let toFetch = formatUrl(
      _.get(data, fetchUrlKey)
    )
    // incase its no protocol, append a simple HTTP
    if (!toFetch.protocol) {
      toFetch.protocol = 'http'
    }
    // create the image write stream
    let ws = gcs.getBucketWS(writePath, _.get(data, 'file.contentType'))
    let err = null
    ws
      .on('error', _err => {
        err = _err
        return done(err)
      })
      .on('finish', () => {
        done(err, {path: writePath})
      })
    request.get(toFetch)
      .once('response', res => res.headers)
      .pipe(ws)
  }
}
