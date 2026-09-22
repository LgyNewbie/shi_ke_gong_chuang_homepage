Page({
  data: {
    favorites: []
  },

  onShow() {
    this.loadFavorites()
  },

  loadFavorites() {
    const favorites =
      wx.getStorageSync('favorites') || []

    this.setData({
      favorites
    })
  },

  // 点击菜品
  openFood() {
    wx.switchTab({
      url: '/pages/menu/menu'
    })
  },

  // 取消收藏
  removeFavorite(e) {
    const id = e.currentTarget.dataset.id

    let favorites =
      wx.getStorageSync('favorites') || []

    favorites = favorites.filter(item => item.id !== id)

    wx.setStorageSync('favorites', favorites)

    this.setData({
      favorites
    })

    wx.showToast({
      title: '已取消收藏',
      icon: 'none'
    })
  },

  // 去点餐
  goMenu() {
    wx.switchTab({
      url: '/pages/menu/menu'
    })
  }
})