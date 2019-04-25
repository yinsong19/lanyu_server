module.exports = app => {
  const model = app.model['comment']
  const userModel = app.model['user']
  const articleModel = app.model['article']

  const CommentController = {}

  CommentController.create = async ctx => {
    const req = ctx.request.body;
    const result = await model.create({...req, createAt: new Date()})
    return ctx.body = {code: 'ok', message: '发表成功', data: result};
  }

  CommentController.getComments = async ctx =>{
    let { articleId } = ctx.request.query;
    const result = await model.find({articleId}).populate('author', 'account nickname gender avatar');
    ctx.body = {code: 'ok', data: result};
  }

  CommentController.delete = async ctx => {
    let { commentId } = ctx.request.query;
    const result = await model.deleteOne({_id: commentId})
    return ctx.body = {code: 'ok', data: result};
  }

  return CommentController
}