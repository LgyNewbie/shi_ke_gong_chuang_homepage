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
      notifications = [
        {
          id: 'notice-msg-001',
          type: 'merchant',
          icon: '🏪',
          iconClass: 'merchant-icon',
          title: '餐厅回复了你的留言',
          content: '感谢你的建议，我们正在认真评估中。',
          time: '刚刚',
          read: false,
          messageId: ''
        },

        {
          id: 'notice-msg-002',
          type: 'comment',
          icon: '💬',
          iconClass: 'comment-icon',
          title: '有人回复了你的评论',
          content: '“我也觉得这个建议不错！”',
          time: '1小时前',
          read: false,
          messageId: ''
        },

        {
          id: 'notice-msg-003',
          type: 'poll',
          icon: '🗳️',
          iconClass: 'poll-icon',
          title: '本周投票结果已更新',
          content: '看看大家最想吃什么新品。',
          time: '3小时前',
          read: true,
          messageId: ''
        },

        {
          id: 'notice-msg-004',
          type: 'order',
          icon: '📦',
          iconClass: 'order-icon',
          title: '你的订单正在制作',
          content: '餐厅已经接单，请耐心等待。',
          time: '今天',
          read: true,
          messageId: ''
        }
      ]

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
    const id =
      e.currentTarget.dataset.id

    const type =
      e.currentTarget.dataset.type

    const messageId =
      e.currentTarget.dataset.messageId

    let notifications =
      wx.getStorageSync('notifications') || []

    notifications =
      notifications.map(item => {

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

    // 更新未读数量
    this.setData({
      notifications,
      unreadCount:
        notifications.filter(item => !item.read).length
    })


    // 不同类型进入不同页面
    if (
      type === 'merchant' ||
      type === 'comment'
    ) {

      if (messageId) {
        wx.navigateTo({
          url:
            `/pages/message-detail/message-detail?id=${messageId}`
        })
        return
      }

      wx.showToast({
        title: '暂时没有对应留言',
        icon: 'none'
      })

      return
    }


    if (type === 'poll') {
      wx.navigateTo({
        url: '/pages/poll/poll'
      })
      return
    }


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