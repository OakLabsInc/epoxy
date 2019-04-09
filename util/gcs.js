const {join} = require('path')
const {Storage} = require('@google-cloud/storage')
const moment = require('moment')
const debug = require('./debug')

module.exports = (config) => {
  const storage = new Storage({
    projectId: config.gcloud.project,
    keyFilename: config.gcloud.auth_file
  })

  return {
    getBucketWS(path, contentType) {
      const {bucket, path_prefix} = config.gcloud

      // add path_prefix if we have one
      if (path_prefix) {
        path = join(path_prefix, path)
      }
      debug('getting write stream for:', {bucket, path})

      let setup = storage.bucket(bucket).file(path)
      let opts = {}
      if (contentType) {
        opts = {
          contentType,
          metadata: {contentType}
        }
      }
      const stream = setup.createWriteStream(opts)
      stream._bucket = bucket
      stream._path = path
      return stream
    },
    getReadStream(path) {
      const {bucket, path_prefix} = config.gcloud

      // add path_prefix if we have one
      if (path_prefix) {
        path = join(path_prefix, path)
      }
      debug('getting read stream for:', {bucket, path})

      let file = storage.bucket(bucket).file(path)
      const stream = file.createReadStream({})
      stream._bucket = bucket
      stream._path = path
      return stream
    },
    async getSignedUrl(path) {
      const {bucket, path_prefix} = config.gcloud
      // google JS client docs here:
      // https://cloud.google.com/nodejs/docs/reference/storage/2.3.x/File#getSignedUrl

      // add path_prefix if we have one
      if (path_prefix) {
        path = join(path_prefix, path)
      }
      debug('getting signed url for:', {bucket, path})

      const file = storage.bucket(bucket).file(path)
      const urlResponse = await file.getSignedUrl({
        action: 'read',
        expires: moment().add(1, 'hour')
      })
      return urlResponse && urlResponse[0]
    }
  }
}
