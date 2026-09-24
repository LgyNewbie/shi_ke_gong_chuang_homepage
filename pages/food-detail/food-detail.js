Page({

  data: {
    food: null,
    isFavorite: false,
    reviews: [],
    reviewCount: 0,
    averageRating: 0
  },

  onLoad(options) {

    const id = Number(options.id)

    if (!id) {
      wx.showToast({
        title: '商品不存在',
        icon: 'none'
      })

      return
    }

    this.foodId = id

    this.loadFood()
  },

  onShow() {

    if (this.foodId) {
      this.loadFavoriteState()
      this.loadReviews()
    }
  
  },

  // 加载商品
  loadFood() {

    const foods =
      wx.getStorageSync('allFoods') || []

    const food =
      foods.find(item => item.id === this.foodId)

    if (!food) {

      wx.showToast({
        title: '商品不存在',
        icon: 'none'
      })

      return
    }

    this.setData({
      food
    }, () => {
    
      this.loadFavoriteState()
      this.loadReviews()
    
    })

  },

  // 加载收藏状态
  loadFavoriteState() {

    const favorites =
      wx.getStorageSync('favorites') || []

    const isFavorite =
      favorites.some(item => item.id === this.foodId)

    this.setData({
      isFavorite
    })

  },

  // 加载商品评价
loadReviews() {

  const reviews =
    wx.getStorageSync('foodReviews') || []

  const foodReviews =
    Array.isArray(reviews)
      ? reviews.filter(item => {
          return Number(item.foodId) ===
            Number(this.foodId)
        })
      : []

  let averageRating = 0

  if (foodReviews.length > 0) {

    const total =
      foodReviews.reduce((sum, item) => {
        return sum + Number(item.rating || 0)
      }, 0)

    averageRating =
      (total / foodReviews.length).toFixed(1)

  }

  this.setData({
    reviews: foodReviews,
    reviewCount: foodReviews.length,
    averageRating
  })

},

  // 收藏 / 取消收藏
  toggleFavorite() {

    const food = this.data.food

    if (!food) {
      return
    }

    let favorites =
      wx.getStorageSync('favorites') || []

    const index =
      favorites.findIndex(item => item.id === food.id)

    if (index >= 0) {

      favorites.splice(index, 1)

      wx.setStorageSync(
        'favorites',
        favorites
      )

      this.setData({
        isFavorite: false
      })

      wx.showToast({
        title: '已取消收藏',
        icon: 'none'
      })

    } else {

      favorites.unshift(food)

      wx.setStorageSync(
        'favorites',
        favorites
      )

      this.setData({
        isFavorite: true
      })

      wx.showToast({
        title: '收藏成功',
        icon: 'none'
      })

    }

  },

  // 增加到购物车
  addToCart() {

    const food = this.data.food

    if (!food) {
      return
    }

    const foods =
      wx.getStorageSync('allFoods') || []

    const updatedFoods =
      foods.map(item => {

        if (item.id === food.id) {

          return {
            ...item,
            count: (item.count || 0) + 1
          }

        }

        return item

      })

    const cartFoods =
      updatedFoods.filter(
        item => item.count > 0
      )

    wx.setStorageSync(
      'allFoods',
      updatedFoods
    )

    wx.setStorageSync(
      'cartFoods',
      cartFoods
    )

    const updatedFood =
      updatedFoods.find(
        item => item.id === food.id
      )

    this.setData({
      food: updatedFood
    })

    wx.showToast({
      title: '已加入购物车',
      icon: 'success'
    })

  },

  // 立即去购物车
  openCart() {

    wx.navigateTo({
      url: '/pages/cart/cart'
    })

  },

  // 返回菜单
  goBack() {

    const pages =
      getCurrentPages()

    if (pages && pages.length > 1) {

      wx.navigateBack({
        delta: 1
      })

      return

    }

    wx.switchTab({
      url: '/pages/menu/menu'
    })

  }

})