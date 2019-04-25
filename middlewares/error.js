module.exports = () => async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    const status = err.statusCode || err.status || 500;
    console.log(err)
    ctx.body = {
      code: status === 401 ? 'unlogin' : err.code,
      message: status === 401 ? '未登录或登录过期，请重新登录' : err.message
    };
  }
}