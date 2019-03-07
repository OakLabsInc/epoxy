const _ = require('lodash')
const {createClient} = require('contentful-management')

var Contentful = function (config) {
  let _this = this

  // create one shared client between all Contentful instances
  this.client = createClient({
    accessToken: config.contentful.token
  })

  this.getSpace = function () {
    let space = _this.client.getSpace(
      config.contentful.space_id
    )
    return space
  }

  this.getResource = function ({sys}) {
    return sys.contentType.sys.id
  }

  this.getId = function ({sys: {id}}) {
    return id
  }

  this.getEntry = async function (id) {
    return _this.client
      .getSpace(
        config.contentful.space_id
      )
      .then(space => space.getEntry(id))
  }

  // TODO: handle deprecation warning
  // https://contentful.github.io/contentful-management.js/contentful-management/latest/ContentfulEnvironmentAPI.html#.getAsset
  this.getAsset = async function (id) {
    return _this.client
      .getSpace(
        config.contentful.space_id
      )
      .then(space => space.getAsset(id))
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
}

module.exports = Contentful
