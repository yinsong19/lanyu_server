const router = require('koa-router')()
const user = require('./user');
const article = require('./article')
const comment = require('./comment')
const upload = require('./upload')

module.exports = function withRouter(app) {
  const prefix = app.config.router.prefix;
  router.prefix(prefix);

  user(app, router);
  article(app, router);
  comment(app, router);
  upload(app, router);
  app.use(router.routes()).use(router.allowedMethods());
};