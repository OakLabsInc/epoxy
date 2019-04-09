const is404 = (err) => err && err.message && err.message === 'Not Found'
const debug = require('../util/debug')

module.exports = {
  dependencies: {
    services: ['gcs/deleteFromStorage']
  },
  required: ['writePath', 'data'],
  service: ({writePath, data}, cb, {services}) => {
    // The 'delete' or 'unpublish' request doesn't attach the fields in the data,
    // only gives you the entry ID. We request the original entry based on the ID.

    // Same process as write, but all we are concerned with is getting the right
    // file path so we can delete it.
    // Looks through the config.json, returns the correct write path for the file
    // based on its entry type.
    debug('Delete', writePath)
    services['gcs/deleteFromStorage']({writePath}, err => {
       // we want to ignore attempts to delete things that aren't found.
       // we don't want to error out the function and make contentful retry its request for the same thing over and over
      err = is404(err) ? null : err
      cb(err, {path: writePath})
    })
  }
}
