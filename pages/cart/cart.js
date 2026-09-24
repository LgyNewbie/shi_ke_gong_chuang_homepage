Page({

  data: {

    cartItems: [],

    cartCount: 0,

    cartTotal: 0,

    deliveryFee: 0,

    finalTotal: 0

  },


  onLoad() {

    this.loadCart()

  },


  onShow() {

    this.loadCart()

  },


  // 从点餐页面加载购物车
  loadCart() {

    const foods = wx.getStorageSync('cartFoods') || []

    const cartItems = foods.filter(food => food.count > 0)

    this.setData({

      cartItems: cartItems

    }, () => {

      this.calculateTotal()

    })

  },


  // 计算总价
  calculateTotal() {
    let count = 0
    let total = 0
  
    this.data.cartItems.forEach(item => {
  
      count += item.count
  
      // 默认使用原价
      let itemPrice = Number(item.price || 0)
  
      // 如果商品参加折扣活动，则使用折后价
      if (
        item.discountEnabled === true &&
        Number(item.discount) > 0 &&
        Number(item.discount) < 10
      ) {
        itemPrice =
          Number(item.price || 0) *
          Number(item.discount) /
          10
      }
  
      total += item.count * itemPrice
    })
  
    const deliveryFee = 0
    const finalTotal = total + deliveryFee
  
    this.setData({
  
      cartCount: count,
  
      cartTotal: Number(total.toFixed(2)),
  
      deliveryFee: deliveryFee,
  
      finalTotal: Number(finalTotal.toFixed(2))
  
    })
  },


  // 增加
  increase(e) {

    const id = e.currentTarget.dataset.id

    const items = this.data.cartItems.map(item => {

      if (item.id === id) {

        return {
          ...item,
          count: item.count + 1
        }

      }

      return item

    })


    this.saveCart(items)

  },


  // 减少
  decrease(e) {

    const id = e.currentTarget.dataset.id

    const items = this.data.cartItems.map(item => {

      if (item.id === id && item.count > 1) {

        return {
          ...item,
          count: item.count - 1
        }

      }

      return item

    })


    this.saveCart(items)

  },


  // 删除
  deleteItem(e) {

    const id = e.currentTarget.dataset.id

    wx.showModal({

      title: '删除商品',

      content: '确定要删除这道菜吗？',

      success: (res) => {

        if (!res.confirm) {
          return
        }


        const items = this.data.cartItems.filter(item => {

          return item.id !== id

        })


        this.saveCart(items)

      }

    })

  },


  // 清空购物车
  clearCart() {

    wx.showModal({

      title: '清空购物车',

      content: '确定清空全部商品吗？',

      success: (res) => {

        if (!res.confirm) {
          return
        }


        this.saveCart([])

      }

    })

  },


  // 保存购物车
  saveCart(items) {

    // 先保存完整商品列表
    const allFoods = wx.getStorageSync('allFoods') || []

    const updatedFoods = allFoods.map(food => {

      const found = items.find(item => item.id === food.id)

      return {

        ...food,

        count: found ? found.count : 0

      }

    })


    wx.setStorageSync(
      'allFoods',
      updatedFoods
    )


    wx.setStorageSync(
      'cartFoods',
      items
    )


    this.setData({

      cartItems: items

    }, () => {

      this.calculateTotal()

    })

  },


  // 返回点餐
  goMenu() {

    wx.navigateBack()

  },


  // 返回上一页
  goBack() {

    wx.navigateBack()

  },


  // 去结算
  goCheckout() {

    wx.navigateTo({
      url: '/pages/checkout/checkout'
    })
  
  }

})