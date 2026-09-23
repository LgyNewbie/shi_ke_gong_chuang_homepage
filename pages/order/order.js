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
        id: 'pending',
        name: '待付款'
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
  loadOrders() {

    const orders =
      wx.getStorageSync('orders') || []


    // 给每一个订单计算商品总数量
    const newOrders = orders.map(order => {

      let itemCount = 0

      order.items.forEach(item => {

        itemCount += item.count

      })

      return {

        ...order,

        itemCount: itemCount

      }

    })


    this.setData({

      orders: newOrders

    }, () => {

      this.filterOrders()

    })

  },


  // 筛选
  filterOrders() {

    const tab = this.data.currentTab

    let result = this.data.orders


    if (tab !== 'all') {

      result = this.data.orders.filter(order => {

        return order.status === tab

      })

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
  payOrder(e) {
    const id = e.currentTarget.dataset.id
  
    const orders =
      wx.getStorageSync('orders') || []
  
    const order =
      orders.find(item =>
        String(item.id) === String(id)
      )
  
    if (!order) {
      wx.showToast({
        title: '订单不存在',
        icon: 'none'
      })
  
      return
    }
  
    // 模拟付款成功 + 餐厅接单
    const updatedOrder =
      updateOrderStatus(
        id,
        'accepted',
        '已接单'
      )
  
    if (!updatedOrder) {
      wx.showToast({
        title: '订单更新失败',
        icon: 'none'
      })
  
      return
    }
  
    // 刷新订单列表
    this.loadOrders()
  
    wx.showToast({
      title: '订单已接单',
      icon: 'success'
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