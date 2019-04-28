const withActions = require('./common-actions');
module.exports = app => {
  const model = app.model['article']
  const userModel = app.model['user']

  const ArticleController = withActions(model)({})
  ArticleController.create = async ctx => {
    const req = ctx.request.body;
    const { hits } = app.service.fastscan(req.content)
    if(JSON.stringify(hits) != '{}'){
      return ctx.body = {code: 'no', message: '含有敏感词汇，请修改后发布'};
    } else{
      const { html, toc } = app.service.marked(req.content)
      const result = await model.create({...req, html, toc, createAt: new Date()})
      return ctx.body = {code: 'ok', data: result};
    }
  }

  ArticleController.getArticleById = async ctx =>{
    let {id} = ctx.request.query;
    const result = await model.findById(id).populate('author', '-passwd');
    await model.update({_id: id}, {$inc:{ readingQuantity: 1 }})
    ctx.body = {code: 'ok', data: result};
  }

  // 更新文章
  ArticleController.updateById = async ctx => {
    const req = ctx.request.body;
    const id = req.id
    const userId = req.userId || '';
    const targetArticle = await model.findById(id);
    const { hits } = app.service.fastscan(req.content);
    if ( !userId || targetArticle.author != userId ) {
      ctx.throw(400, { message: '非文章作者' })
    }
    delete req.id;
    delete req.userId;

    if (req.content) {
      const { html, toc } = app.service.marked(req.content);
      req.html = html;
      req.toc = toc;
    }
    
    if(JSON.stringify(hits) != '{}'){
      return ctx.body = {code: 'no', message: '含有敏感词汇，请修改后发布'};
    } else{
      await model.update({_id: id}, {...req, updateAt: new Date()});
      const result = await model.findById(id);
      ctx.body = { status: 'ok', message: '修改成功!', data: result };
    }
  }


  /**
   * 获取文章(按时间)
   * @param {*} ctx 
   */
  ArticleController.getAllArticles = async ctx => {
    let { page=0 } = ctx.request.query;
    let Articles = [];

    let articles = await model.find().populate('author', '-passwd -_id').skip(page * 10).limit(10).sort({'_id':-1});

    Articles.push.apply(Articles, articles);

    ctx.body = { code: 'ok', data: Articles , next_page: Number(page) + 1};
  }

  /**
   * 获取订阅用户文章(按时间)
   * @param {*} ctx 
   */
  ArticleController.getOrderArticles = async ctx => {
    let { page, userId } = ctx.request.query;
    let Articles = [];
    
    let user = await userModel.findOne({_id: userId})
    let articles = await model.find({author:{ $in: user.order }}).populate('author', '-passwd -_id').skip(page * 10).limit(10).sort({'_id':-1});
    Articles.push.apply(Articles, articles);

    ctx.body = { code: 'ok', data: Articles, next_page: Number(page) + 1 };
  }
  
  /**
   * 获取热门文章(按时间)
   * @param {*} ctx 
   */
  ArticleController.getHotArticles = async ctx => {
    let { page } = ctx.request.query;
    let Articles = [];
    
    let articles = await model.find({hot: true}).populate('author', '-passwd -_id').skip(page * 10).limit(10).sort({'_id':-1});
    Articles.push.apply(Articles, articles);

    ctx.body = { code: 'ok', data: Articles, next_page: Number(page) + 1 };
  }

    /**
   * 获取指定用户文章(按时间)
   * @param {*} ctx 
   */
  ArticleController.getUserArticles = async ctx => {
    let { page, userId } = ctx.request.query;
    let Articles = [];
    
    let articles = await model.find({author: userId}).populate('author', '-passwd').skip(page * 10).limit(10).sort({'_id':-1});
    Articles.push.apply(Articles, articles);

    ctx.body = { code: 'ok', data: Articles, next_page: Number(page) + 1 };
  }

  /**
   * 用户点赞文章
   * @param {*} ctx 
   */
  ArticleController.likeArticle = async ctx => {
    let { userId, articleId } = ctx.request.body;
    let article = await model.find({_id: articleId, likeUser: userId});
    if(!article.length){
      let result = await model.update({_id: articleId}, {$push: {
        likeUsers: userId
      }});
      ctx.body = { code: 'ok', data: result };
    } else{
      ctx.body = { code: 'ok', message: '已经点赞过了' };
    }
  }

  /**
   * 用户取消点赞文章
   * @param {*} ctx 
   */
  ArticleController.unlikeArticle = async ctx =>{
    let { userId, articleId } = ctx.request.body;
    
    let result = await model.update({_id: articleId}, {$pull: {
      likeUsers: userId
    }});

    ctx.body = { code: 'ok', data: result };
  }

    /**
   * 用户删除文章
   * @param {*} ctx 
   */
  ArticleController.deleteArticle = async ctx =>{
    let { userId, articleId } = ctx.request.body;
    
    let result = await model.deleteOne({_id: articleId, author: userId});
    ctx.body = { code: 'ok', data: result };
  }

  return ArticleController
}