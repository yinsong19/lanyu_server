const cors = require('koa2-cors');
const koaBody = require('koa-body');
const koaJwt = require('koa-jwt');
const error = require('./error');

module.exports = app => {
  const secret = app.config.token.secret;
  const unlesses = app.config.token.unlesses || [];
  
  console.log(unlesses);

  app.use(error());
  app.use(cors({
    origin: function(ctx) {
      if (ctx.url === '/test') {
        return false;
      }
      return '*';
  }}));
  app.use(koaJwt({secret}).unless({path: unlesses}));
  app.use(koaBody({
    multipart:true,
    formidable: {
      maxFileSize: 2000*1024*1024    // 设置上传文件大小最大限制，默认2M
    }
}));
}