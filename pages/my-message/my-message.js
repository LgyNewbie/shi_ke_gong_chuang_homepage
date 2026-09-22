const {
  getMessages
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

  loadMessages() {
    const allMessages = getMessages()
  
    // 当前演示版本暂时使用“食客”作为当前用户
    const myMessages = allMessages.filter(item => {
      return (
        item.userName === '食客' ||
        item.name === '食客'
      )
    })
  
    let likeCount = 0
    let replyCount = 0
  
    myMessages.forEach(item => {
  
      likeCount += Number(
        item.likes || 0
      )
  
      if (item.reply) {
        replyCount++
      }
  
    })
  
    this.setData({
      messages: myMessages,
      likeCount,
      replyCount
    })
  },

  openDetail(e) {
    const id = e.currentTarget.dataset.id

    wx.navigateTo({
      url: `/pages/message-detail/message-detail?id=${id}`
    })
  },

  writeMessage() {
    wx.navigateTo({
      url: '/pages/message-create/message-create'
    })
  }
})