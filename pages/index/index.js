const {
  getMessages
} = require('../../utils/message.js')

const {
  getNotices
} = require('../../utils/notice.js')


function getCurrentPoll() {
  return wx.getStorageSync('weeklyPoll') || null
}


Page({
  data: {
    messages: [],
    weeklyPoll: null,
    polls: [],
    notices: []
  },


  onLoad() {
    this.loadMessages()
    this.loadPoll()
    this.loadNotices()
  },


  onShow() {
    this.loadMessages()
    this.loadPoll()
    this.loadNotices()
  },


  // =========================
  // 食客留言
  // =========================
  loadMessages() {
    const messages = getMessages()

    this.setData({
      messages: messages.slice(0, 3)
    })
  },


  // 点击留言
  openMessageDetail(e) {
    const id = e.currentTarget.dataset.id

    if (!id) {
      return
    }

    wx.navigateTo({
      url: `/pages/message-detail/message-detail?id=${id}`
    })
  },


  // 查看全部留言
  openCommunity() {
    wx.navigateTo({
      url: '/pages/community/community'
    })
  },


  // =========================
  // 本周投票
  // =========================
  loadPoll() {
    const poll = getCurrentPoll()

    if (!poll) {
      this.setData({
        weeklyPoll: null,
        polls: []
      })
      return
    }

    const options = Array.isArray(poll.options)
      ? poll.options
      : []

    const totalVotes = options.reduce((sum, item) => {
      return sum + Number(item.votes || 0)
    }, 0)

    const polls = options.map((item, index) => {
      const votes = Number(item.votes || 0)

      return {
        ...item,
        id: item.id || `option_${index}`,
        text: item.text || item.name || `选项${index + 1}`,
        name: item.name || item.text || `选项${index + 1}`,
        votes,
        percent: totalVotes > 0
          ? Math.round(votes / totalVotes * 100)
          : 0
      }
    })

    const weeklyPoll = {
      ...poll,
      totalVotes,
      status: poll.status || 'active',
      statusName: poll.statusName || (
        poll.status === 'accepted'
          ? '已通过'
          : poll.status === 'rejected'
            ? '已结束'
            : '进行中'
      )
    }

    this.setData({
      weeklyPoll,
      polls
    })
  },


  // 点击投票区域
  openPoll() {
    wx.navigateTo({
      url: '/pages/poll/poll'
    })
  },


  // =========================
  // 餐厅公告
  // =========================
  loadNotices() {
    const notices = getNotices()

    this.setData({
      notices: notices.slice(0, 3)
    })
  },


  // 点击公告
  openNotice(e) {
    const id = e && e.currentTarget
      ? e.currentTarget.dataset.id
      : ''

    if (id) {
      wx.navigateTo({
        url: `/pages/notice-detail/notice-detail?id=${id}`
      })
      return
    }

    wx.navigateTo({
      url: '/pages/notice/notice'
    })
  },


  // =========================
  // 点餐
  // =========================
  openMenu() {
    wx.switchTab({
      url: '/pages/menu/menu'
    })
  },


  // =========================
  // 写留言
  // =========================
  writeMessage() {
    wx.navigateTo({
      url: '/pages/message-create/message-create'
    })
  },


  // =========================
  // 通知
  // =========================
  openNotifications() {
    wx.navigateTo({
      url: '/pages/notification/notification'
    })
  }
})