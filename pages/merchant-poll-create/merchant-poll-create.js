const {
  getMessageById,
  updateMessage
} = require('../../utils/message.js')

const {
  addNotification
} = require('../../utils/notification.js')


Page({
  data: {
    messageId: '',

    sourceMessage: {},

    pollTitle: '',

    options: [
      {
        id: 'option1',
        name: ''
      },
      {
        id: 'option2',
        name: ''
      },
      {
        id: 'option3',
        name: ''
      }
    ]
  },


  onLoad(options) {
    const messageId =
      options.id || ''

    const message =
      getMessageById(messageId)

    if (!message) {
      wx.showToast({
        title: '留言不存在',
        icon: 'none'
      })

      setTimeout(() => {
        wx.navigateBack({
          delta: 1
        })
      }, 1000)

      return
    }


    const messageText =
      message.text ||
      message.content ||
      ''


    // 默认标题
    let defaultTitle =
      `关于“${messageText.slice(0, 18)}”的投票`

    if (!messageText) {
      defaultTitle = '大家支持这条建议吗？'
    }


    this.setData({
      messageId,

      sourceMessage: message,

      pollTitle: defaultTitle,

      options: [
        {
          id: 'option1',
          name: '支持采纳'
        },
        {
          id: 'option2',
          name: '暂不采纳'
        },
        {
          id: 'option3',
          name: '希望进一步调整'
        }
      ]
    })
  },


  // =========================
  // 标题
  // =========================

  inputTitle(e) {
    this.setData({
      pollTitle:
        e.detail.value
    })
  },


  // =========================
  // 修改选项
  // =========================

  inputOption(e) {
    const index =
      e.currentTarget.dataset.index

    const value =
      e.detail.value

    const options =
      this.data.options

    options[index].name =
      value

    this.setData({
      options
    })
  },


  // =========================
  // 添加选项
  // =========================

  addOption() {
    const options =
      this.data.options

    if (options.length >= 4) {
      wx.showToast({
        title: '最多4个选项',
        icon: 'none'
      })

      return
    }

    options.push({
      id: `option${Date.now()}`,
      name: ''
    })

    this.setData({
      options
    })
  },


  // =========================
  // 删除选项
  // =========================

  deleteOption(e) {
    const index =
      e.currentTarget.dataset.index

    const options =
      this.data.options

    if (options.length <= 2) {
      return
    }

    options.splice(index, 1)

    this.setData({
      options
    })
  },


  // =========================
  // 发布投票
  // =========================

  publishPoll() {
    const title =
      (this.data.pollTitle || '').trim()

    if (!title) {
      wx.showToast({
        title: '请输入投票标题',
        icon: 'none'
      })

      return
    }


    const cleanOptions =
      this.data.options
        .map(item => ({
          ...item,
          name: (item.name || '').trim()
        }))
        .filter(item => item.name)


    if (cleanOptions.length < 2) {
      wx.showToast({
        title: '至少需要2个选项',
        icon: 'none'
      })

      return
    }


    // 检查重复选项
    const names =
      cleanOptions.map(
        item => item.name
      )

    const uniqueNames =
      [...new Set(names)]

    if (
      uniqueNames.length !== names.length
    ) {
      wx.showToast({
        title: '选项不能重复',
        icon: 'none'
      })

      return
    }


    const pollOptions =
      cleanOptions.map(item => ({
        id: item.id,
        name: item.name,
        count: 0,
        percent: 0
      }))


    // 保存旧投票到历史
    const oldPoll =
      wx.getStorageSync('weeklyPoll')

    let history =
      wx.getStorageSync('pollHistory') || []


    if (oldPoll) {

      history.unshift({
        ...oldPoll,
        endTime:
          new Date().toLocaleString()
      })

    }


    // 新投票
    const newPoll = {
      id:
        `poll_${Date.now()}`,

      title: title,

      options: pollOptions,

      totalVotes: 0,

      status: 'active',

      sourceMessageId:
        this.data.messageId,

      createTime:
        new Date().toLocaleString(),

      startTime:
        new Date().toLocaleString()
    }


    // 保存当前投票
    wx.setStorageSync(
      'weeklyPoll',
      newPoll
    )


    // 保存历史
    wx.setStorageSync(
      'pollHistory',
      history
    )


    // 清除当前设备投票记录
    wx.removeStorageSync(
      'weeklyPollVoted'
    )

    wx.removeStorageSync(
      'weeklyPollChoice'
    )


    // =========================
    // 更新留言状态
    // =========================

    updateMessage(
      this.data.messageId,
      oldMessage => ({
        ...oldMessage,

        status: 'poll',

        statusName: '已转为投票',

        pollId: newPoll.id
      })
    )


    // =========================
    // 给用户生成通知
    // =========================

    addNotification({
      id:
        `poll_${newPoll.id}`,

      type: 'poll',

      icon: '🗳️',

      iconClass: 'poll-icon',

      title: '一条食客建议已转为投票',

      content:
        `“${title}”已经发布，欢迎参与投票。`,

      time: '刚刚',

      read: false,

      messageId:
        this.data.messageId
    })


    wx.showModal({

      title: '投票发布成功',

      content:
        '这条食客建议已经转为投票，现在大家可以参与表决。',

      showCancel: false,

      confirmText: '查看投票',

      success: () => {

        wx.navigateTo({
          url: '/pages/poll/poll'
        })

      }

    })
  }
})