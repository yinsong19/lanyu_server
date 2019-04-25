module.exports = (app, router) => {
  const prefix = app.config.router.prefix;
  const controller = app.controller.upload;

  router.post('/upload/upload', controller.upload);
}