const {
  getMessageById,
  updateMessage
} = require('../../utils/message.js')

const {
  addPoll,
  getPolls
} = require('../../utils/poll.js')

const {
  addNotification
} = require('../../utils/notification.js')


function formatDate(date) {

  const year =
    date.getFullYear()

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, '0')

  const day =
    String(
      date.getDate()
    ).padStart(2, '0')

  return `${year}-${month}-${day}`
}


function getDefaultEndDate() {

  const date =
    new Date()

  date.setDate(
    date.getDate() + 7
  )

  return formatDate(
    date
  )
}


Page({

  data: {

    messageId: '',

    sourceMessage: {},

    pollTitle: '',

    pollDescription:
      '欢迎参与投票，帮助餐厅决定后续新品。',

    endDate: '',

    publishing: false,

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
      options && options.id
        ? decodeURIComponent(options.id)
        : ''
  
  
    if (!messageId) {
  
      wx.showToast({
        title: '没有收到留言ID',
        icon: 'none'
      })
  
      return
    }
  
  
    const message =
      getMessageById(messageId)
  
  
    if (!message) {
  
      wx.showToast({
        title: '留言不存在',
        icon: 'none'
      })
  
      return
    }
  
  
    // ==================================
    // 第一重检查：
    // 只要留言已经存在 pollId
    // 就认为已经创建过投票
    // 不再依赖 status === poll
    // ==================================
  
    if (message.pollId) {
  
      wx.showModal({
  
        title: '已经创建过投票',
  
        content:
          '这条留言已经对应一场投票，不能重复创建。',
  
        showCancel: false,
  
        confirmText: '查看投票',
  
        success: () => {
  
          wx.navigateTo({
  
            url:
              `/pages/poll/poll?pollId=${encodeURIComponent(message.pollId)}`
  
          })
  
        }
  
      })
  
      return
    }
  
  
    // ==================================
    // 第二重检查：
    // 即使留言没有 pollId
    // 也去 polls 里面检查 sourceMessageId
    // 防止之前已经生成投票但留言没有成功写回
    // ==================================
  
    const polls =
      getPolls()
  
  
    const existingPoll =
      polls.find(item =>
        String(item.sourceMessageId) ===
        String(messageId)
      )
  
  
    if (existingPoll) {
  
      // 自动修复来源留言
      updateMessage(
  
        messageId,
  
        oldMessage => ({
  
          ...oldMessage,
  
          status:
            'poll',
  
          statusName:
            '已转为投票',
  
          pollId:
            existingPoll.id
  
        })
  
      )
  
  
      wx.showModal({
  
        title: '已经创建过投票',
  
        content:
          '检测到这条留言已经存在对应投票，已自动恢复关联，不能重复创建。',
  
        showCancel: false,
  
        confirmText: '查看投票',
  
        success: () => {
  
          wx.navigateTo({
  
            url:
              `/pages/poll/poll?pollId=${encodeURIComponent(existingPoll.id)}`
  
          })
  
        }
  
      })
  
      return
    }
  
  
    const messageText =
      message.text ||
      message.content ||
      ''
  
  
    let defaultTitle =
      `关于“${messageText.slice(0, 18)}”的投票`
  
  
    if (!messageText) {
  
      defaultTitle =
        '大家支持这条建议吗？'
  
    }
  
  
    this.setData({
  
      messageId:
  
        messageId,
  
      sourceMessage:
  
        message,
  
      pollTitle:
  
        defaultTitle,
  
      pollDescription:
  
        '欢迎参与投票，帮助餐厅决定后续新品。',
  
      endDate:
  
        getDefaultEndDate(),
  
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


  inputTitle(e) {

    this.setData({

      pollTitle:
        e.detail.value

    })

  },


  inputDescription(e) {

    this.setData({

      pollDescription:
        e.detail.value

    })

  },


  changeEndDate(e) {

    this.setData({

      endDate:
        e.detail.value

    })

  },


  inputOption(e) {

    const index =
      e.currentTarget.dataset.index


    const options =
      [...this.data.options]


    options[index].name =
      e.detail.value


    this.setData({

      options

    })

  },


  addOption() {

    const options =
      [...this.data.options]


    if (
      options.length >= 4
    ) {

      wx.showToast({

        title:
          '最多4个选项',

        icon:
          'none'

      })

      return
    }


    options.push({

      id:
        `option_${Date.now()}`,

      name:
        ''

    })


    this.setData({

      options

    })

  },


  deleteOption(e) {

    const index =
      e.currentTarget.dataset.index


    const options =
      [...this.data.options]


    if (
      options.length <= 2
    ) {

      wx.showToast({

        title:
          '至少保留2个选项',

        icon:
          'none'

      })

      return
    }


    options.splice(
      index,
      1
    )


    this.setData({

      options

    })

  },


  // =========================
  // 发布投票
  // =========================

  publishPoll() {

    // ==================================
    // 第0重保护：
    // 防止连续快速点击发布按钮
    // ==================================
  
    if (this.data.publishing) {
  
      wx.showToast({
  
        title:
          '正在发布，请不要重复点击',
  
        icon:
          'none'
  
      })
  
      return
    }
  
  
    const title =
      (
        this.data.pollTitle ||
        ''
      ).trim()
  
  
    const description =
      (
        this.data.pollDescription ||
        ''
      ).trim()
  
  
    const endDate =
      (
        this.data.endDate ||
        ''
      ).trim()
  
  
    if (!title) {
  
      wx.showToast({
  
        title:
          '请输入投票标题',
  
        icon:
          'none'
  
      })
  
      return
    }
  
  
    if (!description) {
  
      wx.showToast({
  
        title:
          '请输入投票说明',
  
        icon:
          'none'
  
      })
  
      return
    }
  
  
    if (!endDate) {
  
      wx.showToast({
  
        title:
          '请选择截止日期',
  
        icon:
          'none'
  
      })
  
      return
    }
  
  
    const cleanOptions =
      this.data.options
  
        .map(item => ({
  
          ...item,
  
          name:
            (
              item.name ||
              ''
            ).trim()
  
        }))
  
        .filter(item =>
          item.name
        )
  
  
    if (
      cleanOptions.length < 2
    ) {
  
      wx.showToast({
  
        title:
          '至少需要2个选项',
  
        icon:
          'none'
  
      })
  
      return
    }
  
  
    const names =
      cleanOptions.map(
        item =>
          item.name
      )
  
  
    const uniqueNames =
      [...new Set(names)]
  
  
    if (
      uniqueNames.length !==
      names.length
    ) {
  
      wx.showToast({
  
        title:
          '选项不能重复',
  
        icon:
          'none'
  
      })
  
      return
    }
  
  
    // ==================================
    // 开始加锁
    // ==================================
  
    this.setData({
  
      publishing:
        true
  
    })
  
  
    // ==================================
    // 再次读取最新留言
    // 不使用页面刚打开时的旧数据
    // ==================================
  
    const latestMessage =
      getMessageById(
        this.data.messageId
      )
  
  
    if (!latestMessage) {
  
      this.setData({
        publishing: false
      })
  
      wx.showToast({
  
        title:
          '留言不存在',
  
        icon:
          'none'
  
      })
  
      return
    }
  
  
    // ==================================
    // 第1重检查：
    // 只检查 pollId
    // 不检查 status
    // ==================================
  
    if (latestMessage.pollId) {
  
      this.setData({
        publishing: false
      })
  
  
      wx.showModal({
  
        title:
          '已经创建过投票',
  
        content:
          '这条留言已经对应一场投票，不能重复创建。',
  
        showCancel:
          false,
  
        confirmText:
          '查看投票',
  
        success: () => {
  
          wx.navigateTo({
  
            url:
              `/pages/poll/poll?pollId=${encodeURIComponent(latestMessage.pollId)}`
  
          })
  
        }
  
      })
  
      return
    }
  
  
    // ==================================
    // 第2重检查：
    // 扫描全部 polls
    // ==================================
  
    const polls =
      getPolls()
  
  
    const existingPoll =
      polls.find(item =>
        String(item.sourceMessageId) ===
        String(this.data.messageId)
      )
  
  
    if (existingPoll) {
  
      // 自动补回留言关联
      updateMessage(
  
        this.data.messageId,
  
        oldMessage => ({
  
          ...oldMessage,
  
          status:
            'poll',
  
          statusName:
            '已转为投票',
  
          pollId:
            existingPoll.id
  
        })
  
      )
  
  
      this.setData({
        publishing: false
      })
  
  
      wx.showModal({
  
        title:
          '已经创建过投票',
  
        content:
          '检测到这条留言已经存在投票，不能重复创建。',
  
        showCancel:
          false,
  
        confirmText:
          '查看投票',
  
        success: () => {
  
          wx.navigateTo({
  
            url:
              `/pages/poll/poll?pollId=${encodeURIComponent(existingPoll.id)}`
  
          })
  
        }
  
      })
  
      return
    }
  
  
    // ==================================
    // 生成唯一投票ID
    // ==================================
  
    const pollId =
      `poll_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`
  
  
    const pollOptions =
      cleanOptions.map(
        item => ({
  
          id:
            String(item.id),
  
          name:
            item.name,
  
          desc:
            '',
  
          votes:
            0,
  
          percent:
            0
  
        })
      )
  
  
    const newPoll = {
  
      id:
        pollId,
  
      title:
        title,
  
      description:
        description,
  
      endDate:
        endDate,
  
      options:
        pollOptions,
  
      totalVotes:
        0,
  
      status:
        'active',
  
      statusName:
        '进行中',
  
      sourceMessageId:
        this.data.messageId,
  
      createTime:
        new Date().toLocaleString(),
  
      startTime:
        new Date().toLocaleString(),
  
      endTime:
        ''
  
    }
  
  
    // ==================================
    // 创建投票
    // ==================================
  
    let savedPoll = null
  
    try {
  
      savedPoll =
        addPoll(
          newPoll
        )
  
    } catch (error) {
  
      console.error(
        '创建投票失败',
        error
      )
  
      this.setData({
        publishing: false
      })
  
      wx.showToast({
  
        title:
          '投票创建失败',
  
        icon:
          'none'
  
      })
  
      return
    }
  
  
    if (!savedPoll) {
  
      this.setData({
        publishing: false
      })
  
      wx.showToast({
  
        title:
          '投票创建失败',
  
        icon:
          'none'
  
      })
  
      return
    }
  
  
    // ==================================
    // 更新来源留言
    // ==================================
  
    const updatedMessage =
      updateMessage(
  
        this.data.messageId,
  
        oldMessage => ({
  
          ...oldMessage,
  
          status:
            'poll',
  
          statusName:
            '已转为投票',
  
          pollId:
            savedPoll.id
  
        })
  
      )
  
  
    if (!updatedMessage) {
  
      this.setData({
        publishing: false
      })
  
      wx.showToast({
  
        title:
          '来源留言更新失败',
  
        icon:
          'none'
  
      })
  
      return
    }
  
  
    // ==================================
    // 通知
    // ==================================
  
    addNotification({
  
      id:
        `poll_${savedPoll.id}`,
  
      type:
        'poll',
  
      icon:
        '🗳️',
  
      iconClass:
        'poll-icon',
  
      title:
        '一条食客建议已转为投票',
  
      content:
        `“${title}”已经发布，欢迎参与投票。`,
  
      time:
        '刚刚',
  
      read:
        false,
  
      messageId:
        this.data.messageId,
  
      pollId:
        savedPoll.id
  
    })
  
  
    // ==================================
    // 发布完成
    // ==================================
  
    this.setData({
  
      sourceMessage:
        updatedMessage,
  
      publishing:
        false
  
    })
  
  
    wx.showModal({
  
      title:
        '投票发布成功',
  
      content:
        '这条食客建议已经转为投票，现在大家可以参与表决。',
  
      showCancel:
        false,
  
      confirmText:
        '查看投票',
  
      success: () => {
  
        wx.navigateTo({
  
          url:
            `/pages/poll/poll?pollId=${encodeURIComponent(savedPoll.id)}`
  
        })
  
      }
  
    })
  
  },

})