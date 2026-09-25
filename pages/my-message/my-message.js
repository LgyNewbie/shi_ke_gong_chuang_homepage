const {
  getMyMessages
} = require('../../utils/message.js')


Page({

  data: {

    messages: [],

    likeCount: 0,

    replyCount: 0

  },


  onShow() {

    this.loadMessages()

  },


  // =========================
  // 加载我的留言
  // =========================

  loadMessages() {

    // =========================
    // 当前登录用户
    // =========================
  
    const loginUser =
      wx.getStorageSync('loginUser') || null
  
  
    // 没有登录
    if (
      !loginUser ||
      !loginUser.isLogin
    ) {
  
      this.setData({
  
        messages: [],
  
        likeCount: 0,
  
        replyCount: 0
  
      })
  
      return
  
    }
  
  
    // 当前用户ID
    // 当前项目暂时使用 loginTime
    // 作为本地演示版用户唯一标识
  
    const currentUserId =
      loginUser.loginTime
  
  
    // =========================
    // 获取我的留言
    // =========================
  
    const allMyMessages =
      getMyMessages()
  
  
    // =========================
    // 按 userId 筛选
    // =========================
  
    const myMessages =
      allMyMessages.filter(item => {
  
        return (
          item.userId &&
          item.userId === currentUserId
        )
  
      })
  
  
    // =========================
    // 统计点赞和回复
    // =========================
  
    let likeCount = 0
  
    let replyCount = 0
  
  
    myMessages.forEach(item => {
  
      likeCount +=
        Number(
          item.likes || 0
        )
  
  
      if (item.reply) {
  
        replyCount++
  
      }
  
    })
  
  
    // =========================
    // 更新页面
    // =========================
  
    this.setData({
  
      messages:
        myMessages,
  
      likeCount:
        likeCount,
  
      replyCount:
        replyCount
  
    })
  
  },


  // =========================
  // 打开留言详情
  // =========================

  openDetail(e) {

    const id =
      e.currentTarget.dataset.id


    if (!id) {

      return

    }


    wx.navigateTo({

      url:
        `/pages/message-detail/message-detail?id=${id}`

    })

  },


  // =========================
  // 发布新留言
  // =========================

  writeMessage() {

    wx.navigateTo({

      url:
        '/pages/message-create/message-create'

    })

  }

})