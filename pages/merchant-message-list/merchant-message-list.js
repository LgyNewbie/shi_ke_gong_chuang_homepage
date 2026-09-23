const {
  getMessages
} = require('../../utils/message.js')

Page({
  data: {

    tabs: [
      {
        id: 'all',
        name: '全部'
      },
      {
        id: 'pending',
        name: '待处理'
      },
      {
        id: 'review',
        name: '正在评估'
      },
      {
        id: 'accepted',
        name: '已采纳'
      },
      {
        id: 'rejected',
        name: '暂不采纳'
      },
      {
        id: 'poll',
        name: '已转投票'
      }
    ],

    currentTab: 'all',

    messages: [],

    filteredMessages: [],

    allCount: 0,
    pendingCount: 0,
    reviewCount: 0,
    acceptedCount: 0
  },


  onShow() {
    this.loadMessages()
  },


  // =========================
  // 加载留言
  // =========================

  loadMessages() {
    const messages =
      getMessages()

    this.setData({
      messages
    }, () => {

      this.updateStats()

      this.filterMessages()

    })
  },


  // =========================
  // 统计
  // =========================

  updateStats() {
    const messages =
      this.data.messages

    this.setData({

      allCount:
        messages.length,

      pendingCount:
        messages.filter(
          item => item.status === 'pending'
        ).length,

      reviewCount:
        messages.filter(
          item => item.status === 'review'
        ).length,

      acceptedCount:
        messages.filter(
          item => item.status === 'accepted'
        ).length

    })
  },


  // =========================
  // 切换分类
  // =========================

  switchTab(e) {
    const id =
      e.currentTarget.dataset.id

    this.setData({
      currentTab: id
    }, () => {

      this.filterMessages()

    })
  },


  filterMessages() {
    const tab =
      this.data.currentTab

    let result =
      this.data.messages

    if (tab !== 'all') {

      result =
        this.data.messages.filter(
          item => item.status === tab
        )

    }

    this.setData({
      filteredMessages: result
    })
  },


  // =========================
  // 去处理留言
  // =========================

  openMessage(e) {
    const id =
      e.currentTarget.dataset.id

    if (!id) {
      wx.showToast({
        title: '留言不存在',
        icon: 'none'
      })

      return
    }

    wx.navigateTo({
      url:
        `/pages/merchant-message/merchant-message?id=${id}`
    })
  },

  createPoll(e) {
    const id =
      e.currentTarget.dataset.id
  
    if (!id) {
      wx.showToast({
        title: '留言不存在',
        icon: 'none'
      })
  
      return
    }
  
    wx.navigateTo({
      url:
        `/pages/merchant-poll-create/merchant-poll-create?id=${id}`
    })
  },

})