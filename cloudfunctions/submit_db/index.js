// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async(event, context) => {
  // console.log(event.books)
  var orders = []
  var myDate = new Date()
  var date_time = myDate.toLocaleString()
  for (let _item in event.books) {
    var item = event.books[parseInt(_item)]
    book_item = {
      'book_name': item.book_name,
      'book_sold_price': item.book_sold_price,
      'book_remarks': item.book_remarks,
    }
    orders.push(book_item)
  }
  // console.log(orders, date_time, event.price)
  return await db.collection('orders').add({
    data: {
      orders: orders,
      date_time: date_time,
      order_price: event.price,
      payWay:event.payWay,
    }
  })
}