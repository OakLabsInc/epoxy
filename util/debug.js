const debug = require('debug')('epoxy')
debug.log = console.log.bind(console)
module.exports = debug
