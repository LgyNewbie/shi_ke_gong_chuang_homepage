Page({

  data: {
    userName: '食客',
    isLogin: false,

    orderNotice: true,
    messageNotice: true,
    pollNotice: true,
    couponNotice: true,
    noticeNotice: true
  },

  onLoad() {
    this.loadSettings()
  },

  onShow() {
    this.loadSettings()
  },

  // =========================
  // 加载设置
  // =========================

  loadSettings() {

    const loginUser =
      wx.getStorageSync('loginUser') || null

    const settings =
      wx.getStorageSync('appSettings') || {}

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

      orderNotice:
        settings.orderNotice !== false,

      messageNotice:
        settings.messageNotice !== false,

      pollNotice:
        settings.pollNotice !== false,

      couponNotice:
        settings.couponNotice !== false,

      noticeNotice:
        settings.noticeNotice !== false

    })
  },

  // =========================
  // 保存设置
  // =========================

  saveSetting(key, value) {

    const settings =
      wx.getStorageSync('appSettings') || {}

    settings[key] = value

    wx.setStorageSync(
      'appSettings',
      settings
    )
  },

  // =========================
  // 订单通知
  // =========================

  changeOrderNotice(e) {

    const value =
      e.detail.value

    this.setData({
      orderNotice: value
    })

    this.saveSetting(
      'orderNotice',
      value
    )
  },

  // =========================
  // 留言回复通知
  // =========================

  changeMessageNotice(e) {

    const value =
      e.detail.value

    this.setData({
      messageNotice: value
    })

    this.saveSetting(
      'messageNotice',
      value
    )
  },

  // =========================
  // 投票通知
  // =========================

  changePollNotice(e) {

    const value =
      e.detail.value

    this.setData({
      pollNotice: value
    })

    this.saveSetting(
      'pollNotice',
      value
    )
  },

  // =========================
  // 优惠券通知
  // =========================

  changeCouponNotice(e) {

    const value =
      e.detail.value

    this.setData({
      couponNotice: value
    })

    this.saveSetting(
      'couponNotice',
      value
    )
  },

  // =========================
  // 公告通知
  // =========================

  changeNoticeNotice(e) {

    const value =
      e.detail.value

    this.setData({
      noticeNotice: value
    })

    this.saveSetting(
      'noticeNotice',
      value
    )
  },

  // =========================
  // 微信登录
  // =========================

  login() {

    wx.login({

      success: (res) => {

        if (!res.code) {

          wx.showToast({
            title: '微信登录失败',
            icon: 'none'
          })

          return
        }

        /*
         * 当前项目暂未接入后端服务器。
         * 这里先保存本地登录状态。
         * 后续接入真实微信登录时，
         * 再将 res.code 发送给后端。
         */

        const loginUser = {
          isLogin: true,
          userName: '食客',
          loginTime: new Date().toLocaleString()
        }

        wx.setStorageSync(
          'loginUser',
          loginUser
        )

        this.setData({
          isLogin: true,
          userName: '食客'
        })

        wx.showToast({
          title: '登录成功',
          icon: 'success'
        })

      },

      fail: () => {

        wx.showToast({
          title: '微信登录失败',
          icon: 'none'
        })

      }

    })
  },

  // =========================
  // 退出登录
  // =========================

  logout() {

    wx.showModal({

      title: '退出登录',

      content:
        '确定要退出当前账号吗？',

      confirmText: '退出',

      cancelText: '取消',

      success: (res) => {

        if (!res.confirm) {
          return
        }

        wx.removeStorageSync(
          'loginUser'
        )

        this.setData({

          isLogin: false,

          userName: '食客'

        })

        wx.showToast({
          title: '已退出登录',
          icon: 'success'
        })

      }

    })
  },

  // =========================
  // 清除临时数据
  // =========================

  clearCache() {

    wx.showModal({

      title: '清除临时数据',

      content:
        '将清除购物车等临时数据，不会删除订单、留言、投票、优惠券和地址。是否继续？',

      confirmText: '清除',

      cancelText: '取消',

      success: (res) => {

        if (!res.confirm) {
          return
        }

        // 只清除购物车临时数据
        wx.removeStorageSync(
          'cartFoods'
        )

        wx.showToast({
          title: '清除成功',
          icon: 'success'
        })

      }

    })
  },

  // =========================
  // 用户协议
  // =========================

  openAgreement() {

    wx.showModal({

      title: '用户协议',

      content:
        '欢迎使用食客共创。本小程序用于餐厅点餐、食客交流及餐厅共创功能。用户应遵守相关法律法规及平台规则。',

      showCancel: false,

      confirmText: '我知道了'

    })
  },

  // =========================
  // 隐私政策
  // =========================

  openPrivacy() {

    wx.showModal({

      title: '隐私政策',

      content:
        '食客共创重视用户隐私。本项目当前主要使用本地数据保存用户的订单、收藏、留言、投票及优惠券等信息。后续接入真实微信登录及服务器服务后，将根据实际数据处理方式完善隐私政策。',

      showCancel: false,

      confirmText: '我知道了'

    })
  },

  // =========================
  // 关于
  // =========================

  aboutUs() {

    wx.showModal({

      title: '关于食客共创',

      content:
        '食客共创\n\n一个让食客参与餐厅共创的点餐与社区小程序。\n\n当前版本：1.0.0',

      showCancel: false,

      confirmText: '知道了'

    })
  }

})