module.exports = {
  required: ['writePath'],
  service: ({writePath}, done) => {
    return done(new Error('not implemented'))
    //return gcloud
      //.storage()
      //.bucket(config.gcloud.bucket)
      //.file(_path)
      //.delete(err => cb(err))
  }
}
