// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  for (let index in event.books){
    var book_item = event.books[index]
    var isbn_value = book_item.book_isbn
    if(isbn_value != ''){
      console.log('-1')
      await db.collection('book_storage').where({
        book_isbn: isbn_value,
        book_storage: _.gt(0)
      }).update({
        data: {
          book_storage: _.inc(-1),
        }
      })
    }
  }
}