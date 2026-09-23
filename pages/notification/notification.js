Page({
  data: {
    notifications: [],
    unreadCount: 0
  },

  onShow() {
    this.loadNotifications()
  },

  loadNotifications() {
    let notifications =
      wx.getStorageSync('notifications')

    // 第一次运行，创建演示数据
    if (!Array.isArray(notifications)) {
      notifications = []
    
      wx.setStorageSync(
        'notifications',
        notifications
      )
    }

    const unreadCount =
      notifications.filter(item => !item.read).length

    this.setData({
      notifications,
      unreadCount
    })
  },


  // =========================
  // 点击通知
  // =========================

  openNotification(e) {
    const id = e.currentTarget.dataset.id
    const type = e.currentTarget.dataset.type
    const messageId = e.currentTarget.dataset.messageId
  
    let notifications =
      wx.getStorageSync('notifications') || []
  
    // 标记已读
    notifications = notifications.map(item => {
      if (item.id === id) {
        return {
          ...item,
          read: true
        }
      }
  
      return item
    })
  
    wx.setStorageSync(
      'notifications',
      notifications
    )
  
    // 更新页面未读数量
    this.setData({
      notifications,
      unreadCount:
        notifications.filter(item => !item.read).length
    })
  
  
    // =========================
    // 评论回复 / 商家回复
    // =========================
  
    if (
      type === 'comment' ||
      type === 'merchant'
    ) {
  
      // 有对应留言ID
      if (messageId) {
        wx.navigateTo({
          url:
            `/pages/message-detail/message-detail?id=${messageId}`
        })
  
        return
      }
  
      // 旧的演示数据没有 messageId
      wx.showToast({
        title: '这是一条旧的演示通知',
        icon: 'none'
      })
  
      return
    }
  
  
    // =========================
    // 投票通知
    // =========================
  
    if (type === 'poll') {
      wx.navigateTo({
        url: '/pages/poll/poll'
      })
  
      return
    }
  
  
    // =========================
    // 订单通知
    // =========================
  
    if (type === 'order') {
      wx.switchTab({
        url: '/pages/order/order'
      })
  
      return
    }
  },


  // =========================
  // 全部已读
  // =========================

  readAll() {
    let notifications =
      wx.getStorageSync('notifications') || []

    notifications =
      notifications.map(item => ({
        ...item,
        read: true
      }))

    wx.setStorageSync(
      'notifications',
      notifications
    )

    this.setData({
      notifications,
      unreadCount: 0
    })

    wx.showToast({
      title: '已全部读',
      icon: 'success'
    })
  }
})