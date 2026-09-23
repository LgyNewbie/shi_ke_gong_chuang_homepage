const {
  addMessage
} = require('../../utils/message.js')


Page({

  data: {

    // 当前选择的留言类型
    currentCategory: 'new',

    // 输入的文字
    content: '',

    // 已选择的图片
    images: [],

    // 是否显示表情
    showEmoji: false,

    // 留言分类
    categories: [

      {
        id: 'new',
        name: '新品建议'
      },

      {
        id: 'food',
        name: '菜品反馈'
      },

      {
        id: 'service',
        name: '服务建议'
      },

      {
        id: 'other',
        name: '其他'
      }

    ],

    // 表情
    emojis: [

      '😀', '😄', '😂', '😊',
      '😍', '🥰', '😋', '😎',
      '👍', '❤️', '🔥', '🎉',
      '👏', '🤔', '😮', '😭'

    ]

  },


  // =========================
  // 返回
  // =========================

  goBack() {

    wx.navigateBack()

  },


  // =========================
  // 选择留言类型
  // =========================

  selectCategory(e) {

    const id =
      e.currentTarget.dataset.id


    this.setData({

      currentCategory:
        id

    })

  },


  // =========================
  // 输入文字
  // =========================

  onContentInput(e) {

    this.setData({

      content:
        e.detail.value

    })

  },


  // =========================
  // 显示/隐藏表情
  // =========================

  toggleEmoji() {

    this.setData({

      showEmoji:
        !this.data.showEmoji

    })

  },


  // =========================
  // 选择表情
  // =========================

  chooseEmoji(e) {

    const emoji =
      e.currentTarget.dataset.emoji


    this.setData({

      content:
        this.data.content +
        emoji,

      showEmoji:
        false

    })

  },


  // =========================
  // 选择图片
  // =========================

  chooseImage() {

    const remain =
      9 -
      this.data.images.length


    if (remain <= 0) {

      wx.showToast({

        title:
          '最多添加9张图片',

        icon:
          'none'

      })

      return

    }


    wx.chooseMedia({

      count:
        remain,

      mediaType:
        ['image'],

      sourceType:
        ['album', 'camera'],

      success:
        (res) => {

          const newImages =
            res.tempFiles.map(
              item =>
                item.tempFilePath
            )


          this.setData({

            images: [

              ...this.data.images,

              ...newImages

            ]

          })

        }

    })

  },


  // =========================
  // 删除图片
  // =========================

  deleteImage(e) {

    const index =
      e.currentTarget.dataset.index


    const images =
      [...this.data.images]


    images.splice(
      index,
      1
    )


    this.setData({

      images:
        images

    })

  },


  // =========================
  // 预览图片
  // =========================

  previewImage(e) {

    const index =
      e.currentTarget.dataset.index


    wx.previewImage({

      current:
        this.data.images[index],

      urls:
        this.data.images

    })

  },


  // =========================
  // 发布留言
  // =========================

  publishMessage() {

    const content =
      this.data.content.trim()


    // 没有内容
    if (
      !content &&
      this.data.images.length === 0
    ) {

      wx.showToast({

        title:
          '先写点内容或添加图片吧',

        icon:
          'none'

      })

      return

    }


    const categoryMap = {

      new:
        '新品建议',

      food:
        '菜品反馈',

      service:
        '服务建议',

      other:
        '其他'

    }


    const category =
      categoryMap[
        this.data.currentCategory
      ] ||
      '其他'


    // =========================
    // 创建留言
    // =========================

    const newMessage = {

      id:
        `msg_${Date.now()}`,

      userName:
        '食客',

      name:
        '食客',

      avatar:
        '',

      level:
        1,

      category:
        category,

      tag:
        category,

      text:
        content,

      content:
        content,

      images:
        this.data.images || [],

      image:
        this.data.images.length > 0
          ? this.data.images[0]
          : '',

      likes:
        0,

      comments:
        0,

      commentsCount:
        0,

      commentList:
        [],

      time:
        '刚刚',

      createTime:
        new Date().toLocaleString(),

      status:
        'pending',

      statusName:
        '待处理'

    }


    // =========================
    // 只调用一次
    // addMessage 已经会同步 myMessages
    // =========================

    const savedMessage =
      addMessage(
        newMessage
      )


    // 保留原有新留言缓存
    wx.setStorageSync(
      'newMessage',
      savedMessage
    )


    wx.showToast({

      title:
        '发布成功',

      icon:
        'success',

      duration:
        1000

    })


    setTimeout(() => {

      wx.navigateBack()

    }, 1000)

  }

})