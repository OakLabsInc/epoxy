const _ = require('lodash')
const {join} = require('path')
const md5 = require('md5')
const {URL} = require('url')

// Calculate the gcloud file path that we will write to.
// The file name format is described by 'fileNameKey' in the resource config.
// The fileNameKey joins properties from the data to create the file name.
function getWritePath (data, {fileNameKey, path}) {
  //console.log('getConfigWritePath received:', {data, resourceConfig})
  const write_path = _
    .chain(fileNameKey)
    .map(configKey => parseConfigPathObject(configKey, data))
    .thru(v => join(path, ...v))
    .value()
  return write_path
}

/**
 * In our own config file, we transform the data to generate the write path for any given entry
 * the write path is an object of keys which (should) exist in the record fields
 * we look through the keys and construct the write path
 * if a key is an object, we do a custom parse
 *
 * md5: takes two field keys and makes a md5 hash from the values.
 *      Format: { md5: [<key>,<key>,...] }
 */
function parseConfigPathObject (configKey, data) {
  //console.log('parseConfigPathObject received:', {configKey, data})
  if (_.isObject(configKey)) {
    // md5
    if (_.has(configKey, 'md5')) {
      return _
        .chain(configKey['md5'])
        .map(v => data[_.trim(v)])
        .join(',')
        .thru(v => md5(v))
        .value()
    }
    // thru
    if (_.has(configKey, 'file')) {
      return _
        .chain(configKey['file'])
        .thru(v => (new URL(data[v])).pathname)
        .split('/')
        .last()
        .value()
    }
  } else {
    return _.snakeCase(data[configKey])
  }
}

module.exports = getWritePath
