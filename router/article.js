module.exports = (app, router) => {
  const prefix = app.config.router.prefix;
  const controller = app.controller.article;

  router.post('/article/create', controller.create);
  router.get('/article/detail', controller.getArticleById);
  router.get('/article/feedAll', controller.getAllArticles);
  router.get('/article/feedOrder', controller.getOrderArticles);
  router.get('/article/feedHot', controller.getHotArticles);
  router.get('/article/feed', controller.getUserArticles)
  // router.post('/user/check', controller.checkAccountExist);
  // router.post(`/user/register`, controller.register);
  router.post(`/article/like`, controller.likeArticle);
  router.post(`/article/unlike`, controller.unlikeArticle);
  router.put('/article/edit', controller.updateById);
}