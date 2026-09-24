const {
  getMessageById
} = require('../../utils/message.js')

const {
  getPollById
} = require('../../utils/poll.js')


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
      wx.getStorageSync(
        'notifications'
      )


    // 第一次运行，创建空通知列表
    if (
      !Array.isArray(notifications)
    ) {

      notifications = []

      wx.setStorageSync(
        'notifications',
        notifications
      )

    }


    const unreadCount =
      notifications.filter(
        item => !item.read
      ).length


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

    const datasetPollId =
      e.currentTarget.dataset.pollId


    let notifications =
      wx.getStorageSync(
        'notifications'
      ) || []


    // 找到当前通知
    const currentNotification =
      notifications.find(
        item => item.id === id
      )


    // =========================
    // 标记已读
    // =========================

    notifications =
      notifications.map(item => {

        if (
          item.id === id
        ) {

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
        notifications.filter(
          item => !item.read
        ).length

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
            `/pages/message-detail/message-detail?id=${encodeURIComponent(messageId)}`

        })

        return

      }


      // 旧演示数据
      wx.showToast({

        title:
          '这是一条旧的演示通知',

        icon:
          'none'

      })

      return

    }


    // =========================
    // 投票通知
    // =========================

    if (
      type === 'poll'
    ) {

      let pollId =
        datasetPollId || ''


      // 优先读取通知本身保存的 pollId
      if (
        !pollId &&
        currentNotification &&
        currentNotification.pollId
      ) {

        pollId =
          currentNotification.pollId

      }


      // =========================
      // 兼容旧投票通知
      // 没有 pollId 时
      // 从来源留言恢复投票ID
      // =========================

      if (
        !pollId &&
        messageId
      ) {

        const message =
          getMessageById(
            messageId
          )


        if (
          message &&
          message.pollId
        ) {

          pollId =
            message.pollId

        }

      }


      // =========================
      // 有具体投票ID
      // 直接打开这场投票
      // =========================

      if (pollId) {

        const poll =
          getPollById(
            pollId
          )


        if (poll) {

          wx.navigateTo({

            url:
              `/pages/poll/poll?pollId=${encodeURIComponent(pollId)}`

          })

          return

        }

      }


      // =========================
      // 旧通知没有具体投票
      // 进入投票列表
      // =========================

      wx.navigateTo({

        url:
          '/pages/poll/poll'

      })

      return

    }


    // =========================
    // 订单通知
    // =========================

    if (
      type === 'order'
    ) {

      wx.switchTab({

        url:
          '/pages/order/order'

      })

      return

    }

  },


  // =========================
  // 全部已读
  // =========================

  readAll() {

    let notifications =
      wx.getStorageSync(
        'notifications'
      ) || []


    notifications =
      notifications.map(
        item => ({

          ...item,

          read: true

        })
      )


    wx.setStorageSync(

      'notifications',

      notifications

    )


    this.setData({

      notifications,

      unreadCount:
        0

    })


    wx.showToast({

      title:
        '已全部读',

      icon:
        'success'

    })

  }

})