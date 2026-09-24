
const {
  getVoteRecords
} = require('../../utils/poll.js')

const {
  getMyMessages
} = require('../../utils/message.js')


Page({

  data: {

    userName: '食客',

    messageCount: 0,
    voteCount: 0,
    favoriteCount: 0

  },


  onLoad() {

    this.loadData()

  },


  onShow() {

    this.loadData()

  },


  loadData() {

    const myMessages =
      getMyMessages()
  
  
    const voteRecords =
      getVoteRecords()
  
  
    let voteCount = 0
  
    if (
      voteRecords &&
      typeof voteRecords === 'object' &&
      !Array.isArray(voteRecords)
    ) {
  
      voteCount =
        Object.keys(
          voteRecords
        ).filter(
          key =>
            !!voteRecords[key]
        ).length
  
    }
  
  
    const favorites =
      wx.getStorageSync('favorites') || []
  
  
    this.setData({
  
      messageCount:
        myMessages.length,
  
      voteCount:
        voteCount,
  
      favoriteCount:
        Array.isArray(favorites)
          ? favorites.length
          : 0
  
    })
  
  },


  // =========================
  // 我的留言
  // =========================

  openMyMessage() {

    wx.navigateTo({

      url:
        '/pages/my-message/my-message'

    })

  },


  // =========================
  // 我的投票
  // =========================

  openPoll() {

    wx.navigateTo({

      url:
        '/pages/my-poll/my-poll'

    })

  },


  // =========================
  // 我的订单
  // =========================

  openOrders() {

    wx.switchTab({

      url:
        '/pages/order/order'

    })

  },


  // =========================
  // 地址管理
  // =========================

  manageAddress() {

    wx.navigateTo({

      url:
        '/pages/address/address'

    })

  },


  // =========================
  // 设置
  // =========================

  openSettings() {

    wx.showToast({

      title:
        '设置功能正在完善',

      icon:
        'none'

    })

  },


  // =========================
  // 商家订单
  // =========================

  openMerchantOrder() {

    wx.navigateTo({

      url:
        '/pages/merchant-order/merchant-order'

    })

  },


  // =========================
  // 商家留言
  // =========================

  openMerchantMessage() {

    wx.navigateTo({

      url:
        '/pages/merchant-message-list/merchant-message-list'

    })

  },


  // =========================
  // 商家投票
  // =========================

  openMerchantPoll() {

    wx.navigateTo({

      url:
        '/pages/merchant-poll/merchant-poll'

    })

  },


  // =========================
  // 商家公告
  // =========================

  openMerchantNotice() {

    wx.navigateTo({

      url:
        '/pages/merchant-notice/merchant-notice'

    })

  },

  // =========================
// 商家商品
// =========================

openMerchantFood() {
  wx.navigateTo({
    url:
      '/pages/merchant-food/merchant-food'
  })
},


  // =========================
  // 关于
  // =========================

  aboutUs() {

    wx.showModal({

      title:
        '食客共创',

      content:
        '一个让食客参与餐厅共创的点餐与社区小程序。',

      showCancel:
        false

    })

  },


  // =========================
  // 我的收藏
  // =========================

  openFavorites() {

    wx.navigateTo({

      url:
        '/pages/my-favorite/my-favorite'

    })

  }

})