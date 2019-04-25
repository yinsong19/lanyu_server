const mongoose = require('mongoose')
const Schema = mongoose.Schema

const commentSchema = new Schema({
  id: Number,
  content: {                          // 评论内容
    type: String,
    require: true
  },
  articleId : {                        // 评论文章
    type: Schema.Types.ObjectId,
    ref: 'Article',
    required: true
  },
  author: {                            // 评论者
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createAt: {                          // 创建日期
    type: Date,
    default: Date.now()
  }
})

commentSchema.index({ id: 1 })

const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment