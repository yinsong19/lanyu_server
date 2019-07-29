const createEncrypt = require('./encrypt');
const marked = require('./marked')
const fastscan = require('./fastscan')
const isAdmin = require('./is-admin')
module.exports = config => {
  return {
    encrypt: createEncrypt(config),
    marked,
    fastscan,
    isAdmin
  };
}