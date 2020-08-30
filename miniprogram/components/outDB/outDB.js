import Dialog from '../../vant/dialog/dialog';
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  options: {
    styleIsolation: 'shared'
  },
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


  data: {
    book_index: 0,
    mian_container: true,
    add_book: true,
    show_submit_bar: true,
    show_info_page: false,
    show_cus_info_page: false,
    show_pop: false,
    show_pay_pop: false,
    // 1线上, 0线下
    payWay: 1,
    book_list: [],
    checkbox_able: true,
    checkbox_value: false,
    tmp_book: {
      book_isbn: '',
      book_name: '复印本',
      book_author: '无',
      book_description: '本书暂无版权信息，为自定义添加内容，等待添加中....',
      book_publisher: '无',
      book_price: '0.00元',
      book_sold_price: '0.00元',
      book_discout1: '0.00元',
      book_discout2: '0.00元',
      book_remarks: '无',
      book_img: '../../images/customize.gif',
    },
    // 记录得是选中得index编号
    check_result: [],
    total_price: 0.00,
  },


  methods: {
    onShowHideChange(show) {
      if (show) {
        console.log('page3 show')
      } else {
        console.log('page3 hide')
      }
    },
    onAdd: function() {
      this.setData({
        show_pop: true
      })
    },
    onClose: function() {
      this.setData({
        show_pop: false,
        show_pay_pop: false,
      });
    },
    scanAdd: function() {
      var that = this
      // 隐藏pop层
      this.setData({
        show_pop: false,
        checkbox_able: true,
      })
      // 调起扫码
      wx.scanCode({
        onlyFromCamera: true,
        scanType: ['barCode'],
        success: res => {
          console.log(res.result)
          that.check_storage(res.result, search_res => {
            // 有记录，有库存
            console.log(search_res)
            if (search_res.length > 0) {
              console.log('书目有库存')
              var bookinfo_json = search_res[0]
              var book = {
                book_isbn: bookinfo_json.book_isbn,
                book_name: bookinfo_json.book_name,
                book_author: bookinfo_json.book_author,
                book_price: bookinfo_json.book_price,
                book_description: bookinfo_json.book_description,
                book_publisher: bookinfo_json.book_publisher,
                book_img: bookinfo_json.book_img,
                book_publish_time: bookinfo_json.book_publish_time,
                book_sold_price: bookinfo_json.book_discout1,
                book_discout1: bookinfo_json.book_discout1,
                book_discout2: bookinfo_json.book_discout2,
                book_storage: bookinfo_json.book_storage,
                book_num: 1,
                book_index: this.data.book_index
              }
              that.setData({
                mian_container: false,
                show_submit_bar: false,
                show_info_page: true,
                tmp_book: book,
                add_book: false,
              })
            }
            // 数据库无记录
            else {
              Dialog.alert({
                context: this,
                selector: '#van-dialog',
                title: '错误',
                message: '该图书未录入，请使用自定义添加'
              }).then(() => {
                this.setData({})
                // on close
              });
            }
          })
        }
      })
    },
    change_info_value: function(event) {
      this.setData({
        info_value: event.detail,
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
    backPage: function() {
      this.setData({
        add_book: true,
        show_info_page: false,
        show_submit_bar: true,
        mian_container: true,
        checkbox_value: false,
        checkbox_able: true,
      })
    },
    submitData: function() {
      this.setData({
        ['tmp_book.book_index']: this.data.book_index
      })
      this.data.book_list.push(this.data.tmp_book)
      this.data.check_result.push(this.data.tmp_book.book_index + "")
      var book = {
        book_isbn: '',
        book_name: '复印本',
        book_author: '无',
        book_description: '本书暂无版权信息，为自定义添加内容，等待添加中....',
        book_publisher: '无',
        book_price: '0.00元',
        book_sold_price: '0.00元',
        book_discout1: '0.00元',
        book_discout2: '0.00元',
        book_remarks: '无',
        book_img: '../../images/customize.gif',
        book_index: this.data.book_index,
      }
      this.setData({
        add_book: true,
        book_index: this.data.book_index + 1,
        book_list: this.data.book_list,
        check_result: this.data.check_result,
        show_info_page: false,
        show_submit_bar: true,
        mian_container: true,
        tmp_book: book,
        checkbox_value: false,
        checkbox_able: true,
      })
      this.calc()
    },
    check_Change: function(event) {
      this.setData({
        check_result: event.detail
      });
      this.calc()
    },
    calc: function() {
      var tmp_price = 0.00
      // 显示当前结算订单
      console.log('选中订单', this.data.check_result)
      console.log('书列表', this.data.book_list)
      for (var item in this.data.check_result) {
        var book_item = this.data.book_list[parseInt(this.data.check_result[item])]
        console.log(book_item)
        tmp_price = tmp_price + parseFloat(book_item.book_sold_price.replace('元', ''))
      }
      this.setData({
        total_price: tmp_price * 100,
      })
    },
    customizeAdd: function() {
      this.setData({
        add_book: false,
        show_pop: false,
        mian_container: false,
        show_submit_bar: false,
        show_info_page: true,
        checkbox_value: false,
        checkbox_able: false,
      })
    },
    bookChange: function(event) {
      this.setData({
        ['tmp_book.book_name']: event.detail
      })
    },
    authorChange: function(event) {
      this.setData({
        ['tmp_book.book_author']: event.detail
      })
    },
    publisherChange: function(event) {
      this.setData({
        ['tmp_book.book_publisher']: event.detail
      })
    },
    priceChange: function(event) {
      this.setData({
        ['tmp_book.book_price']: event.detail
      })
    },
    soldChange: function(event) {
      this.setData({
        ['tmp_book.book_sold_price']: event.detail
      })
    },
    remarksChange: function(event) {
      this.setData({
        ['tmp_book.book_remarks']: event.detail
      })
    },
    submitClick: function() {
      this.setData({
        show_pay_pop: true,
      })
    },
    submitDeal: function() {
      this.setData({
        show_pay_pop: false,
      })
      var msg = ''
      var book_data = []
      for (let item in this.data.check_result) {
        var book_item = this.data.book_list[parseInt(item)]
        book_data.push(book_item)
        console.log(book_item.book_name, book_item.book_sold_price)
        var book_name = book_item.book_name.length > 8 ? book_item.book_name.substring(0, 7) + '..' : book_item.book_name
        msg = msg + book_name + '  x1  ' + book_item.book_sold_price + '\n'
      }
      msg = msg + '\n总价  ' + (this.data.total_price / 100).toFixed(2) + '元'
      // 信息确认
      Dialog.confirm({
        context: this,
        title: this.data.payWay == 1 ? '线上订单' : '现金订单',
        message: msg,
        selector: "#van-dialog"
      }).then(() => {
        // 调整库存
        wx.cloud.callFunction({
          name: 'adjust_db',
          data: {
            books: book_data,
          },
          success: res => {
            console.log('callFunction adjust_db result: ', res)
            // 订单入库
            wx.cloud.callFunction({
              name: 'submit_db',
              data: {
                books: book_data,
                price: (this.data.total_price / 100).toFixed(2) + '元',
                payWay: this.data.payWay
              },
              success: res => {
                wx.showToast({
                  icon: 'success',
                  title: '订单已提交',
                  duration: 1000
                })
                this.dataReset()
                console.log('callFunction submit_db result: ', res)
              },
            })
          },
        })
      }).catch(() => {
        // on cancel
      });
    },
    payonline: function() {
      this.setData({
        payWay: 1,
      })
      this.submitDeal()
    },
    paycash: function() {
      this.setData({
        payWay: 0,
      })
      this.submitDeal()
    },
    checkboxValueChange: function(event) {
      this.setData({
        checkbox_value: event.detail
      })
      if (this.data.checkbox_value) {
        this.setData({
          ['tmp_book.book_sold_price']: this.data.tmp_book.book_discout2,
          ['tmp_book.book_remarks']: '二折出售'
        })
      } else {
        this.setData({
          ['tmp_book.book_sold_price']: this.data.tmp_book.book_discout1,
          ['tmp_book.book_remarks']: ''
        })
      }
    },
    // tmpBookReset:function(){

    // },
    dataReset:function(){
      this.setData({
        book_index: 0,
        mian_container: true,
        add_book: true,
        show_submit_bar: true,
        show_info_page: false,
        show_cus_info_page: false,
        show_pop: false,
        show_pay_pop: false,
        // 1线上, 0线下
        payWay: 1,
        book_list: [],
        checkbox_able: true,
        checkbox_value: false,
        tmp_book: {
          book_isbn: '',
          book_name: '复印本',
          book_author: '无',
          book_description: '本书暂无版权信息，为自定义添加内容，等待添加中....',
          book_publisher: '无',
          book_price: '0.00元',
          book_sold_price: '0.00元',
          book_discout1: '0.00元',
          book_discout2: '0.00元',
          book_remarks: '无',
          book_img: '../../images/customize.gif',
        },
        // 记录得是选中得index编号
        check_result: [],
        total_price: 0.00,
      })
    }
  }
})