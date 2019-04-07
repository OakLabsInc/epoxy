module.exports = {
  dependencies: {
    services: ['gcs/writeToStorage'],
    util: ['debug']
  },
  required: ['writePath', 'data'],
  service: ({writePath, data}, done, {services, util: {debug}}) => {
    debug('writing entry:', writePath)

    // write the cleaned JSON record to storage
    services['gcs/writeToStorage']({
      writePath,
      contentType: 'application/json',
      item: JSON.stringify(data),
    }, done)
  }
}
