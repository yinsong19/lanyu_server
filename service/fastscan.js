const FastScanner = require('fastscan')

var words = ["今日头条", "微信", "支付宝"]
var scanner = new FastScanner(words)

module.exports = content => {
    var offWords = scanner.search(content)
    var hits = scanner.hits(content, {quick: true})
    // 返回解析内容
    return { offWords, hits };
  }