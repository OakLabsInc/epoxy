const {join} = require('path')
const {Storage} = require('@google-cloud/storage')

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
      //console.log('getting write stream for:', {bucket, path})

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
    }
  }
}
