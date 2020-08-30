import Dialog from '../../vant/dialog/dialog';
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    height: {
      type: Number,
      value: app.homePageHeight
    },
    onShow: {
      type: Boolean,
      value: false,
      observer: 'onShowHideChange'
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    show_scan_page: true,
    show_loading_page: false,
    show_info_page: false,
    show_finish_page: false,
    steps_index: 0,
    isbn_value: '',
    book_name: '',
    book_author: '',
    book_publisher: '',
    book_price: '',
    book_description: '',
    book_img: '',
    book_publish_time: '',
    book_discout1: '',
    book_discout2: '',
    book_remarks: '暂无备注信息',
    steps: [{
        text: '步骤一',
        desc: '扫描isbn'
      },
      {
        text: '步骤二',
        desc: '补充图书信息'
      },
      {
        text: '步骤三',
        desc: '入库成功'
      }
    ],
    book_storage: null,
    is_in_storage: false,
  },

  /**
   * 组件的方法列表
   */

  methods: {
    // 子页面的生命onshow  onhide 在这里处理
    onShowHideChange(show) {
      if (show) {
        console.log('page1 show')
      } else {
        console.log('page1 hide')
      }
    },
    scanCode(event) {
      var that = this;
      wx.scanCode({
        onlyFromCamera: true,
        scanType: ['barCode'],
        success: res => {
          that.setData({
            show_loading_page: true,
            isbn_value: res.result
          })
          var search_result
          that.check_storage(res.result, search_res => {
            console.log('本地数据库查询结果',res.result)
            // 判断是否在库存中
            if (search_res.length > 0) {
              console.log("本地查询结果 > 0")
              var bookinfo_json = search_res[0]
              console.log(bookinfo_json)
              try {
                that.setData({
                  is_in_storage: true,
                  book_short_name: bookinfo_json.book_name,
                  book_name: bookinfo_json.book_name,
                  book_author: bookinfo_json.book_author,
                  book_price: bookinfo_json.book_price,
                  book_description: bookinfo_json.book_description,
                  book_publisher: bookinfo_json.book_publisher,
                  book_img: bookinfo_json.book_img,
                  book_publish_time: bookinfo_json.book_publish_time,
                  book_discout1: bookinfo_json.book_discout1,
                  book_discout2: bookinfo_json.book_discout2,
                  book_storage: bookinfo_json.book_storage,
                  show_scan_page: false,
                  show_loading_page: false,
                  show_info_page: true,
                  steps_index: 1,
                });
              } catch (err) {
                console.log(err)
                that.setData({
                  show_loading_page: false
                })
                wx.showToast({
                  icon: 'loading',
                  title: '网络错误，请重试',
                  duration: 1000
                })
              }
            } else {
              console.log("本地查询结果 = 0")
              that.setData({
                is_in_storage: false,
              })
              wx.cloud.callFunction({
                name: 'bookinfo',
                data: {
                  isbn: res.result
                },
                success: res => {
                  console.log('接口查询结果：',res.result)
                  var bookinfo = res.result;
                  var bookinfo_json = JSON.parse(bookinfo);
                  console.log(bookinfo_json);
                  try {
                    that.setData({
                      book_short_name: bookinfo_json.title.split('——')[0],
                      book_name: bookinfo_json.title,
                      book_author: bookinfo_json.author[0] ? bookinfo_json.author[0] : '暂无作者信息',
                      book_price: bookinfo_json.price,
                      book_description: bookinfo_json.summary.length >= 20 ? bookinfo_json.summary.slice(0, 20) + '...' : bookinfo_json.summary,
                      book_publisher: bookinfo_json.publisher,
                      book_img: bookinfo_json.image,
                      book_publish_time: bookinfo_json.pubdate,
                      book_discout1: (parseFloat(bookinfo_json.price.replace('元', '')) * 0.3).toFixed(2) + "元",
                      book_discout2: (parseFloat(bookinfo_json.price.replace('元', '')) * 0.2).toFixed(2) + "元",
                      show_scan_page: false,
                      show_loading_page: false,
                      show_info_page: true,
                      steps_index: 1,
                    });
                  } catch (err) {
                    console.log(err)
                    that.setData({
                      show_loading_page: false
                    })
                    wx.showToast({
                      icon: 'loading',
                      title: '网络错误，请重试',
                      duration: 1000
                    })
                  }
                },
                fail: err => {
                  console.log(err)
                }
              });
            }
          })
        },
        fail: err => {
          console.log(err)
        },
      });
    },
    onSearch: function(event) {
      var that = this;
      console.log(this.data.isbn_value)
      this.setData({
        show_loading_page: true,
      })
      wx.cloud.callFunction({
        name: 'bookinfo',
        data: {
          isbn: that.data.isbn_value
        },
        success: res => {
          console.log('this is the result')
          console.log(res.result)
          var bookinfo = res.result;
          var bookinfo_json = JSON.parse(bookinfo);
          console.log(bookinfo_json);
          try {
            that.setData({
              book_short_name: bookinfo_json.title.split('——')[0],
              book_name: bookinfo_json.title,
              book_author: bookinfo_json.author[0] ? bookinfo_json.author[0] : '暂无作者信息',
              book_price: bookinfo_json.price,
              book_description: bookinfo_json.summary.length >= 40 ? bookinfo_json.summary.slice(0, 40) + '...' : bookinfo_json.summary,
              book_publisher: bookinfo_json.publisher,
              book_img: bookinfo_json.image,
              book_publish_time: bookinfo_json.pubdate,
              book_discout1: (parseFloat(bookinfo_json.price.replace('元', '')) * 0.3).toFixed(2) + "元",
              book_discout2: (parseFloat(bookinfo_json.price.replace('元', '')) * 0.2).toFixed(2) + "元",
              show_scan_page: false,
              show_loading_page: false,
              show_info_page: true,
              steps_index: 1,
            });
          } catch (err) {
            that.setData({
              show_loading_page: false
            })
            wx.showToast({
              icon: 'loading',
              title: '网络错误，请重试',
              duration: 1000
            })
          }
        }
      })
    },
    backPage: function() {
      var that = this;
      Dialog.confirm({
        title: '提醒',
        message: '是否取消提交',
        selector: '#confirm_dialog',
        context: this,
      }).then(() => {
        that.setData({
          steps_index:0,
          show_info_page: false,
          show_scan_page: true
        })
      }).catch(() => {
        console.log("取消");
      });
    },
    submitData: function() {
      var that = this;
      const db = wx.cloud.database()
      const book = db.collection('bookdb')
      const book_storage = db.collection('book_storage')
      Dialog.confirm({
        title: '提醒',
        message: '是否确认提交',
        selector: '#submit_dialog',
        context: this,
      }).then(() => {
        // 先入库bookinfo
        book.add({
          data: {
            book_isbn: that.data.isbn_value,
            book_name: that.data.book_name,
            book_author: that.data.book_author,
            book_publisher: that.data.book_publisher,
            book_price: that.data.book_price,
            book_description: that.data.book_description,
            book_img: that.data.book_img,
            book_publish_time: that.data.book_publish_time,
            book_remarks: that.data.book_remarks,
            book_discout1: that.data.book_discout1,
            book_discout2: that.data.book_discout2,
          }
        }).then(() => {
          console.log('insert success!'),
            that.setData({
              steps_index: 2,
              show_info_page: false,
              show_finish_page: true,
            })
          console.log(that.data.is_in_storage)
          // 如果该数据已有记录
          if (that.data.is_in_storage) {
            // storage 库存 + 1
            wx.cloud.callFunction({
              name: 'search_db',
              data: {
                isbn_value:that.data.isbn_value,
                book_storage: that.data.book_storage
              },
              success: res => {
                console.log('update success!')
              },
              fail: err => {
                console.log(err)
              }
            });
          } else {
            // storage 创建对应记录
            book_storage.add({
              data: {
                book_isbn: that.data.isbn_value,
                book_name: that.data.book_name,
                book_author: that.data.book_author,
                book_publisher: that.data.book_publisher,
                book_price: that.data.book_price,
                book_description: that.data.book_description,
                book_img: that.data.book_img,
                book_publish_time: that.data.book_publish_time,
                book_remarks: that.data.book_remarks,
                book_discout1: that.data.book_discout1,
                book_discout2: that.data.book_discout2,
                book_storage: 1,
              }
            }).then(() =>
                console.log("storage insert success!"))
          }
        }).catch(err =>
          console.log(err)
        )
      })
    },
    oneMore: function() {
      this.setData({
        show_finish_page: false,
        show_scan_page: true,
        steps_index: 0
      })
    },
    check_storage: function(isbn, callback) {
      console.log("check_storage has called")
      const db = wx.cloud.database()
      const _ = db.command
      const book = db.collection('book_storage')
      book.where({
        book_isbn: isbn,
      }).get({
        success: res => {
          callback(res.data)
        }
      })
    },
    change_book_name:function(event){
      this.setData({
        book_name: event.detail
      })
    },
    change_book_author: function (event) {
      this.setData({
        book_author: event.detail
      })
    },
    change_book_publisher: function (event) {
      this.setData({
        book_publisher: event.detail
      })
    },
    change_book_publish_time: function (event) {
      this.setData({
        book_publish_time: event.detail
      })
    },
    change_book_price: function (event) {
      this.setData({
        book_price: event.detail
      })
    },
    change_book_remarks: function (event) {
      this.setData({
        book_remarks:event.detail
      })
    },
  }
})