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
    show_books:false,
    info_value: '',
    book_list:[],
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 子页面的生命onshow  onhide 在这里处理
    onShowHideChange(show) {
      if (show) {
        console.log('page2 show')
      } else {
        console.log('page2 hide')
      }
    },
    infoSearch: function(event) {
      var that = this;
      const db = wx.cloud.database()
      const _ = db.command
      const book = db.collection('book_storage')
      book.where(_.or([{
          book_author: db.RegExp({
            regexp: this.data.info_value,
            option: 'i',
          })
        },
        {
          book_name: db.RegExp({
            regexp: this.data.info_value,
            option: 'i',
          })
        },
      ])).get({
        success: function(res) {
          console.log(res.data)
          that.setData({
            book_list:res.data,
            show_books:true,
          })
        }
      })
    },
    change_info_value: function(event) {
      this.setData({
        info_value: event.detail,
      })
    }
  }
})