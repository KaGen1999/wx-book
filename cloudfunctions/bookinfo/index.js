var rq = require('request-promise')
// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
// 云函数入口函数
exports.main = async(event, context) => {
  var res = rq('http://douban.uieee.com/v2/book/isbn/' + event.isbn).then(html => {
    return html;
  }).catch(err => {
    console.log(err);
  })
  return res
}