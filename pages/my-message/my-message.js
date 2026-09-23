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

    const myMessages =
      getMyMessages()


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