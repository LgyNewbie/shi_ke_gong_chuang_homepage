
Page({

  data: {

    currentTab: 'hot',

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
        avatar: '/images/avatar1.jpg',

        reply: '感谢你的建议！我们已经在测试微辣版本，预计下周公布结果。',
        replyTime: '餐厅官方 · 1小时前'
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
        avatar: '/images/avatar2.jpg',

        reply: '收到！番茄牛腩已经进入新品评估阶段。',
        replyTime: '餐厅官方 · 2小时前'
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
        avatar: '/images/avatar3.jpg',

        reply: '',
        replyTime: ''
      },

      {
        id: 4,
        name: '吃货小张',
        level: 2,
        time: '昨天',
        tag: '其他',
        text: '希望以后可以增加自取提醒，不然有时候容易忘记来拿。',
        image: '',
        likes: 58,
        comments: 10,
        avatar: '/images/avatar1.jpg',

        reply: '这个功能我们记下了，会在后续版本考虑。',
        replyTime: '餐厅官方 · 昨天'
      }
    ]
  },

  onShow() {
    this.loadMessages()
  },
  
  async loadMessages() {
    try {
      const sortMap = {
        hot: 'hot',
        likes: 'likes',
        comments: 'comments'
      }
  
      const sort = sortMap[this.data.currentTab] || 'hot'
  
      const result = await new Promise((resolve, reject) => {
        wx.request({
          url: 'http://192.168.254.145:3000/api/messages',
          method: 'GET',
          data: {
            sort
          },
          success: (res) => {
            if (res.data && res.data.code === 0) {
              resolve(res.data.data || [])
            } else {
              reject(new Error(res.data?.message || '获取留言失败'))
            }
          },
          fail: reject
        })
      })
  
      const messages = result.map(item => {
        const images = Array.isArray(item.images)
          ? item.images
          : []
  
        return {
          id: item.id,
          name: item.nickname || '食客',
          userName: item.nickname || '食客',
          level: 1,
          time: item.created_at || '',
          tag: '食客留言',
          text: item.content || '',
          image: images[0] || '',
          images,
          likes: Number(item.like_count || 0),
          comments: Number(item.comment_count || 0),
          avatar: '',
          reply: '',
          replyTime: ''
        }
      })
  
      this.setData({
        messages
      })
  
    } catch (error) {
      console.error('加载留言失败：', error)
  
      wx.showToast({
        title: '留言加载失败',
        icon: 'none'
      })
    }
  },

  switchTab(e) {

    const tab = e.currentTarget.dataset.tab

    this.setData({
      currentTab: tab
    })

  },

  goBack() {

    wx.navigateBack()

  },

  openDetail(e) {

    const id = e.currentTarget.dataset.id
  
    wx.navigateTo({
  
      url: '/pages/message-detail/message-detail?id=' + id
  
    })
  
  },

  writeMessage() {

    wx.navigateTo({
      url: '/pages/message-create/message-create'
    })
  
  }

})