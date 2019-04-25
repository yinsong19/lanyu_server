const user = require('./user');
const article = require('./article');
const comment = require('./comment')
const upload = require('./upload')

module.exports = app => ({
  user: user(app),
  article: article(app),
  comment: comment(app),
  upload: upload(app)
})