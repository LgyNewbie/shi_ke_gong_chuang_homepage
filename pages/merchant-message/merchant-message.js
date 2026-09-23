const {
  getMessageById,
  updateMessage
} = require('../../utils/message.js')

const {
  addNotification
} = require('../../utils/notification.js')


Page({

  data: {

    // 当前留言ID
    messageId: '',

    // 当前真实留言
    message: null,


    // 当前处理状态
    currentStatus: 'pending',


    // 回复方式
    replyType: 'answer',


    // 回复内容
    replyContent: '',


    // 输入框提示
    placeholder: '请输入对用户的回复...',


    // 状态列表
    statuses: [

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
        name: '已转为投票'
      }

    ],


    // 回复方式
    replyTypes: [

      {
        id: 'reply',
        name: '官方回复'
      },

      {
        id: 'question',
        name: '向用户提问'
      },

      {
        id: 'answer',
        name: '解答用户'
      }

    ]

  },


  // =========================
  // 页面加载
  // =========================

  onLoad(options) {

    const id = options && options.id
      ? decodeURIComponent(options.id)
      : ''


    this.setData({
      messageId: id
    })


    this.loadMessage()

  },


  // =========================
  // 页面显示
  // =========================

  onShow() {

    if (this.data.messageId) {

      this.loadMessage()

    }

  },


  // =========================
  // 加载真实留言
  // =========================

  loadMessage() {

    const id = this.data.messageId


    if (!id) {

      wx.showToast({
        title: '没有收到留言ID',
        icon: 'none'
      })

      return

    }


    const message = getMessageById(id)


    if (!message) {

      this.setData({
        message: null
      })

      wx.showToast({
        title: '留言不存在',
        icon: 'none'
      })

      return

    }


    // 读取已有回复内容
    let replyContent = ''


    if (typeof message.reply === 'string') {

      replyContent = message.reply

    } else if (
      message.reply &&
      typeof message.reply === 'object'
    ) {

      replyContent = message.reply.text || ''

    }


    this.setData({

      message: message,

      currentStatus:
        message.status || 'pending',

      replyContent: replyContent

    })

  },


  // =========================
  // 返回
  // =========================

  goBack() {

    wx.navigateBack()

  },


  // =========================
  // 选择处理状态
  // =========================

  selectStatus(e) {

    const id =
      e.currentTarget.dataset.id


    this.setData({

      currentStatus: id

    })

  },


  // =========================
  // 选择回复方式
  // =========================

  selectReplyType(e) {

    const id =
      e.currentTarget.dataset.id


    let placeholder =
      '请输入对用户的回复...'


    if (id === 'question') {

      placeholder =
        '例如：你希望辣度调整到什么程度？'

    }


    if (id === 'answer') {

      placeholder =
        '请输入你对用户问题的解答...'

    }


    if (id === 'reply') {

      placeholder =
        '请输入餐厅官方回复...'

    }


    this.setData({

      replyType: id,

      placeholder: placeholder

    })

  },


  // =========================
  // 输入回复
  // =========================

  onReplyInput(e) {

    this.setData({

      replyContent:
        e.detail.value

    })

  },


  // =========================
  // 快捷回复
  // =========================

  useQuickReply(e) {

    const text =
      e.currentTarget.dataset.text


    this.setData({

      replyContent: text

    })

  },


  // =========================
  // 发布回复
  // =========================

  sendReply() {

    const content =
      this.data.replyContent.trim()


    if (!content) {

      wx.showToast({
        title: '请输入回复内容',
        icon: 'none'
      })

      return

    }


    if (!this.data.messageId) {

      wx.showToast({
        title: '留言不存在',
        icon: 'none'
      })

      return

    }


    const statusMap = {

      pending: '待处理',

      review: '正在评估',

      accepted: '已采纳',

      rejected: '暂不采纳',

      poll: '已转为投票'

    }


    // 商家回复对象
    const reply = {

      name: '餐厅官方',

      userName: '餐厅官方',

      avatar: '',

      text: content,

      time: '刚刚'

    }


    // =========================
    // 写回统一留言数据
    // =========================

    const updatedMessage =
      updateMessage(
        this.data.messageId,

        item => {

          return {

            ...item,

            reply: reply,

            replyTime: '刚刚',

            replyType:
              this.data.replyType,

            status:
              this.data.currentStatus,

            statusName:
              statusMap[
                this.data.currentStatus
              ]

          }

        }
      )


    if (!updatedMessage) {

      wx.showToast({
        title: '回复保存失败',
        icon: 'none'
      })

      return

    }


    // =========================
    // 兼容旧版 merchantUpdate
    // =========================

    const merchantUpdate = {

      messageId:
        this.data.messageId,

      reply: content,

      replyTime:
        '餐厅官方 · 刚刚',

      replyType:
        this.data.replyType,

      status:
        this.data.currentStatus,

      statusName:
        statusMap[
          this.data.currentStatus
        ]

    }


    wx.setStorageSync(
      'merchantUpdate',
      merchantUpdate
    )


    // =========================
    // 创建用户通知
    // =========================

    addNotification({

      id:
        `merchant_reply_${this.data.messageId}_${Date.now()}`,

      type: 'merchant',

      icon: '💬',

      iconClass: 'merchant-icon',

      title: '餐厅回复了你的留言',

      content: content,

      time: '刚刚',

      messageId:
        this.data.messageId

    })


    // 更新当前页面
    this.setData({

      message:
        updatedMessage,

      replyContent: ''

    })


    wx.showToast({

      title: '回复已发布',

      icon: 'success',

      duration: 1000

    })


    // 返回商家留言列表
    setTimeout(() => {

      wx.navigateBack()

    }, 1000)

  }

})