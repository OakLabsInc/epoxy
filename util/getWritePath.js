const _ = require('lodash')
const {join} = require('path')
const md5 = require('md5')
const {URL} = require('url')
const debug = require('./debug')

// Calculate the gcloud file path that we will write to.
// The file name format is described by 'fileNameKey' in the resource config.
// The fileNameKey joins properties from the data to create the file name.
function getWritePath (data, {fileNameKey, path}) {
  //const {inspect} = require('util')
  debug('getConfigWritePath received:', {data, fileNameKey, path})
  const write_path = _(fileNameKey)
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
  debug('parseConfigPathObject received:', {configKey, data})
  if (_.isObject(configKey)) {
    // md5
    if (_.has(configKey, 'md5')) {
      const vals = _(configKey['md5'])
        .map(v => _.get(data, _.trim(v)))
        .join(',')
      return md5(vals)
    }
    // get fileName from url
    if (_.has(configKey, 'fromUrl')) {
      return _(configKey['fromUrl'])
        .thru(v => (new URL(_.get(data, v))).pathname)
        .split('/')
        .last()
    }
    // return fileName unmodified
    if (_.has(configKey, 'fileName')) {
      return _.get(data, configKey['fileName'])
    }
  } else {
    return _.snakeCase(_.get(data, configKey))
  }
}

module.exports = getWritePath
