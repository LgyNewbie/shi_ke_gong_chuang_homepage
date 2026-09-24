const {
  updateOrderStatus
} = require('../../utils/notification.js')

Page({
  data: {
    tabs: [
      {
        id: 'all',
        name: '全部'
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
        id: 'ready',
        name: '待取餐'
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

    currentTab: 'all',

    orders: [],

    filteredOrders: [],

    pendingCount: 0,
    acceptedCount: 0,
    cookingCount: 0,
    deliveryCount: 0,
    readyCount: 0
  },


  onShow() {
    this.loadOrders()
  },


  // =========================
  // 加载订单
  // =========================

  loadOrders() {
    const orders =
      wx.getStorageSync('orders') || []

    this.setData({
      orders
    }, () => {

      this.updateStats()

      this.filterOrders()

    })
  },


  // =========================
  // 统计
  // =========================

  updateStats() {
    const orders = this.data.orders

    this.setData({

      pendingCount:
        orders.filter(
          item => item.status === 'pending'
        ).length,
    
      acceptedCount:
        orders.filter(
          item => item.status === 'accepted'
        ).length,
    
      cookingCount:
        orders.filter(
          item => item.status === 'cooking'
        ).length,
    
      deliveryCount:
        orders.filter(
          item => item.status === 'delivery'
        ).length,
    
      readyCount:
        orders.filter(
          item => item.status === 'ready'
        ).length
    
    })
  },


  // =========================
  // 分类
  // =========================

  switchTab(e) {
    const id =
      e.currentTarget.dataset.id

    this.setData({
      currentTab: id
    }, () => {

      this.filterOrders()

    })
  },


  filterOrders() {
    const tab = this.data.currentTab

    let result =
      this.data.orders

    if (tab !== 'all') {

      result =
        this.data.orders.filter(
          order => order.status === tab
        )

    }

    this.setData({
      filteredOrders: result
    })
  },


  // =========================
  // 修改订单状态
  // =========================

  changeStatus(e) {

    const id =
      e.currentTarget.dataset.id
  
    const status =
      e.currentTarget.dataset.status
  
    let statusName = ''
  
    // =========================
    // 商家接单
    // =========================
  
    if (status === 'accepted') {
      statusName = '已接单'
    }
  
    // =========================
    // 开始制作
    // =========================
  
    if (status === 'cooking') {
      statusName = '制作中'
    }
  
    // =========================
    // 开始配送
    // =========================
  
    if (status === 'delivery') {
      statusName = '配送中'
    }

    // =========================
    // 到店自取：制作完成，等待取餐
    // =========================

    if (status === 'ready') {
      statusName = '待取餐'
    }
  
    // =========================
    // 完成订单
    // =========================
  
    if (status === 'completed') {
      statusName = '已完成'
    }
  
    if (!statusName) {
      return
    }

    
  
    // =========================
    // 找到订单
    // =========================
  
    const order =
      this.data.orders.find(
        item => String(item.id) === String(id)
      )
  
    if (!order) {
  
      wx.showToast({
        title: '订单不存在',
        icon: 'none'
      })

    // =========================
// 根据配送方式限制流程
// =========================

if (
  status === 'delivery' &&
  order.deliveryType === 'pickup'
) {

  wx.showToast({
    title: '到店自取订单无需配送',
    icon: 'none'
  })

  return
}

if (
  status === 'ready' &&
  order.deliveryType !== 'pickup'
) {

  wx.showToast({
    title: '外卖订单无需等待取餐',
    icon: 'none'
  })

  return
}
  
      return
    }
  
    // =========================
    // 待接单必须已经付款
    // =========================
  
    if (
      status === 'accepted' &&
      order.paymentStatus !== 'paid'
    ) {
  
      wx.showToast({
        title: '顾客尚未付款',
        icon: 'none'
      })
  
      return
    }
  
    wx.showModal({
  
      title: '更新订单',
  
      content:
        `确定将订单状态修改为“${statusName}”吗？`,
  
      confirmText: '确定',
  
      cancelText: '取消',
  
      success: (res) => {
  
        if (!res.confirm) {
          return
        }
  
        const updatedOrder =
          updateOrderStatus(
            id,
            status,
            statusName
          )
  
        if (!updatedOrder) {
  
          wx.showToast({
            title: '订单不存在',
            icon: 'none'
          })
  
          return
        }
  
        this.loadOrders()
  
        wx.showToast({
          title: statusName,
          icon: 'success'
        })
  
      }
  
    })
  },
})