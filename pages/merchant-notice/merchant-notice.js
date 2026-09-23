const {
  getNotices,
  addNotice,
  deleteNotice
} = require('../../utils/notice.js')

Page({
  data: {
    notices: [],

    showForm: false,

    title: '',
    type: '通知',
    content: ''
  },

  onLoad() {
    this.loadNotices()
  },

  onShow() {
    this.loadNotices()
  },

  // 加载公告
  loadNotices() {
    const notices = getNotices()

    this.setData({
      notices
    })
  },

  // 返回
  goBack() {
    wx.navigateBack()
  },

  // 打开发布表单
  openForm() {
    this.setData({
      showForm: true,
      title: '',
      type: '通知',
      content: ''
    })
  },

  // 关闭发布表单
  closeForm() {
    this.setData({
      showForm: false
    })
  },

  // 输入标题
  inputTitle(e) {
    this.setData({
      title: e.detail.value
    })
  },

  // 输入类型
  inputType(e) {
    this.setData({
      type: e.detail.value
    })
  },

  // 输入正文
  inputContent(e) {
    this.setData({
      content: e.detail.value
    })
  },

  // 发布公告
  publishNotice() {
    const title = this.data.title.trim()
    const type = this.data.type.trim() || '通知'
    const content = this.data.content.trim()

    if (!title) {
      wx.showToast({
        title: '请输入公告标题',
        icon: 'none'
      })
      return
    }

    if (!content) {
      wx.showToast({
        title: '请输入公告内容',
        icon: 'none'
      })
      return
    }

    const now = new Date()

    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')

    const notice = {
      id: `notice_${Date.now()}`,
      title,
      content,
      type,
      author: '餐厅官方',
      time: `${year}-${month}-${day}`,
      createTime: `${year}-${month}-${day}`
    }

    addNotice(notice)

    this.setData({
      showForm: false,
      title: '',
      type: '通知',
      content: ''
    })

    this.loadNotices()

    wx.showToast({
      title: '公告发布成功',
      icon: 'success'
    })
  },

  // 查看公告
  openDetail(e) {
    const id = e.currentTarget.dataset.id

    if (!id) {
      return
    }

    wx.navigateTo({
      url: `/pages/notice-detail/notice-detail?id=${id}`
    })
  },

  // 删除公告
  deleteNotice(e) {
    const id = e.currentTarget.dataset.id

    if (!id) {
      return
    }

    wx.showModal({
      title: '删除公告',
      content: '确定要删除这条公告吗？',
      success: (res) => {
        if (!res.confirm) {
          return
        }

        deleteNotice(id)

        this.loadNotices()

        wx.showToast({
          title: '已删除',
          icon: 'success'
        })
      }
    })
  }
})