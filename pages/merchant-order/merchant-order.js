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

    currentTab: 'all',

    orders: [],

    filteredOrders: [],

    pendingCount: 0,
    acceptedCount: 0,
    cookingCount: 0,
    deliveryCount: 0
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

    if (status === 'cooking') {
      statusName = '制作中'
    }

    if (status === 'delivery') {
      statusName = '配送中'
    }

    if (status === 'completed') {
      statusName = '已完成'
    }

    if (!statusName) {
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
  }
})