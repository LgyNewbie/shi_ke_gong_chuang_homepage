Page({
  data: {
    userName: '食客',

    messageCount: 0,
    voteCount: 0,
    favoriteCount: 0
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    // 每次重新进入“我的”页面都重新读取数据
    this.loadData()
  },

  loadData() {
    // =========================
    // 我的留言
    // =========================

    const myMessages = wx.getStorageSync('myMessages') || []

    // =========================
    // 我的投票
    // =========================

    const weeklyPollVoted =
      wx.getStorageSync('weeklyPollVoted') || false

    let voteCount = 0

    if (weeklyPollVoted) {
      voteCount = 1
    }

    // =========================
    // 收藏
    // 目前还没有正式做收藏
    // 先读取 favorites
    // =========================

    const favorites =
      wx.getStorageSync('favorites') || []

    this.setData({
      messageCount: myMessages.length,
      voteCount: voteCount,
      favoriteCount: favorites.length
    })
  },


  // =========================
  // 我的留言
  // =========================

  openMyMessage() {
    wx.navigateTo({
      url: '/pages/my-message/my-message'
    })
  },


  // =========================
  // 我的投票
  // =========================

  openPoll() {
    wx.navigateTo({
      url: '/pages/my-poll/my-poll'
    })
  },


  // =========================
  // 我的订单
  // =========================

  openOrders() {
    wx.switchTab({
      url: '/pages/order/order'
    })
  },


  // =========================
  // 地址管理
  // =========================

  manageAddress() {
    wx.navigateTo({
      url: '/pages/address/address'
    })
  },


  // =========================
  // 设置
  // =========================

  openSettings() {
    wx.showToast({
      title: '设置功能正在完善',
      icon: 'none'
    })
  },


  // =========================
  // 关于
  // =========================

  aboutUs() {
    wx.showModal({
      title: '食客共创',
      content: '一个让食客参与餐厅共创的点餐与社区小程序。',
      showCancel: false
    })
  },

  openFavorites() {
    wx.navigateTo({
      url: '/pages/my-favorite/my-favorite'
    })
  },

})