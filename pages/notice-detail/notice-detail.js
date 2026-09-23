const {
  getNoticeById
} = require('../../utils/notice.js')

Page({
  data: {
    noticeId: '',
    notice: null
  },

  onLoad(options) {
    const id = options.id || ''

    this.setData({
      noticeId: id
    })

    this.loadNotice()
  },

  onShow() {
    if (this.data.noticeId) {
      this.loadNotice()
    }
  },

  loadNotice() {
    const notice = getNoticeById(this.data.noticeId)

    if (!notice) {
      this.setData({
        notice: null
      })

      wx.showToast({
        title: '公告不存在',
        icon: 'none'
      })

      return
    }

    this.setData({
      notice
    })
  },

  goBack() {
    wx.navigateBack()
  }
})