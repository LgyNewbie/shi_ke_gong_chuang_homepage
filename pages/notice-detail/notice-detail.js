const notices = [
  {
    id: 'notice001',
    type: '营业',
    typeClass: 'type-business',
    title: '餐厅本周营业时间调整通知',
    date: '2026-09-20',
    content: [
      '亲爱的食客：',
      '为了给大家提供更好的用餐服务，本周末餐厅营业时间进行临时调整。',
      '周六、周日营业时间为 10:30—22:00。',
      '如有特殊安排，请提前通过留言区联系我们。',
      '感谢大家一直以来对餐厅的支持。'
    ]
  },

  {
    id: 'notice002',
    type: '活动',
    typeClass: 'type-event',
    title: '本周留言互动活动开始啦',
    date: '2026-09-18',
    content: [
      '欢迎大家参加本周食客互动活动！',
      '只要在留言区发布真实的用餐体验、菜品建议或者服务建议，就有机会获得餐厅准备的小礼物。',
      '我们也会认真阅读每一条留言，并根据大家的建议持续改进。',
      '欢迎大家积极参与。'
    ]
  },

  {
    id: 'notice003',
    type: '新品',
    typeClass: 'type-new',
    title: '下周新品正在征集意见',
    date: '2026-09-16',
    content: [
      '新品共创开始啦！',
      '本周我们准备了三款新品候选菜品：辣子鸡、番茄牛腩、黑椒鸡排。',
      '大家可以进入“本周投票”页面选择自己最想吃的一款。',
      '投票结果会作为餐厅后续新品调整的重要参考。',
      '欢迎大家参与投票，也欢迎在留言区补充自己的意见。'
    ]
  },

  {
    id: 'notice004',
    type: '活动',
    typeClass: 'type-event',
    title: '周末双人套餐限时上线',
    date: '2026-09-14',
    content: [
      '本周末限时活动开始啦！',
      '双人套餐包含两份主菜、两份配菜以及两杯饮品。',
      '活动期间可以直接进入点餐页面选择套餐。',
      '具体套餐内容及价格请以点餐页面显示为准。'
    ]
  },

  {
    id: 'notice005',
    type: '营业',
    typeClass: 'type-business',
    title: '餐厅新增自提服务',
    date: '2026-09-10',
    content: [
      '为了方便大家用餐，我们现在正式开放到店自提服务。',
      '下单时选择“到店自提”，订单制作完成后前往餐厅领取即可。',
      '如需了解订单状态，可以进入“订单”页面查看。'
    ]
  }
]

Page({
  data: {
    notice: null
  },

  onLoad(options) {
    const id = options.id

    const notice = notices.find(item => item.id === id)

    if (!notice) {
      wx.showToast({
        title: '公告不存在',
        icon: 'none'
      })

      setTimeout(() => {
        wx.navigateBack()
      }, 1200)

      return
    }

    this.setData({
      notice
    })
  },

  goCommunity() {
    wx.navigateTo({
      url: '/pages/community/community'
    })
  },

  goMenu() {
    wx.switchTab({
      url: '/pages/menu/menu'
    })
  }
})