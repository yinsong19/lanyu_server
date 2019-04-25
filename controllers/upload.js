
const qn = require('qn')
const configs = require('../config/qiniu')
const fs = require('fs')

module.exports = app => {
  const UploadController = {}
  
  UploadController.upload = async ctx =>{    
    const { img } = ctx.request.files
    const bucket = 'lanyu_qiniu';
    const client = qn.create({
      accessKey: configs.AK,
      secretKey: configs.SK,
      bucket,
      origin: `pq9eqz2us.bkt.clouddn.com`,
    });
    const imgStream = fs.createReadStream(img.path)
    const imgUrl = await new Promise(resolve => {
      client.upload(imgStream, function (err, result) {
        if(err){
          console.log(err);
        }
        resolve(result.url)
      })
    })
    ctx.body = ({code: 'ok', data: {img_url: `http://${imgUrl}`} })
  }

  return UploadController
}
