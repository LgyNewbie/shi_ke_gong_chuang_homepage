Page({
  data: {
    categories: ['全部', '营业', '活动', '新品'],
    currentCategory: '全部',

    notices: [
      {
        id: 'notice001',
        type: '营业',
        typeClass: 'type-business',
        title: '餐厅本周营业时间调整通知',
        summary: '本周六、周日营业时间调整为 10:30—22:00，请大家合理安排用餐时间。',
        date: '2026-09-20',
        pinned: true,

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
        summary: '在食客留言区分享你的用餐体验，还有机会获得下次用餐优惠。',
        date: '2026-09-18',
        pinned: false,

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
        summary: '辣子鸡、番茄牛腩、黑椒鸡排三款新品正在进行食客投票。',
        date: '2026-09-16',
        pinned: false,

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
        summary: '本周末推出双人套餐，包含主菜、配菜和饮品，欢迎大家前来体验。',
        date: '2026-09-14',
        pinned: false,

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
        summary: '现在支持到店自提，下单时可以选择“到店自提”，减少等待时间。',
        date: '2026-09-10',
        pinned: false,

        content: [
          '为了方便大家用餐，我们现在正式开放到店自提服务。',
          '下单时选择“到店自提”，订单制作完成后前往餐厅领取即可。',
          '如需了解订单状态，可以进入“订单”页面查看。'
        ]
      }
    ],

    filteredNotices: []
  },

  onLoad() {
    this.filterNotices()
  },

  changeCategory(e) {
    const category = e.currentTarget.dataset.category

    this.setData({
      currentCategory: category
    }, () => {
      this.filterNotices()
    })
  },

  filterNotices() {
    const {
      notices,
      currentCategory
    } = this.data

    let result = notices

    if (currentCategory !== '全部') {
      result = notices.filter(item => item.type === currentCategory)
    }

    this.setData({
      filteredNotices: result
    })
  },

  openDetail(e) {
    const id = e.currentTarget.dataset.id

    wx.navigateTo({
      url: `/pages/notice-detail/notice-detail?id=${id}`
    })
  }
})