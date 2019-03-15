
module.exports = {
  dependencies: {
    util: ['gcs']
  },
  required: ['writePath', 'contentType', 'item'],
  service: ({writePath, contentType, item}, done, {util: {gcs}}) => {
    let ws = gcs.getBucketWS(writePath, contentType)
    const handleErr = (err) => {
      if (err) err.message = `Could not open gs://${ws._bucket}/${ws._path}: ${err.message}`
      done(err)
    }
    ws.on('error', handleErr)
    // trying to do everything we can to handle these errors
    // for some reason we still get UnhandledPromiseRejectionWarning
    try {
      ws.write(item, null, err => {
        handleErr(err)
      })
      ws.end()
    } catch (e) {
      handleErr(e)
    }
  }
}
