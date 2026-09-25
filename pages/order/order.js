const {
  addOrderNotification,
  updateOrderStatus
} = require('../../utils/notification.js')

const {
  useCoupon
} = require('../../utils/coupon.js')

Page({

  data: {

    // 当前筛选
    currentTab: 'all',

    tabs: [
      {
        id: 'all',
        name: '全部'
      },
      {
        id: 'unpaid',
        name: '待付款'
      },
      {
        id: 'pending',
        name: '待接单'
      },
      {
        id: 'accepted',
        name: '已接单'
      },
      {
        id: 'cooking',
        name: '制作中'
      },
      {
        id: 'delivery',
        name: '配送中'
      },
      {
        id: 'completed',
        name: '已完成'
      },
      {
        id: 'cancelled',
        name: '已取消'
      }
    ],

    // 全部订单
    orders: [],

    // 当前显示订单
    filteredOrders: []

  },


  onLoad() {

    this.loadOrders()

  },


  onShow() {

    this.loadOrders()

  },

  // =========================
// 检查待付款订单是否超过30分钟
// 超时后自动取消并释放优惠券
// =========================
checkOrderTimeout(order) {

  if (!order || !order.id) {
    return order
  }

  // 已支付订单不处理
  if (order.paymentStatus === 'paid') {
    return order
  }

  // 不是待付款订单不处理
  if (order.paymentStatus !== 'unpaid') {
    return order
  }

  // 已经取消的订单不处理
  if (order.status === 'cancelled') {
    return order
  }

  // 没有创建时间无法判断
  if (!order.createTime) {
    return order
  }

  const createTime =
    new Date(order.createTime).getTime()

  if (isNaN(createTime)) {
    return order
  }

  const now = Date.now()

  const timeout =
    30 * 60 * 1000

  // 未超过30分钟
  if (now - createTime < timeout) {
    return order
  }

  // =========================
  // 超过30分钟
  // =========================

  const newOrder = {
    ...order,

    status: 'cancelled',
    statusName: '订单超时取消',

    cancelTime:
      new Date().toLocaleString(),

    selectedCouponId: '',
    coupon: null,
    couponDiscount: 0
  }

  // 重新计算订单金额
  const finalTotal = Math.max(
    0,
    Number(newOrder.cartTotal || 0)
    - Number(newOrder.productDiscount || 0)
    + Number(newOrder.packingFee || 0)
    + Number(newOrder.deliveryFee || 0)
  )

  newOrder.finalTotal =
    Number(finalTotal.toFixed(2))

  newOrder.total =
    Number(finalTotal.toFixed(2))

  return newOrder
},


  // 加载订单
  loadOrders(){

    let orders =
      wx.getStorageSync('orders') || []
  
    // =========================
    // 自动检查待付款订单
    // =========================
  
    let hasTimeoutOrder = false
  
    orders = orders.map(order => {
  
      const checkedOrder =
        this.checkOrderTimeout(order)
  
      if (checkedOrder !== order) {
        hasTimeoutOrder = true
      }
  
      return checkedOrder
    })
  
    if (hasTimeoutOrder) {
  
      wx.setStorageSync(
        'orders',
        orders
      )
  
    }
  
    const newOrders = orders.map(order => {
  
      let itemCount = 0
  
      if (Array.isArray(order.items)) {
  
        order.items.forEach(item => {
  
          itemCount +=
            Number(item.count || 0)
  
        })
  
      }
  
      // 兼容旧订单
      const cartTotal =
        Number(
          order.cartTotal !== undefined
            ? order.cartTotal
            : order.total || 0
        )
  
      const productDiscount =
        Number(order.productDiscount || 0)
  
      const couponDiscount =
        Number(order.couponDiscount || 0)
  
      const packingFee =
        Number(order.packingFee || 0)
  
      const deliveryFee =
        Number(order.deliveryFee || 0)
  
      const finalTotal =
        Number(
          order.finalTotal !== undefined
            ? order.finalTotal
            : order.total || 0
        )
  
      const paymentMethod =
        order.paymentMethod || '微信支付'
  
      return {
  
        ...order,
  
        itemCount,
  
        cartTotal,
  
        productDiscount,
  
        couponDiscount,
  
        packingFee,
  
        deliveryFee,
  
        finalTotal,
  
        paymentMethod
  
      }
  
    })
  
    this.setData({
  
      orders: newOrders
  
    }, () => {
  
      this.filterOrders()
  
    })
  },


  // 筛选
  filterOrders(){

    const tab = this.data.currentTab
  
    let result = this.data.orders
  
    // 全部
    if(tab === 'all'){
  
      result = this.data.orders
  
    }
  
    // 待付款
    else if(tab === 'unpaid'){
  
      result = this.data.orders.filter(
        order =>
          order.status === 'pending' &&
          order.paymentStatus !== 'paid'
      )
  
    }
  
    // 待接单
    else if(tab === 'pending'){
  
      result = this.data.orders.filter(
        order =>
          order.status === 'pending' &&
          order.paymentStatus === 'paid'
      )
  
    }
  
    // 其他订单状态
    else{
  
      result = this.data.orders.filter(
        order => order.status === tab
      )
  
    }
  
    this.setData({
      filteredOrders: result
    })
  },


  // 切换标签
  switchTab(e) {

    const id =
      e.currentTarget.dataset.id


    this.setData({

      currentTab: id

    }, () => {

      this.filterOrders()

    })

  },


  // 打开订单详情
  openDetail(e) {

    const id =
      e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/order-detail/order-detail?id=' + id
    })
  },


  // 去付款
  payOrder(e){

    const id = e.currentTarget.dataset.id
  
    const orders =
      wx.getStorageSync('orders') || []
  
    const order = orders.find(
      item => String(item.id) === String(id)
    )
  
    if(!order){
      wx.showToast({
        title:'订单不存在',
        icon:'none'
      })
      return
    }
  
    // 已经支付过
    if(order.paymentStatus === 'paid'){
      wx.showToast({
        title:'该订单已经支付',
        icon:'none'
      })
      return
    }
  
    wx.showModal({
  
      title:'确认支付',
  
      content:
        `支付金额：¥${Number(
          order.finalTotal !== undefined
            ? order.finalTotal
            : order.total || 0
        ).toFixed(2)}`,
  
      confirmText:'确认支付',
  
      cancelText:'暂不支付',
  
      success:(res)=>{
  
        if(!res.confirm) return
  
        const currentOrders =
          wx.getStorageSync('orders') || []
  
        const updatedOrders =
          currentOrders.map(item => {
  
            if(String(item.id) !== String(id)){
              return item
            }
  
            return {
              ...item,
  
              // 支付成功
              paymentStatus:'paid',
  
              // 支付完成后仍然等待商家接单
              status:'pending',
              statusName:'待接单',
  
              paymentTime:
                new Date().toLocaleString()
            }
  
          })
  
          wx.setStorageSync(
            'orders',
            updatedOrders
          )
          
          // =========================
          // 支付成功后核销优惠券
          // =========================
          
          const paidOrder =
            updatedOrders.find(
              item => String(item.id) === String(id)
            )
          
          if (
            paidOrder &&
            paidOrder.selectedCouponId
          ) {
          
            useCoupon(
              paidOrder.selectedCouponId,
              paidOrder.id
            )
          
          }
          
          this.loadOrders()
          
          wx.showToast({
            title:'支付成功',
            icon:'success'
          })
  
      }
  
    })
  },

  // 取消订单
