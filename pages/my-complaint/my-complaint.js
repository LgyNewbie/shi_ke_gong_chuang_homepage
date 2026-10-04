const { request } = require('../../utils/api.js')

Page({

  data: {
    list: [],
    loading: true
  },

  onLoad() {
    this.loadComplaints()
  },

  onShow() {
    this.loadComplaints()
  },

  // =========================
  // 加载我的投诉
  // =========================

  async loadComplaints() {

    const loginUser = wx.getStorageSync('loginUser') || null

    if (!loginUser || !loginUser.isLogin) {
      this.setData({
        list: [],
        loading: false
      })
      return
    }

    this.setData({
      loading: true
    })

    try {

      const result = await request('/api/complaints/mine', {
        method: 'GET'
      })

      const list = Array.isArray(result)
        ? result
        : []

      const formattedList = list.map(item => {

        return {
          ...item,

          showDetail: false,

          statusText: this.getStatusText(item.status),

          statusClass: this.getStatusClass(item.status),

          images: Array.isArray(item.images)
            ? item.images
            : [],

          createdTime: this.formatTime(item.created_at),

          updatedTime: this.formatTime(item.updated_at),

          handleRemark: item.handle_remark || ''
        }

      })

      this.setData({
        list: formattedList,
        loading: false
      })

    } catch (error) {

      console.error('加载我的投诉失败：', error)

      this.setData({
        list: [],
        loading: false
      })

    }

  },


  // =========================
  // 投诉状态文字
  // =========================

  getStatusText(status) {

    const map = {
      pending: '待处理',
      processing: '处理中',
      resolved: '已解决',
      rejected: '已驳回'
    }

    return map[status] || '待处理'

  },


  // =========================
  // 投诉状态样式
  // =========================

  getStatusClass(status) {

    const map = {
      pending: 'pending',
      processing: 'processing',
      resolved: 'resolved',
      rejected: 'rejected'
    }

    return map[status] || 'pending'

  },


  // =========================
  // 时间格式
  // =========================

  formatTime(time) {

    if (!time) {
      return ''
    }

    return String(time)
      .replace('T', ' ')
      .replace(/\.\d+Z$/, '')

  },


  // =========================
  // 预览投诉图片
  // =========================

  previewImage(e) {

    const current = e.currentTarget.dataset.url
    const urls = e.currentTarget.dataset.urls || []

    if (!current) {
      return
    }

    wx.previewImage({
      current,
      urls
    })

  },


  // =========================
// 再次投诉
// =========================

reComplaint(e) {

  const complaint = e.currentTarget.dataset.item

  if (!complaint) {
    return
  }

  if (complaint.status !== 'rejected') {
    return
  }

  if (!complaint.order_id) {
    wx.showModal({
      title: '无法再次投诉',
      content: '这条投诉没有对应的订单信息，暂时无法再次提交投诉。',
      showCancel: false
    })

    return
  }

  wx.navigateTo({
    url:
      '/pages/complaint-create/complaint-create?orderId=' +
      complaint.order_id +
      '&reComplaint=1'
  })

},

  // =========================
  // 查看 / 收起投诉详情
  // =========================

  toggleDetail(e) {

    const index = Number(
      e.currentTarget.dataset.index
    )

    const list = [...this.data.list]

    if (!list[index]) {
      return
    }

    list[index].showDetail = !list[index].showDetail

    this.setData({
      list
    })

  },

  // =========================
  // 下拉刷新
  // =========================

  onPullDownRefresh() {

    this.loadComplaints()
      .finally(() => {
        wx.stopPullDownRefresh()
      })

  }

})