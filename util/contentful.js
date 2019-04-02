const _ = require('lodash')
const {createClient} = require('contentful-management')
//const Q = require('p-queue')

var Contentful = function (config) {
  const _this = this
  _this.space = null
  _this.env = null

  // TODO: find a way to wire this into the Contentful client seemlessly
  // TODO: make settings configurable
  //_this.queue = new Q({interval: 1000, intervalCap: 3})

  // create one shared client between all Contentful instances
  this.client = createClient({
    accessToken: config.contentful.token
  })

  // space and env are cached so we don't have to keep querying them
  this.getSpace = async function () {
    if (_this.space) return _this.space
    _this.space = await _this.client.getSpace(
      config.contentful.space_id
    )
    return _this.space
  }
  this.getEnvironment = async function () {
    const space = await _this.getSpace()
    if (_this.env) return _this.env
    _this.env = await space.getEnvironment(
      config.contentful.environment || 'master'
    )
    return _this.env
  }

  this.getType = function (data) {
    return _.get(data, 'sys.type')
  }

  this.getResource = function (data) {
    return _.get(data, 'sys.contentType.sys.id')
  }

  this.getId = function (data) {
    return _.get(data, 'sys.id')
  }
  this.get = function (data, field) {
    return _.get(data, ['fields', field, 'en-US'])
  }
  this.set = function (data, field) {
    return _.set(data, ['fields', field, 'en-US'])
  }
  this.setLink = function (data, field, id) {
    return _this.set(data, field,
      {sys: {type: 'Link', linkType: 'Entry', id}}
    )
  }
  this.alreadyHasLink = function(entry, field) {
    return _.get(_this.get(entry, field), 'sys.type') === 'Link'
  }

  this.getEntry = async function (id) {
    const env = await _this.getEnvironment()
    return env.getEntry(id)
  }

  this.getEntries = async function (params) {
    const env = await _this.getEnvironment()
    return env.getEntries(params)
  }

  this.getAsset = async function (id) {
    const env = await _this.getEnvironment()
    return env.getAsset(id)
  }

  // TODO: refactor to async function
  this.getFields = function (data, cb = function () {}) {
    let {fields, sys} = data
    // if there are no fields, fetch the entry id and return that
    if (!_.size(fields)) {
      return _this
        .getEntry(sys.id)
        .then(entry => cb(null, _this.stripLocalization(entry.fields)))
        .catch(err => cb(err))
    } else {
      return cb(null, _this.stripLocalization(fields))
    }
  }

  // TODO: refactor to async function
  this.resolveSys = function (field, cb) {
    if (!_.has(field, 'sys')) {
      return cb(null, field)
    }
    switch (field.sys.linkType) {
    case 'Asset': {
      //console.log('RESOLVE SYS', field, field.sys.id)
      _this
        .getAsset(field.sys.id)
        .then(asset => _this.stripLocalization(asset.fields))
        .then(asset => {
          _.assign(asset, {
            id: field.sys.id
          })
          return asset
        })
        .then(asset => cb(null, asset), cb)
      break
    }
    default: {
      cb(null, field)
      break
    }
    }
  }

  this.stripLocalization = (fields, i18n = 'en-US') => {
    return _
      .chain(fields)
      .mapValues(v => v[i18n])
      .value()
  }

  this.createAsset = async function (args) {
    const env = await _this.getEnvironment()
    return env.createAsset(args)
  }
  this.createEntry = async function (args) {
    const env = await _this.getEnvironment()
    return env.createEntry(args)
  }
  this.createUpload = async function (args) {
    const env = await _this.getEnvironment()
    return env.createUpload(args)
  }
}

module.exports = Contentful