// 取消订单
cancelOrder(e) {

  const id =
    e.currentTarget.dataset.id

  wx.showModal({

    title: '取消订单',

    content: '确定要取消这个待付款订单吗？',

    confirmText: '确定取消',

    cancelText: '暂不取消',

    success: (res) => {

      if (!res.confirm) {
        return
      }

      const orders =
        wx.getStorageSync('orders') || []

      let cancelledOrder = null

      const updatedOrders =
        orders.map(order => {

          if (order.id === id) {

            cancelledOrder = {
              ...order,
            
              status: 'cancelled',
            
              statusName: '已取消',
            
              cancelTime:
                new Date().toLocaleString(),
            
              // 取消订单后释放优惠券
              selectedCouponId: '',
              coupon: null,
              couponDiscount: 0
            }

            return cancelledOrder
          }

          return order
        })


      // 保存订单
      wx.setStorageSync(
        'orders',
        updatedOrders
      )

      const updatedOrder =
  updatedOrders.find(order => order.id === id)

if (updatedOrder) {
  addOrderNotification(
    updatedOrder,
    'accepted'
  )
}


      // 生成订单取消通知
      if (cancelledOrder) {

        addOrderNotification(
          cancelledOrder,
          'cancelled'
        )

      }


      // 刷新订单页面
      this.loadOrders()


      wx.showToast({

        title: '订单已取消',

        icon: 'success'

      })

    }

  })

},

  // 再来一单
  reorder(e) {

    wx.showToast({

      title: '已加入购物车',

      icon: 'success'

    })

  },


  // 去点餐
  goMenu() {

    wx.navigateTo({

      url: '/pages/menu/menu'

    })

  }

})