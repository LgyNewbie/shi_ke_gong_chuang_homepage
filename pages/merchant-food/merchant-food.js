Page({

  data: {
    foods: [],
    currentTab: 'all'
  },

  onLoad() {
    this.loadFoods()
  },

  onShow() {
    this.loadFoods()
  },

  // 加载商品
  loadFoods() {

    const foods =
      wx.getStorageSync('allFoods') || []

    // 兼容旧商品
    // 没有 isOnSale 的商品默认视为已上架
    const normalizedFoods = foods.map(food => ({
      ...food,
      isOnSale:
        food.isOnSale !== false
    }))

    wx.setStorageSync(
      'allFoods',
      normalizedFoods
    )

    this.setData({
      foods: normalizedFoods
    })
  },

  // 切换商品状态筛选
  selectTab(e) {

    const tab =
      e.currentTarget.dataset.tab

    this.setData({
      currentTab: tab
    })
  },

  // 获取当前显示商品
  getFilteredFoods() {

    const foods = this.data.foods
    const tab = this.data.currentTab

    if (tab === 'on') {

      return foods.filter(
        food => food.isOnSale !== false
      )

    }

    if (tab === 'off') {

      return foods.filter(
        food => food.isOnSale === false
      )

    }

    return foods
  },

  // 新增商品
  addFood() {

    wx.navigateTo({
      url:
        '/pages/merchant-food/merchant-food-edit'
    })

  },

  // 编辑商品
  editFood(e) {

    const id =
      e.currentTarget.dataset.id

    wx.navigateTo({
      url:
        `/pages/merchant-food/merchant-food-edit?id=${encodeURIComponent(id)}`
    })

  },

  // 上架 / 下架
  toggleSale(e) {

    const id =
      e.currentTarget.dataset.id

    const foods =
      this.data.foods.map(food => {

        if (food.id !== id) {
          return food
        }

        return {
          ...food,
          isOnSale:
            food.isOnSale === false
        }

      })

    wx.setStorageSync(
      'allFoods',
      foods
    )

    this.setData({
      foods
    })

    const food =
      foods.find(item => item.id === id)

    if (food && food.isOnSale) {

      wx.showToast({
        title: '已重新上架',
        icon: 'success'
      })

    } else {

      wx.showToast({
        title: '已下架',
        icon: 'none'
      })

    }
  },

  // 返回
  goBack() {

    wx.navigateBack({
      delta: 1
    })

  }

})