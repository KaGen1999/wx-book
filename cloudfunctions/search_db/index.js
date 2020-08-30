// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async(event, context) => {
  await db.collection('book_storage').where({
    book_isbn: event.isbn_value
  }).update({
    data: {
      book_storage: event.book_storage + 1,
    }
  })
}