
const {
  getVoteRecords
} = require('../../utils/poll.js')

const {
  getMyMessages
} = require('../../utils/message.js')


Page({

  data: {

    userName: '食客',
    isLogin: false,
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

    const loginUser =
  wx.getStorageSync('loginUser') || null

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

      isLogin:
  !!(
    loginUser &&
    loginUser.isLogin
  ),

userName:
  loginUser &&
  loginUser.userName
    ? loginUser.userName
    : '食客',
  
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

    if (!this.checkLogin()) {
      return
    }
  
    wx.navigateTo({
      url: '/pages/my-message/my-message'
    })
  },


  // =========================
  // 我的投票
  // =========================

  openPoll() {

    if (!this.checkLogin()) {
      return
    }
  
    wx.navigateTo({
      url: '/pages/my-poll/my-poll'
    })
  },


  // =========================
  // 我的订单
  // =========================

  openOrders() {

    if (!this.checkLogin()) {
      return
    }
  
    wx.switchTab({
      url: '/pages/order/order'
    })
  },

  openMyCoupon() {

    if (!this.checkLogin()) {
      return
    }
  
    wx.navigateTo({
      url: '/pages/my-coupon/my-coupon'
    })
  },


  // =========================
  // 地址管理
  // =========================

  manageAddress() {

    if (!this.checkLogin()) {
      return
    }
  
    wx.navigateTo({
      url: '/pages/address/address'
    })
  },


  // =========================
// 设置
// =========================

openSettings() {
  wx.navigateTo({
    url: '/pages/settings/settings'
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

openMerchantCoupon() {
  wx.navigateTo({
    url: '/pages/merchant-coupon/merchant-coupon'
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

  checkLogin() {

    const loginUser =
      wx.getStorageSync('loginUser') || null
  
    if (
      loginUser &&
      loginUser.isLogin
    ) {
      return true
    }
  
    wx.showModal({
  
      title: '需要登录',
  
      content:
        '登录后才能使用该功能，是否现在去登录？',
  
      confirmText: '去登录',
  
      cancelText: '取消',
  
      success: (res) => {
  
        if (res.confirm) {
  
          wx.navigateTo({
            url: '/pages/settings/settings'
          })
  
        }
  
      }
  
    })
  
    return false
  },

  openFavorites() {

    if (!this.checkLogin()) {
      return
    }
  
    wx.navigateTo({
      url: '/pages/my-favorite/my-favorite'
    })
  }

})