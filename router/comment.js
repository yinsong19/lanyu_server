module.exports = (app, router) => {
  const prefix = app.config.router.prefix;
  const controller = app.controller.comment;

  router.post('/comment/create', controller.create);
  router.get('/comment/comments', controller.getComments);
}