Page({

  data: {

    // 配送方式
    deliveryType: 'delivery',

    // 默认地址
    address: {
      name: '',
      phone: '',
      detail: ''
    },

    // 购物车商品
    cartItems: [],

    // 商品小计
    cartTotal: 0,

    // 配送费
    deliveryFee: 0,

    // 最终金额
    finalTotal: 0,

    // 备注
    remark: ''

  },


  onLoad() {

    this.loadCart()

  },


  // 页面重新出现时重新读取
  onShow() {

    this.loadCart()

  },


  // 读取购物车
  loadCart() {

    const cartItems =
      wx.getStorageSync('cartFoods') || []
  
  
    if (cartItems.length === 0) {
  
      wx.showToast({
        title: '购物车是空的',
        icon: 'none'
      })
  
      setTimeout(() => {
  
        wx.navigateBack()
  
      }, 800)
  
      return
    }
  
  
    // 读取默认地址
    const addresses =
      wx.getStorageSync('addresses') || []
  
  
    const defaultAddress =
      addresses.find(item => item.isDefault)
  
  
    this.setData({
  
      cartItems: cartItems,
  
      address: defaultAddress
        ? defaultAddress
        : {
            name: '',
            phone: '',
            detail: ''
          }
  
    }, () => {
  
      this.calculateTotal()
  
    })
  
  },


  // 计算金额
  calculateTotal() {

    let total = 0


    this.data.cartItems.forEach(item => {

      total += item.price * item.count

    })


    let deliveryFee = 0


    // 第一版暂时免配送费
    if (this.data.deliveryType === 'delivery') {

      deliveryFee = 0

    }


    const finalTotal = total + deliveryFee


    this.setData({

      cartTotal: total,

      deliveryFee: deliveryFee,

      finalTotal: finalTotal

    })

  },


  // 选择配送方式
  selectDeliveryType(e) {

    const type =
      e.currentTarget.dataset.type


    this.setData({

      deliveryType: type

    }, () => {

      this.calculateTotal()

    })

  },


  // 选择地址
  chooseAddress() {

    wx.navigateTo({
      url: '/pages/address/address'
    })
  
  },


  // 输入备注
  onRemarkInput(e) {

    this.setData({

      remark: e.detail.value

    })

  },


  // 返回购物车
  goBack() {

    wx.navigateBack()

  },


  // 提交订单
  submitOrder() {

    if (
      this.data.deliveryType === 'delivery' &&
      !this.data.address.detail
    ) {
    
      wx.showModal({
    
        title: '还没有收货地址',
    
        content: '请先添加一个收货地址。',
    
        confirmText: '去添加',
    
        success: (res) => {
    
          if (res.confirm) {
    
            wx.navigateTo({
              url: '/pages/address/address'
            })
    
          }
    
        }
    
      })
    
      return
    }


    // 创建订单
    const order = {

      id: 'SK' + Date.now(),

      status: 'pending',

      statusName: '待付款',

      deliveryType: this.data.deliveryType,

      address: this.data.deliveryType === 'delivery'
        ? this.data.address
        : null,

      items: this.data.cartItems,

      total: this.data.finalTotal,

      remark: this.data.remark,

      createTime: new Date().toLocaleString()

    }


    // 保存订单
    const orders =
      wx.getStorageSync('orders') || []


    orders.unshift(order)


    wx.setStorageSync(
      'orders',
      orders
    )


    // 清空购物车
    const allFoods =
      wx.getStorageSync('allFoods') || []


    const resetFoods =
      allFoods.map(food => {

        return {
          ...food,
          count: 0
        }

      })


    wx.setStorageSync(
      'allFoods',
      resetFoods
    )


    wx.setStorageSync(
      'cartFoods',
      []
    )


    wx.showModal({

      title: '订单提交成功',

      content:
        '订单号：' + order.id,

      confirmText: '查看订单',

      cancelText: '返回首页',

      success: (res) => {

        if (res.confirm) {

          wx.switchTab({
        
            url: '/pages/order/order'
        
          })
        
        } else {
        
          wx.switchTab({
        
            url: '/pages/index/index'
        
          })
        
        }

      }

    })

  }

})