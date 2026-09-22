Page({

  data: {

    currentStatus: 'review',

    replyType: 'answer',

    replyContent: '',

    placeholder: '请输入对用户的回复...',

    statuses: [
      {
        id: 'pending',
        name: '待处理'
      },
      {
        id: 'review',
        name: '评估中'
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


  // 返回
  goBack() {

    wx.navigateBack()

  },


  // 选择处理状态
  selectStatus(e) {

    const id = e.currentTarget.dataset.id

    this.setData({
      currentStatus: id
    })

  },


  // 选择回复方式
  selectReplyType(e) {

    const id = e.currentTarget.dataset.id

    let placeholder = '请输入对用户的回复...'

    if (id === 'question') {

      placeholder = '例如：你希望辣度调整到什么程度？'

    }

    if (id === 'answer') {

      placeholder = '请输入你对用户问题的解答...'

    }

    if (id === 'reply') {

      placeholder = '请输入餐厅官方回复...'

    }

    this.setData({
      replyType: id,
      placeholder: placeholder
    })

  },


  // 输入回复
  onReplyInput(e) {

    this.setData({
      replyContent: e.detail.value
    })

  },


  // 快捷回复
  useQuickReply(e) {

    const text = e.currentTarget.dataset.text

    this.setData({
      replyContent: text
    })

  },


  // 发布
  sendReply() {

    const content = this.data.replyContent.trim()

    if (!content) {

      wx.showToast({
        title: '请输入回复内容',
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


    // 保存商家处理结果
    const merchantUpdate = {

      reply: content,

      replyTime: '餐厅官方 · 刚刚',

      replyType: this.data.replyType,

      status: this.data.currentStatus,

      statusName: statusMap[this.data.currentStatus]

    }


    wx.setStorageSync(
      'merchantUpdate',
      merchantUpdate
    )


    wx.showToast({

      title: '回复已发布',

      icon: 'success',

      duration: 1000

    })


    setTimeout(() => {

      wx.navigateBack()

    }, 1000)

  }

})