const createEncrypt = require('./encrypt');
const marked = require('./marked')
const fastscan = require('./fastscan')
module.exports = config => {
  return {
    encrypt: createEncrypt(config),
    marked,
    fastscan
  };
}