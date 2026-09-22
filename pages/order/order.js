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

    const id =
      e.currentTarget.dataset.id


    wx.showModal({

      title: '订单付款',

      content:
        '第一版暂时使用演示付款功能，真实微信支付后续再接入。',

      confirmText: '模拟支付',

      cancelText: '取消',

      success: (res) => {

        if (!res.confirm) {
          return
        }


        const orders =
          wx.getStorageSync('orders') || []


        const updatedOrders =
          orders.map(order => {

            if (order.id === id) {

              return {

                ...order,

                status: 'accepted',

                statusName: '商家已接单'

              }

            }

            return order

          })


        wx.setStorageSync(
          'orders',
          updatedOrders
        )


        this.loadOrders()


        wx.showToast({

          title: '支付成功',

          icon: 'success'

        })

      }

    })

  },

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

      const updatedOrders =
        orders.map(order => {

          if (order.id === id) {

            return {

              ...order,

              status: 'cancelled',

              statusName: '已取消',

              cancelTime:
                new Date().toLocaleString()

            }

          }

          return order

        })

      wx.setStorageSync(
        'orders',
        updatedOrders
      )

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