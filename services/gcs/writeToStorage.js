module.exports = {
  dependencies: {
    util: ['gcs']
  },
  required: ['writePath', 'contentType', 'item'],
  service: ({writePath, contentType, item}, done, {util: {gcs}}) => {
    let ws = gcs.getBucketWS(writePath, contentType)
    ws.on('error', (err) => {
      err.message = `Could not open gs://${ws._bucket}/${ws._path}: ${err.message}`
      done(err)
    })
    ws.on('finish', () => {
      done(null, {
        path: writePath,
        item
      })
    })
    ws.write(item)
    ws.end()
  }
}
