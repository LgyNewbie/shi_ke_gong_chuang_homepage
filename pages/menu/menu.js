Page({

  data: {

    // 搜索内容
    searchText: '',

    // 当前分类
    currentCategory: 'all',

    // 当前展开的商品
    expandedId: 0,

    // 购物车数量
    cartCount: 0,

    // 购物车金额
    cartTotal: 0,

    //收藏
    favorites: [],

    // 分类
    categories: [
      {
        id: 'all',
        name: '全部'
      },
      {
        id: 'hot',
        name: '热销'
      },
      {
        id: 'rice',
        name: '饭类'
      },
      {
        id: 'noodle',
        name: '面类'
      },
      {
        id: 'snack',
        name: '小吃'
      },
      {
        id: 'drink',
        name: '饮料'
      }
    ],

    // 商品
    foods: [

      {
        id: 1,
        name: '宫保鸡丁饭',
        category: 'rice',
        hot: true,
        price: 18,
        sales: 128,
        image: '/images/food1.jpg',
        desc: '经典川味，鸡肉鲜嫩，花生酥香',
        ingredients: '鸡胸肉、花生、青椒、干辣椒',
        taste: '咸香微辣',
        weight: '约 450g',
        allergen: '含花生',
        count: 0
      },

      {
        id: 2,
        name: '黑椒牛肉饭',
        category: 'rice',
        hot: true,
        price: 22,
        sales: 96,
        image: '/images/food2.jpg',
        desc: '牛肉嫩滑，黑椒香浓，下饭首选',
        ingredients: '牛肉、洋葱、彩椒、黑椒汁',
        taste: '咸香',
        weight: '约 460g',
        allergen: '',
        count: 0
      },

      {
        id: 3,
        name: '香辣鸡腿饭',
        category: 'rice',
        hot: true,
        price: 20,
        sales: 86,
        image: '/images/food3.jpg',
        desc: '外酥里嫩，香辣过瘾',
        ingredients: '鸡腿肉、生菜、辣椒、米饭',
        taste: '香辣',
        weight: '约 480g',
        allergen: '',
        count: 0
      },

      {
        id: 4,
        name: '番茄牛腩面',
        category: 'noodle',
        hot: false,
        price: 24,
        sales: 68,
        image: '/images/food1.jpg',
        desc: '番茄浓汤搭配软嫩牛腩',
        ingredients: '牛腩、番茄、面条、香菜',
        taste: '酸甜',
        weight: '约 520g',
        allergen: '含小麦',
        count: 0
      },

      {
        id: 5,
        name: '招牌炸鸡',
        category: 'snack',
        hot: true,
        price: 16,
        sales: 75,
        image: '/images/food2.jpg',
        desc: '金黄酥脆，外酥里嫩',
        ingredients: '鸡肉、面粉、香料',
        taste: '椒香',
        weight: '约 250g',
        allergen: '含小麦',
        count: 0
      },

      {
        id: 6,
        name: '冰镇柠檬茶',
        category: 'drink',
        hot: false,
        price: 8,
        sales: 54,
        image: '/images/food3.jpg',
        desc: '清爽解腻，酸甜适中',
        ingredients: '红茶、柠檬、冰块',
        taste: '酸甜',
        weight: '500ml',
        allergen: '',
        count: 0
      }

    ],

    // 显示商品
    filteredFoods: []

  },


  onLoad() {
    const savedFoods = wx.getStorageSync('allFoods')
  
    if (savedFoods && savedFoods.length > 0) {
  
      this.setData({
        foods: savedFoods
      }, () => {
        this.updateCart()
        this.filterFoods()
      })
  
    } else {
  
      wx.setStorageSync(
        'allFoods',
        this.data.foods
      )
  
      this.updateCart()
      this.filterFoods()
    }
  },

  onShow() {
    const allFoods = wx.getStorageSync('allFoods')
  
    if (allFoods) {
      this.setData({
        foods: allFoods
      }, () => {
        // 重新计算购物车数量和金额
        this.updateCart()
  
        // 重新加载收藏状态
        this.loadFavorites()
      })
    } else {
      this.updateCart()
      this.loadFavorites()
    }
  },

  // 搜索
  onSearchInput(e) {

    this.setData({

      searchText: e.detail.value

    }, () => {

      this.filterFoods()

    })

  },


  // 清空搜索
  clearSearch() {

    this.setData({

      searchText: ''

    }, () => {

      this.filterFoods()

    })

  },


  // 选择分类
  selectCategory(e) {

    const id = e.currentTarget.dataset.id

    this.setData({

      currentCategory: id

    }, () => {

      this.filterFoods()

    })

  },


  // 商品过滤
  filterFoods() {

    const search =
      this.data.searchText.trim()
  
    const category =
      this.data.currentCategory
  
      const foods =
      this.data.foods
        .filter(food => {
    
          // =========================
          // 只显示已上架商品
          // 旧商品没有 isOnSale 时，
          // 默认视为已上架
          // =========================
    
          const saleMatch =
            food.isOnSale !== false
    
          if (!saleMatch) {
            return false
          }
    
    
          // =========================
          // 分类
          // =========================
    
          let categoryMatch = true
    
          if (category === 'hot') {
    
            categoryMatch =
              food.hot === true
    
          } else if (category !== 'all') {
    
            categoryMatch =
              food.category === category
    
          }
    
    
          // =========================
          // 搜索
          // =========================
    
          let searchMatch = true
    
          if (search) {
    
            searchMatch =
              food.name.includes(search) ||
              food.desc.includes(search)
    
          }
    
    
          return (
            categoryMatch &&
            searchMatch
          )
        })
        .map(food => {
    
          // =========================
          // 计算商品优惠价
          // =========================
    
          let discountPrice = Number(food.price || 0)
    
          if (
            food.discountEnabled === true &&
            Number(food.discount) > 0 &&
            Number(food.discount) < 10
          ) {
            discountPrice =
              Number(food.price || 0) *
              Number(food.discount) /
              10
          }
    
          return {
            ...food,
            discountPrice: discountPrice.toFixed(2)
          }
        })
  
  
    this.setData({
      filteredFoods: foods
    })
  },


  // 展开 / 收起详情
  toggleDetail(e) {

    const id = e.currentTarget.dataset.id

    if (this.data.expandedId === id) {

      this.setData({
        expandedId: 0
      })

    } else {

      this.setData({
        expandedId: id
      })

    }

  },


  // 增加商品
  increaseFood(e) {

    const id = e.currentTarget.dataset.id
  
    const foods = this.data.foods.map(food => {
  
      if (food.id === id) {
  
        return {
          ...food,
          count: food.count + 1
        }
  
      }
  
      return food
  
    })
  
  
    this.setData({
  
      foods: foods
  
    }, () => {
  
      this.saveFoods()
  
      this.updateCart()
  
      this.filterFoods()
  
    })
  
  },

  // 减少商品
  decreaseFood(e) {

    const id = e.currentTarget.dataset.id
  
    const foods = this.data.foods.map(food => {
  
      if (food.id === id && food.count > 0) {
  
        return {
          ...food,
          count: food.count - 1
        }
  
      }
  
      return food
  
    })
  
  
    this.setData({
  
      foods: foods
  
    }, () => {
  
      this.saveFoods()
  
      this.updateCart()
  
      this.filterFoods()
  
    })
  
  },

  saveFoods() {

    const cartFoods = this.data.foods.filter(
      food => food.count > 0
    )
  
  
    wx.setStorageSync(
      'allFoods',
      this.data.foods
    )
  
  
    wx.setStorageSync(
      'cartFoods',
      cartFoods
    )
  
  },


  // 更新购物车
  updateCart() {
    let count = 0
    let total = 0
  
    this.data.foods.forEach(food => {
      count += Number(food.count || 0)
  
      let itemPrice = Number(food.price || 0)
  
      // 如果商品设置了折扣，则购物车使用折后价
      if (
        food.discountEnabled === true &&
        Number(food.discount) > 0 &&
        Number(food.discount) < 10
      ) {
        itemPrice = Number(food.price || 0) * Number(food.discount) / 10
      }
  
      total += Number(food.count || 0) * itemPrice
    })
  
    this.setData({
      cartCount: count,
      cartTotal: Number(total.toFixed(2))
    })
  },


  // 打开购物车
  openCart() {

    wx.navigateTo({
      url: '/pages/cart/cart'
    })
  
  },

  openOrders() {

    wx.switchTab({
      url: '/pages/order/order'
    })
  
  },

  openFoodDetail(e) {
    const id = e.currentTarget.dataset.id
  
    if (!id) {
      return
    }
  
    wx.navigateTo({
      url: `/pages/food-detail/food-detail?id=${encodeURIComponent(id)}`
    })
  },

  loadFavorites() {
    const favorites =
      wx.getStorageSync('favorites') || []
  
    const favoriteIds =
      favorites.map(item => item.id)
  
    const foods = this.data.foods.map(item => ({
      ...item,
      isFavorite: favoriteIds.includes(item.id)
    }))
  
    this.setData({
      foods,
      favorites
    }, () => {
      this.filterFoods()
    })
  },

  // 打开商品详情


  toggleFavorite(e) {
    const id = e.currentTarget.dataset.id
  
    const food = this.data.foods.find(
      item => item.id === id
    )
  
    if (!food) {
      return
    }
  
    let favorites =
      wx.getStorageSync('favorites') || []
  
    const index =
      favorites.findIndex(item => item.id === id)
  
    if (index >= 0) {
  
      // 取消收藏
      favorites.splice(index, 1)
  
      wx.showToast({
        title: '已取消收藏',
        icon: 'none'
      })
  
    } else {
  
      // 添加收藏
      favorites.unshift(food)
  
      wx.showToast({
        title: '收藏成功',
        icon: 'none'
      })
    }
  
    wx.setStorageSync('favorites', favorites)
  
    this.loadFavorites()
  },

})