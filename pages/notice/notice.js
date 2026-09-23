const {
  getNotices
} = require('../../utils/notice.js')

Page({
  data: {
    notices: []
  },

  onLoad() {
    this.loadNotices()
  },

  onShow() {
    this.loadNotices()
  },

  loadNotices() {
    const notices = getNotices()

    this.setData({
      notices
    })
  },

  goBack() {
    wx.navigateBack()
  },

  openDetail(e) {
    const id = e.currentTarget.dataset.id

    if (!id) {
      wx.showToast({
        title: '公告不存在',
        icon: 'none'
      })
      return
    }

    wx.navigateTo({
      url: `/pages/notice-detail/notice-detail?id=${id}`
    })
  }
})