const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  id: Number,
  account: {                         // 账户
    type:String,
    unique: true
  },                   
  passwd: {                          // 密码    
    type: String,
    required: true
  },
  nickname: {
    type: String,
    required: true
  }, 
  avatar: {                          // 头像
    type: String,
    default: 'https://jdc.jd.com/img/200'
  },
  gender: {
    type: String,
    default: '保密'
  },
  bio: {
    type: String,
    default: ''
  },
  lastLoginAt: {                     // 上次登录时间
    type: Date,
    default: Date.now()
  },
  createAt: {                        // 注册日期
    type: Date,
    default: Date.now()
  },
  collect:[{                          // 收藏 
    type: Schema.Types.ObjectId,
    ref: 'Article'
  }],
  order:[{                        // 订阅用户
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
})

userSchema.index({ id: 1 })

const User = mongoose.model('User', userSchema)

module.exports = User