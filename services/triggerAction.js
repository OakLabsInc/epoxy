const request = require('request')

// hey, who's counting
const isErr = e => e >= 400

module.exports = {
  required: ['url', 'resource', 'action', 'data'],
  service({url, resource, action, data}, cb) {
    let opts = {
      url,
      method: 'POST',
      headers: {
        'x-epoxy-resource': resource,
        'x-epoxy-action': action,
        'x-node-env': process.env.NODE_ENV
      },
      form: data
    }
    return request(opts, (err, res) => {
      if (!err && isErr(res.statusCode)) {
        err = new Error(`triggerAction ${resource}->${action} failed with ${res.statusCode} status:\n${res.body}`)
      }
      cb(err)
    })
  }
}
