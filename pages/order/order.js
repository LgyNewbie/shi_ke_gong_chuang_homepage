const {
  addOrderNotification,
  updateOrderStatus
} = require('../../utils/notification.js')
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


  // 加载订单
  loadOrders(){

    const orders =
      wx.getStorageSync('orders') || []
  
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
                new Date().toLocaleString()
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