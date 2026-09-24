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
  loadOrder() {

    const orders =
      wx.getStorageSync('orders') || []


    const order =
      orders.find(item => {

        return String(item.id) ===
          String(this.data.orderId)

      })


    if (!order) {

      wx.showToast({

        title: '订单不存在',

        icon: 'none'

      })

      return

    }


    this.setData({

      order: order

    }, () => {

      this.updateStatus()

      this.buildTimeline()

    })

  },


  // 更新状态显示
  updateStatus() {

    const status =
      this.data.order.status


    let icon = '◷'

    let description =
      '订单已经提交，等待处理'


    if (status === 'pending') {

      icon = '◷'

      description =
        '订单已经提交，等待付款'

    }


    if (status === 'accepted') {

      icon = '✓'

      description =
        '商家已经接单，正在安排制作'

    }


    if (status === 'cooking') {

      icon = '🍳'

      description =
        '餐厅正在为你制作'

    }


    if (status === 'delivery') {

      icon = '🚚'

      description =
        '订单正在配送中'

    }


    if (status === 'completed') {

      icon = '✓'

      description =
        '订单已经完成，感谢你的支持'

    }


    if (status === 'cancelled') {

      icon = '×'

      description =
        '这个订单已经取消'

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

      {
        id: 'pending',
        name: '已下单'
      },

      {
        id: 'accepted',
        name: '商家已接单'
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
      }

    ]


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
    if (!this.data.order) {
      return
    }
  
    const orderId =
      this.data.order.id
  
    const updatedOrder =
      updateOrderStatus(
        orderId,
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
  
    this.setData({
      order: updatedOrder
    })
  
    wx.showToast({
      title: '订单已接单',
      icon: 'success'
    })
  },


  // 再来一单
  reorder() {

    wx.showToast({

      title: '再来一单下一步完善',

      icon: 'none'

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