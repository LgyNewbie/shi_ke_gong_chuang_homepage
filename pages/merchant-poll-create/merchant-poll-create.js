const {
  getMessageById,
  updateMessage
} = require('../../utils/message.js')

const {
  addPoll
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
      getMessageById(
        messageId
      )


    if (!message) {

      wx.showToast({

        title:
          '留言不存在',

        icon:
          'none'

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


    // =========================
    // 新增到多投票列表
    // 不再覆盖旧投票
    // =========================

    const savedPoll =
      addPoll(
        newPoll
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
            savedPoll.id

        })

      )


    if (!updatedMessage) {

      wx.showToast({

        title:
          '来源留言更新失败',

        icon:
          'none'

      })

      return
    }


    // =========================
    // 通知
    // =========================

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
        this.data.messageId

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
            `/pages/poll/poll?pollId=${savedPoll.id}`

        })

      }

    })

  }

})