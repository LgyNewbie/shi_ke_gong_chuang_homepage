const {
  updateOrderStatus
} = require('../../utils/notification.js')

Page({

  data: {
    orderId: '',
    order: {},
    statusIcon: '◷',
    statusDescription: '订单已经提交，等待处理',
    timeline: []
  },

  

  onLoad(options) {

    const id = options.id || ''

    this.setData({
      orderId: id
    })

    this.loadOrder()

  },


  onShow() {

    if (this.data.orderId) {
      this.loadOrder()
    }

  },


  // 读取订单
  loadOrder(){

    const orders =
      wx.getStorageSync('orders') || []
  
    const oldOrder =
      orders.find(
        item =>
          String(item.id) ===
          String(this.data.orderId)
      )
  
    if(!oldOrder){
  
      wx.showToast({
        title:'订单不存在',
        icon:'none'
      })
  
      return
    }
  
  
    // =========================
    // 兼容旧订单
    // =========================
  
    const cartTotal =
      Number(
        oldOrder.cartTotal !== undefined
          ? oldOrder.cartTotal
          : oldOrder.total || 0
      )
  
    const productDiscount =
      Number(oldOrder.productDiscount || 0)
  
    const couponDiscount =
      Number(oldOrder.couponDiscount || 0)
  
    const packingFee =
      Number(oldOrder.packingFee || 0)
  
    const deliveryFee =
      Number(oldOrder.deliveryFee || 0)
  
    const finalTotal =
      Number(
        oldOrder.finalTotal !== undefined
          ? oldOrder.finalTotal
          : oldOrder.total || 0
      )
  
    const paymentMethod =
      oldOrder.paymentMethod || '微信支付'
  
  
    const order = {
  
      ...oldOrder,
  
      cartTotal,
      productDiscount,
      couponDiscount,
      packingFee,
      deliveryFee,
      finalTotal,
      paymentMethod
  
    }
  
  
    const reviews = wx.getStorageSync('foodReviews') || []

const orderItems = Array.isArray(order.items)
  ? order.items.map(item => {

      const isReviewed =
        Array.isArray(reviews) &&
        reviews.some(review =>
          String(review.orderId) === String(order.id) &&
          Number(review.foodId) === Number(item.id)
        )

      return {
        ...item,
        isReviewed
      }
    })
  : []

order.items = orderItems

this.setData({

  order

},()=>{

  this.updateStatus()
  this.buildTimeline()

})
  
  },


  // 更新状态显示
  updateStatus(){
    const status = this.data.order.status
    const paymentStatus = this.data.order.paymentStatus
  
    let icon = '◷'
    let description = '订单已经提交，等待处理'
  
    if(status === 'pending' && paymentStatus !== 'paid'){
      icon = '◷'
      description = '订单已经提交，等待付款'
    }
  
    if(status === 'pending' && paymentStatus === 'paid'){
      icon = '◷'
      description = '支付成功，等待商家接单'
    }
  
    if(status === 'accepted'){
      icon = '✓'
      description = '商家已经接单，正在安排制作'
    }
  
    if(status === 'cooking'){
      icon = '🍳'
      description = '餐厅正在为你制作'
    }
  
    if(status === 'delivery'){
      icon = '🚚'
      description = '订单正在配送中'
    }
  
    if(status === 'ready'){
      icon = '✓'
      description = '餐品已经制作完成，请到店取餐'
    }
  
    if(status === 'completed'){
      icon = '✓'
      description = '订单已经完成，感谢你的支持'
    }
  
    if(status === 'cancelled'){
      icon = '×'
      description = '这个订单已经取消'
    }
  
    this.setData({
      statusIcon: icon,
      statusDescription: description
    })
  },


  // 创建时间线
  buildTimeline() {

    const order =
      this.data.order


    // 已取消单独处理
    if (order.status === 'cancelled') {

      this.setData({

        timeline: []

      })

      return

    }


    const stages = [
      {id:'pending',name:'已下单'},
      {id:'accepted',name:'商家已接单'},
      {id:'cooking',name:'制作中'}
    ]
    
    if (order.deliveryType === 'pickup') {
      stages.push({
        id:'ready',
        name:'待取餐'
      })
    } else {
      stages.push({
        id:'delivery',
        name:'配送中'
      })
    }
    
    stages.push({
      id:'completed',
      name:'已完成'
    })


    const orderIndex =
      stages.findIndex(item => {

        return item.id === order.status

      })


    const timeline =
      stages.map((item, index) => {

        return {

          ...item,

          active:
            index <= orderIndex,

          current:
            index === orderIndex,

          last:
            index === stages.length - 1,

          time:
            index <= orderIndex
              ? order.createTime
              : ''

        }

      })


    this.setData({

      timeline: timeline

    })

  },


  // 返回
  goBack() {

    wx.navigateBack()

  },


  // 返回订单
  goBackToOrders() {

    wx.switchTab({

      url: '/pages/order/order'

    })

  },


  // 付款
payOrder() {

  const order = this.data.order

  if (!order || !order.id) {
    return
  }

  // 已经付款，不能重复付款
  if (order.paymentStatus === 'paid') {

    wx.showToast({
      title: '该订单已经付款',
      icon: 'none'
    })

    return
  }

  wx.showModal({

    title: '确认付款',

    content:
      `确认支付 ¥${order.finalTotal || order.total || 0} 吗？`,

    confirmText: '确认支付',

    cancelText: '取消',

    success: (res) => {

      if (!res.confirm) {
        return
      }

      const orders =
        wx.getStorageSync('orders') || []

      const index =
        orders.findIndex(item => {
          return String(item.id) ===
            String(order.id)
        })

      if (index === -1) {

        wx.showToast({
          title: '订单不存在',
          icon: 'none'
        })

        return
      }

      // =========================
      // 支付成功
      // =========================

      orders[index] = {
        ...orders[index],

        paymentStatus: 'paid',

        paymentTime:
          new Date().toLocaleString(),

        // 付款后仍然等待商家接单
        status: 'pending',

        statusName: '待接单'
      }

      wx.setStorageSync(
        'orders',
        orders
      )


      wx.showToast({
        title: '支付成功',
        icon: 'success'
      })

    }

  })

},


  // 再来一单
  reorder() {

    wx.showToast({

      title: '再来一单下一步完善',

      icon: 'none'

    })

  },

  // 打开商品评价
openReview(e) {

  const orderId =
    e.currentTarget.dataset.orderId

  const foodId =
    e.currentTarget.dataset.foodId

  if (!orderId || !foodId) {

    wx.showToast({
      title: '商品信息异常',
      icon: 'none'
    })

    return
  }

  wx.navigateTo({

    url:
      `/pages/food-review/food-review?orderId=${orderId}&foodId=${foodId}`

  })

},



  // 联系餐厅
  contactRestaurant() {

    wx.showModal({

      title: '联系餐厅',

      content:
        '后续可以接入客服电话、在线客服或商家留言。',

      showCancel: false

    })

  }

})