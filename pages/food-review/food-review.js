
Page({

  data: {

    // 订单ID
    orderId: '',

    // 商品ID
    foodId: null,

    // 商品信息
    food: {},

    // 订单信息
    order: {},

    // 评分
    rating: 5,

    // 评价内容
    content: '',

    // 是否已经评价
    hasReviewed: false

  },


  onLoad(options) {

    const orderId =
      options.orderId || ''

    const foodId =
      Number(options.foodId)


    this.setData({

      orderId,

      foodId

    })


    this.loadReviewData()

  },


  // 加载评价数据
  loadReviewData() {

    const orders =
      wx.getStorageSync('orders') || []


    const order =
      orders.find(item => {

        return String(item.id) ===
          String(this.data.orderId)

      })


    // =========================
    // 订单不存在
    // =========================

    if (!order) {

      wx.showToast({

        title: '订单不存在',

        icon: 'none'

      })

      return

    }


    // =========================
    // 必须完成订单
    // =========================

    if (order.status !== 'completed') {

      wx.showToast({

        title: '订单完成后才能评价',

        icon: 'none'

      })

      setTimeout(() => {

        wx.navigateBack({
          delta: 1
        })

      }, 500)

      return

    }


    // =========================
    // 检查商品是否属于订单
    // =========================

    const food =
      Array.isArray(order.items)
        ? order.items.find(item => {

            return Number(item.id) ===
              Number(this.data.foodId)

          })
        : null


    if (!food) {

      wx.showToast({

        title: '该商品不属于此订单',

        icon: 'none'

      })

      setTimeout(() => {

        wx.navigateBack({
          delta: 1
        })

      }, 500)

      return

    }


    // =========================
    // 检查是否已经评价
    // =========================

    const reviews =
      wx.getStorageSync('foodReviews') || []


    const reviewed =
      reviews.some(item => {

        return String(item.orderId) ===
          String(this.data.orderId) &&
          Number(item.foodId) ===
          Number(this.data.foodId)

      })


    this.setData({

      order,

      food,

      hasReviewed: reviewed

    })


    if (reviewed) {

      wx.showToast({

        title: '该商品已经评价过了',

        icon: 'none'

      })

      setTimeout(() => {

        wx.navigateBack({
          delta: 1
        })

      }, 500)

    }

  },


  // 选择评分
  selectRating(e) {

    const rating =
      Number(e.currentTarget.dataset.rating)

    this.setData({

      rating

    })

  },


  // 输入评价
  inputContent(e) {

    this.setData({

      content:
        e.detail.value

    })

  },


  // 提交评价
  submitReview() {

    if (this.data.hasReviewed) {

      wx.showToast({

        title: '该商品已经评价过了',

        icon: 'none'

      })

      return

    }


    const content =
      this.data.content.trim()


    if (!content) {

      wx.showToast({

        title: '请输入评价内容',

        icon: 'none'

      })

      return

    }


    if (
      this.data.rating < 1 ||
      this.data.rating > 5
    ) {

      wx.showToast({

        title: '请选择评分',

        icon: 'none'

      })

      return

    }


    const reviews =
      wx.getStorageSync('foodReviews') || []


    // 再次检查，防止重复提交
    const exists =
      reviews.some(item => {

        return String(item.orderId) ===
          String(this.data.orderId) &&
          Number(item.foodId) ===
          Number(this.data.foodId)

      })


    if (exists) {

      wx.showToast({

        title: '该商品已经评价过了',

        icon: 'none'

      })

      this.setData({

        hasReviewed: true

      })

      return

    }


    const review = {

      id:
        `review_${Date.now()}`,

      orderId:
        this.data.orderId,

      foodId:
        this.data.foodId,

      foodName:
        this.data.food.name || '',

      userName:
        '食客',

      rating:
        this.data.rating,

      content,

      createTime:
        new Date().toLocaleString()

    }


    reviews.unshift(review)


    wx.setStorageSync(
      'foodReviews',
      reviews
    )


    this.setData({

      hasReviewed: true

    })


    wx.showToast({

      title: '评价成功',

      icon: 'success'

    })


    setTimeout(() => {

      wx.navigateBack({
        delta: 1
      })

    }, 800)

  },


  // 返回
  goBack() {

    wx.navigateBack({
      delta: 1
    })

  }

})