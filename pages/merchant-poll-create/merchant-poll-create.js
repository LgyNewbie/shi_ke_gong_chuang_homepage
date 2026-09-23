const {
  getMessageById,
  updateMessage
} = require('../../utils/message.js')

const {
  addNotification
} = require('../../utils/notification.js')


function formatDate(date) {
  const year = date.getFullYear()

  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0')

  const day = String(
    date.getDate()
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}


function getDefaultEndDate() {
  const date = new Date()

  date.setDate(
    date.getDate() + 7
  )

  return formatDate(date)
}


Page({

  data: {

    messageId: '',

    sourceMessage: {},


    // 投票标题
    pollTitle: '',


    // 投票说明
    pollDescription:
      '欢迎参与投票，帮助餐厅决定后续新品。',


    // 截止日期
    endDate: '',


    // 投票选项
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


  // =========================
  // 页面加载
  // =========================

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


  // =========================
  // 修改标题
  // =========================

  inputTitle(e) {

    this.setData({

      pollTitle:
        e.detail.value

    })

  },


  // =========================
  // 修改投票说明
  // =========================

  inputDescription(e) {

    this.setData({

      pollDescription:
        e.detail.value

    })

  },


  // =========================
  // 修改截止日期
  // =========================

  changeEndDate(e) {

    this.setData({

      endDate:
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
      [...this.data.options]


    options[index].name =
      value


    this.setData({

      options:
        options

    })

  },


  // =========================
  // 添加选项
  // =========================

  addOption() {

    const options =
      [...this.data.options]


    if (options.length >= 4) {

      wx.showToast({

        title: '最多4个选项',

        icon: 'none'

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

      options:
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
      [...this.data.options]


    if (options.length <= 2) {

      wx.showToast({

        title: '至少保留2个选项',

        icon: 'none'

      })

      return

    }


    options.splice(
      index,
      1
    )


    this.setData({

      options:
        options

    })

  },


  // =========================
  // 发布投票
  // =========================

  publishPoll() {

    const title =
      (this.data.pollTitle || '').trim()


    const description =
      (this.data.pollDescription || '').trim()


    const endDate =
      (this.data.endDate || '').trim()


    // 标题检查
    if (!title) {

      wx.showToast({

        title: '请输入投票标题',

        icon: 'none'

      })

      return

    }


    // 说明检查
    if (!description) {

      wx.showToast({

        title: '请输入投票说明',

        icon: 'none'

      })

      return

    }


    // 截止日期检查
    if (!endDate) {

      wx.showToast({

        title: '请选择截止日期',

        icon: 'none'

      })

      return

    }


    // 整理选项
    const cleanOptions =
      this.data.options

        .map(item => ({

          ...item,

          name:
            (item.name || '').trim()

        }))

        .filter(item =>
          item.name
        )


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
      uniqueNames.length !==
      names.length
    ) {

      wx.showToast({

        title: '选项不能重复',

        icon: 'none'

      })

      return

    }


    // =========================
    // 统一投票字段
    // 使用 votes，不再使用 count
    // =========================

    const pollOptions =
      cleanOptions.map(item => ({

        id:
          item.id,

        name:
          item.name,

        votes:
          0,

        percent:
          0

      }))


    // =========================
    // 保存旧投票
    // =========================

    const oldPoll =
      wx.getStorageSync('weeklyPoll')


    let history =
      wx.getStorageSync('pollHistory') || []


    if (!Array.isArray(history)) {

      history = []

    }


    if (oldPoll) {

      history.unshift({

        ...oldPoll,

        endTime:
          new Date().toLocaleString()

      })

    }


    // =========================
    // 创建新投票
    // =========================

    const newPoll = {

      id:
        `poll_${Date.now()}`,

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

      sourceMessageId:
        this.data.messageId,

      createTime:
        new Date().toLocaleString(),

      startTime:
        new Date().toLocaleString()

    }


    // =========================
    // 保存新投票
    // =========================

    wx.setStorageSync(

      'weeklyPoll',

      newPoll

    )


    // 保存历史
    wx.setStorageSync(

      'pollHistory',

      history

    )


    // =========================
    // 清除当前设备的投票记录
    // =========================

    wx.removeStorageSync(

      'weeklyPollVoted'

    )


    wx.removeStorageSync(

      'weeklyPollChoice'

    )


    // =========================
    // 更新来源留言
    // =========================

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
            newPoll.id

        })

      )


    if (!updatedMessage) {

      wx.showToast({

        title: '来源留言更新失败',

        icon: 'none'

      })

      return

    }


    // =========================
    // 用户投票通知
    // =========================

    addNotification({

      id:
        `poll_${newPoll.id}`,

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
        this.data.messageId

    })


    // =========================
    // 发布成功
    // =========================

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
            '/pages/poll/poll'

        })

      }

    })

  }

})