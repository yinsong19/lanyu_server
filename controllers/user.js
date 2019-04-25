
const jwt = require('jsonwebtoken');

module.exports = app => {
  const model = app.model['user']
  const UserController = {}

  UserController.checkAccountExist = async(ctx) => {
    const { account } = ctx.request.body
    let isExisted = await model.findOne({ account }).catch(e=> ctx.throw(500))
    isExisted = !!isExisted

    if (isExisted) {
      ctx.body = ({code: 'no', message: '账户已存在'})
    } else {
      ctx.body = ({code: 'ok', message: '可以注册' })
    }
  }

  UserController.register = async ctx => {
    let { account, passwd, nickname, avatar, gender, bio } = ctx.request.body;
    if(!passwd){
      ctx.body = { code: 'no', message: '请输入密码'};
      return;
    } 
    passwd = app.service.encrypt(passwd);
    const result = await model.create({ account, passwd, nickname, avatar, gender, bio }).catch(e => {
      if (e){
        if(e.code === 11000){
          e.message = '该用户名已被注册'
        }
        ctx.body = { code: 'no', message: e.message , error: e}
      }
    })
    if(!!result) {
      const token = jwt.sign({ 
        id: result._id,
        account: result.account,
        nickname: result.nickname,
        avatar: result.avatar,
        gender: result.gender,
        bio: result.bio, 
        lastLoginAt: result.lastLoginAt,
        createAt: result.createAt
      }, 
      app.config.token.secret,
      { expiresIn: app.config.token.expires }
    )
      ctx.body = { code: 'ok', message: '注册成功' , data: token}
    }
  }

  UserController.updateById = async ctx => {
    const { id } = ctx.params
    let { action } = ctx.request.body
    
    if (!id) {
      ctx.throw(400, { message: '修改失败' })
    }

    switch (action) {
      // 修改头像
      case 'modifyUserInfo': 
        let { avatar, nickname, gender, bio } = ctx.request.body
        await model.findByIdAndUpdate(id, { avatar, nickname, gender, bio })
        ctx.body = ({ code: 'ok', message: '用户信息已修改' })
        break
      
      // 修改密码
      case 'modifyPasswd':
        let { oldPasswd, newPasswd, } = ctx.request.body
          
        if (!oldPasswd || !newPasswd) {
          ctx.throw(400, { message: '请输入密码' })
        }
    
        oldPasswd = app.service.encrypt(oldPasswd)
        const user = await model.findById(id)
    
        if (user.passwd !== oldPasswd) {
          ctx.throw(400, { message: '原密码错误' })
        } else {
          newPasswd = app.service.encrypt(newPasswd)
          await model.findByIdAndUpdate(id, { passwd: newPasswd })
          ctx.body = ({ code: 'ok', message: '修改成功，请重新登录' })
        }
        break
      
      // 修改账户
      case 'modifyAccount':
        let { account } = ctx.request.body
        let isExisted = await model.findOne({ account }).where('_id').ne(id)
        isExisted = !!isExisted
        if (isExisted) {
          ctx.throw(400, { message: '用户已存在' })
        } else {
          await model.findByIdAndUpdate(id, { account })
          ctx.body = ({ code: 'ok', message: '账户已修改' })
        }
        break
      
      default: 
        ctx.body = ({ code: 'ok', message: '未作修改' })
    }
  }

  UserController.login = async ctx => {
    let { account, passwd } = ctx.request.body;
    if(!passwd){
      ctx.body = { code: 'no', message: '请输入密码'};
      return;
    }
    passwd = app.service.encrypt(passwd);
    console.log("password", passwd)
    const user = await model.findOne({ account, passwd })

    if (!!user) {
      // 生成token
      const token = jwt.sign({ 
          id: user._id,
          account,
          nickname: user.nickname,
          avatar: user.avatar,
          gender: user.gender,
          bio: user.bio,
          lastLoginAt: user.lastLoginAt,
          createAt: user.createAt
        }, 
        app.config.token.secret,
        { expiresIn: app.config.token.expires }
      )
      const resdata = {
        token,
        id: user._id,
        account,
        nickname: user.nickname,
        avatar: user.avatar,
        gender: user.gender,
        bio: user.bio, 
        lastLoginAt: user.lastLoginAt,
        createAt: user.createAt
      }
      ctx.body = ({ code: 'ok', message: `登录成功`, data: resdata })
      // 更新最后登录时间
      await model.findByIdAndUpdate(user._id, { lastLoginAt: Date.now() })
    } else {
      ctx.body= ({ code: 'no', message: `账号或密码错误` })
    }
  }

  UserController.getUsers =  async (ctx) => {
    let { userId, page, pageSize } = ctx.query
    page = +page
    pageSize = +pageSize
    const skip = page === 0 ? 0 : (page - 1) * pageSize

    // const can = await app.service.isAdmin(userId)

    if (1) {
      const users = await model.find().limit(pageSize).skip(skip)
      const total = await model.find().count()
      ctx.body = ({ status: 'ok', message: '获取用户列表成功', data: { 
        items: users,
        total
      }})
    } else {
      ctx.throw(403, { message: '非管理员禁止查看用户列表' })
    }
  }

  UserController.deleteUser = async (ctx, next) => {
    let { userId, deleteUserId } = ctx.request.body
    const can = await app.service.isAdmin(userId)

    if (can) {
      await model.findByIdAndRemove(deleteUserId)
      ctx.body = ({ status: 'ok', message: '删除用户成功'})
    } else {
      ctx.throw(403, { message: '非管理员禁止删除用户' })
    }
  }

  // 是否已订阅
  UserController.isAlreadyOrder = async(ctx) => {
    const { userId, orderUserId } = ctx.request.body
    let user = await model.find({_id: userId, order: orderUserId}).catch(e=> ctx.throw(500))
    if (user.length) {
      ctx.body = ({code: 'ok', data: true})
    } else {
      ctx.body = ({code: 'ok', data: false })
    }
  }

  // 订阅
  UserController.orderUser = async ctx => {
    let { userId, orderUserId } = ctx.request.body

    const user = await model.findOne({_id: userId})

    if(user.order.includes(orderUserId)){
      ctx.body = ({code: 'no', message: '已订阅'})
    } else{
      const result = await model.update({_id: userId}, {
        $push: {
          order: orderUserId
      }
    })
      ctx.body = ({code: 'ok', message: '关注成功', data: result})
    }
  }

  // 查询用户订阅
  UserController.getUserOrder = async ctx =>{
    let { userId } = ctx.request.query
    const user = await model.findOne({_id: userId}).populate('order', '-passwd -order')
    ctx.body = ({code: 'ok', data: user.order})
  }

  // 取消订阅
  UserController.cancleUserOrder = async ctx =>{
    let { userId, cancleUserId } = ctx.request.body
    const result = await model.update({_id: userId}, {$pull: {
      order: cancleUserId
    }})
    ctx.body = ({code: 'ok', data: result})
  }

  return UserController
}
