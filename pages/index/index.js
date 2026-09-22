const {
  getMessages
} = require('../../utils/message.js')

Page({
  data: {
    messageTab: 'hot',

    messages: [
      {
        id: 1,
        name: '小柠檬',
        level: 3,
        time: '2小时前',
        tag: '新品建议',
        text: '我觉得可以增加微辣版的宫保鸡丁，这样不太能吃辣的人也能吃～',
        image: '/images/food1.jpg',
        likes: 128,
        comments: 32,
        avatar: '/images/avatar1.jpg'
      },
      {
        id: 2,
        name: '美食小王',
        level: 2,
        time: '4小时前',
        tag: '菜品反馈',
        text: '希望增加番茄牛腩饭！真的很好吃！',
        image: '/images/food2.jpg',
        likes: 96,
        comments: 18,
        avatar: '/images/avatar2.jpg'
      },
      {
        id: 3,
        name: '大橙子',
        level: 1,
        time: '6小时前',
        tag: '服务建议',
        text: '建议可以出低辣版的宫保鸡丁，太辣了～',
        image: '',
        likes: 72,
        comments: 26,
        avatar: '/images/avatar3.jpg'
      }
    ],

    polls: [
      { name: '辣子鸡', percent: 48, count: 128 },
      { name: '番茄牛腩', percent: 31, count: 83 },
      { name: '黑椒鸡排', percent: 21, count: 56 }
    ],

    notices: [
      { id: 1, label: '营业', type: 'business', text: '周末营业时间调整，具体时间请查看详情', date: '09-20' },
      { id: 2, label: '活动', type: 'activity', text: '食客共创 · 新品征集活动开始啦！参与有好礼！', date: '09-18' },
      { id: 3, label: '新品', type: 'new', text: '香辣鸡腿饭正式上线，欢迎品尝！', date: '09-16' }
    ]
  },

  openMessageDetail(e) {
    const id = e.currentTarget.dataset.id
  
    if (!id) {
      wx.showToast({
        title: '留言数据异常',
        icon: 'none'
      })
      return
    }
  
    wx.navigateTo({
      url: `/pages/message-detail/message-detail?id=${id}`
    })
  },

  onShow() {
    const messages =
      getMessages(this.data.messages || [])
  
    this.setData({
      messages
    })
  },

  refreshMessages() {
    const messages = getMessages()
  
    this.setData({
      messages
    })
  },

  switchMessageTab(e) {
    this.setData({
      messageTab: e.currentTarget.dataset.tab
    })
  },

  writeMessage() {
    wx.navigateTo({
      url: '/pages/message-create/message-create'
    })
  },

  openMessage() {
    wx.showToast({
      title: '留言详情页下一步制作',
      icon: 'none'
    })
  },

  openCommunity() {
    wx.navigateTo({
      url: '/pages/community/community'
    })
  },

  openPoll() {

    wx.navigateTo({
      url: '/pages/poll/poll'
    })
  
  },

  openNotice(e) {
    const id = e && e.currentTarget
      ? e.currentTarget.dataset.id
      : ''
  
    // 点击具体公告
    if (id) {
      wx.navigateTo({
        url: `/pages/notice-detail/notice-detail?id=${id}`
      })
      return
    }
  
    // 点击“更多”
    wx.navigateTo({
      url: '/pages/notice/notice'
    })
  },

  openMenu() {

    wx.switchTab({
      url: '/pages/menu/menu'
    })
  
  },

  openNotifications() {
    wx.navigateTo({
      url: '/pages/notification/notification'
    })
  },

  navTap(e) {

    const page = e.currentTarget.dataset.page
  
    if (page === 'home') {
      return
    }
  
  
    if (page === 'menu') {
  
      wx.navigateTo({
        url: '/pages/menu/menu'
      })
  
      return
    }
  
  
    if (page === 'order') {

      wx.switchTab({
        url: '/pages/order/order'
      })
    
      return
    }
  
  
    if (page === 'mine') {
      wx.switchTab({
        url: '/pages/mine/mine'
      })
    }
  
  },

})
