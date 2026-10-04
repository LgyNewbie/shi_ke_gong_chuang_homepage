const {
  updateOrderStatus
} = require('../../utils/notification.js')

const {
  useCoupon
} = require('../../utils/coupon.js')

const {
  request
} = require('../../utils/api.js')

Page({

  testPay() {
    console.log('========== testPay 支付测试 ==========')
  
    const order = this.data.order
  
    console.log('当前订单：', order)
    console.log('backendOrderId：', order && order.backendOrderId)
  
    if (!order || !order.backendOrderId) {
      wx.showModal({
        title: '订单异常',
        content: '当前订单没有 backendOrderId。',
        showCancel: false
      })
      return
    }
  
    wx.showLoading({
      title: '支付中'
    })
  
    request(
      `/api/orders/${order.backendOrderId}/pay`,
      'POST',
      {}
    )
      .then((result) => {
  
        console.log(
          '========== 后端支付成功 ==========',
          result
        )
  
        const orders =
          wx.getStorageSync('orders') || []
  
        const index =
          orders.findIndex(item => {
            return String(item.id) ===
              String(order.id)
          })
  
        if (index === -1) {
          throw new Error('本地订单不存在')
        }
  
        orders[index] = {
          ...orders[index],
  
          paymentStatus: 'paid',
  
          paymentTime:
            new Date().toLocaleString(),
  
          status: 'pending',
  
          statusName: '待接单'
        }
  
        wx.setStorageSync(
          'orders',
          orders
        )
  
        this.setData({
          order: orders[index]
        })
  
        if (orders[index].selectedCouponId) {
          useCoupon(
            orders[index].selectedCouponId,
            orders[index].id
          )
        }
  
        this.updateStatus()
        this.buildTimeline()
  
        wx.hideLoading()
  
        wx.showToast({
          title: '支付成功',
          icon: 'success'
        })
      })
      .catch((error) => {
  
        console.error(
          '========== 后端支付失败 ==========',
          error
        )
  
        wx.hideLoading()
  
        wx.showModal({
          title: '支付失败',
          content: '后端支付失败，请查看控制台。',
          showCancel: false,
          confirmText: '知道了'
        })
      })
  },

  data: {
    showMoreMenu: false,
    orderId: '',
    order: {},
    statusIcon: '◷',
    statusDescription: '订单已经提交，等待处理',
    timeline: [],
  
    // 退款状态
    refund: null,
    refundStatus: '',
    refundStatusText: '',
    refundReviewRemark: '',
    refundAmountText: '',
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


  // =========================
// 检查待付款订单是否超时
// 超过30分钟自动释放优惠券
// =========================
checkOrderTimeout(order) {

  if (!order || !order.id) {
    return order
  }

  // 已经付款，不处理
  if (order.paymentStatus === 'paid') {
    return order
  }

  // 不是待付款订单，不处理
  if (order.paymentStatus !== 'unpaid') {
    return order
  }

  // 没有优惠券，不需要释放
  if (!order.selectedCouponId) {
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
  // 已超过30分钟
  // =========================

  order.selectedCouponId = ''
  order.coupon = null
  order.couponDiscount = 0

  const finalTotal = Math.max(
    0,
    Number(order.cartTotal || 0)
    - Number(order.productDiscount || 0)
    + Number(order.packingFee || 0)
    + Number(order.deliveryFee || 0)
  )

  order.finalTotal =
    Number(finalTotal.toFixed(2))

  order.total =
    Number(finalTotal.toFixed(2))

  order.status = 'cancelled'
  order.statusName = '订单超时取消'

  return order
},


  // 读取订单
  loadOrder(){

    const orders =
  wx.getStorageSync('orders') || []

const orderIndex =
  orders.findIndex(
    item =>
      String(item.id) ===
      String(this.data.orderId)
  )

if (orderIndex === -1) {

  wx.showToast({
    title:'订单不存在',
    icon:'none'
  })

  return
}

let oldOrder =
  orders[orderIndex]

// =========================
// 检查订单是否超过30分钟
// =========================

const checkedOrder =
  this.checkOrderTimeout(oldOrder)

// 如果订单发生超时变化，保存
if (checkedOrder !== oldOrder) {

  orders[orderIndex] = checkedOrder

  wx.setStorageSync(
    'orders',
    orders
  )
}

oldOrder = checkedOrder
  
    
  
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
}, () => {
  this.updateStatus()
  this.buildTimeline()

  // 查询该订单的退款状态
  this.loadRefundStatus()
})
  
  },


  // =========================
// 查询退款状态
// =========================
loadRefundStatus() {

  const order = this.data.order

  // 没有订单
  if (!order) {
    console.log('========== 没有当前订单，跳过退款查询 ==========')
    return
  }

  // 没有后端订单 ID
  if (!order.backendOrderId) {

    console.log(
      '========== 当前订单没有 backendOrderId，跳过退款查询 ==========',
      order
    )

    this.setData({
      refund: null,
      refundStatus: '',
      refundStatusText: '',
      refundReviewRemark: '',
      refundAmountText: ''
    })

    return
  }

  console.log(
    '========== 开始查询退款状态 ==========',
    order.backendOrderId
  )

  request(
    '/api/refunds/mine',
    'GET'
  )
    .then((result) => {

      console.log(
        '========== 前端收到退款数据 ==========',
        result
      )

      // request() 返回值可能直接就是数组
      let list = []

      if (Array.isArray(result)) {
        list = result
      } else if (
        result &&
        Array.isArray(result.data)
      ) {
        list = result.data
      }

      console.log(
        '========== 解析后的退款记录数量 ==========',
        list.length
      )

      console.log(
        '========== 当前订单 backendOrderId ==========',
        order.backendOrderId
      )

      // 找到当前订单对应的退款记录
      const refund = list.find(item => {

        console.log(
          '========== 对比退款订单 ID ==========',
          item.order_id,
          '当前订单 ID ==========',
          order.backendOrderId
        )

        return String(item.order_id) ===
          String(order.backendOrderId)
      })

      // 没有退款申请
      if (!refund) {

        console.log(
          '========== 当前订单没有退款记录 =========='
        )

        this.setData({
          refund: null,
          refundStatus: '',
          refundStatusText: '',
          refundReviewRemark: '',
          refundAmountText: ''
        })

        return
      }

      console.log(
        '========== 找到当前订单退款记录 ==========',
        refund
      )

      // 转换状态文字
      let statusText = '审核中'

      if (refund.status === 'pending_review') {
        statusText = '审核中'
      }

      if (refund.status === 'completed') {
        statusText = '退款成功'
      }

      if (refund.status === 'rejected') {
        statusText = '审核未通过'
      }

      // 更新页面
      this.setData({

        refund: refund,

        refundStatus: refund.status,

        refundStatusText: statusText,

        refundReviewRemark:
          refund.review_remark || '',

        refundAmountText:
          (
            Number(refund.amount || 0) / 100
          ).toFixed(2)

      })

      console.log(
        '========== 退款状态已经更新到页面 ==========',
        {
          status: refund.status,
          statusText: statusText,
          amount: refund.amount,
          amountText:
            (
              Number(refund.amount || 0) / 100
            ).toFixed(2)
        }
      )

    })
    .catch((error) => {

      console.error(
        '========== 查询退款状态失败 ==========',
        error
      )

      this.setData({
        refund: null,
        refundStatus: '',
        refundStatusText: '',
        refundReviewRemark: '',
        refundAmountText: ''
      })

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

  testPay() {
    wx.showModal({
      title: 'TEST-999',
      content: '如果看到这个，说明当前 testPay 正在运行',
      showCancel: false
    })
  },


  // 付款
payOrder() {
  console.log('========== 订单详情页开始支付 ==========')

  const order = this.data.order

  console.log('当前订单：', order)
  console.log('backendOrderId：', order && order.backendOrderId)

  // 1. 检查订单
  if (!order || !order.id) {
    wx.showToast({
      title: '订单数据不存在',
      icon: 'none'
    })
    return
  }

  // 2. 已经支付过
  if (order.paymentStatus === 'paid') {
    wx.showToast({
      title: '该订单已经付款',
      icon: 'none'
    })
    return
  }

  // 3. 检查后端订单 ID
  if (!order.backendOrderId) {
    wx.showModal({
      title: '订单异常',
      content: '当前订单没有对应的后端订单 ID。',
      showCancel: false
    })
    return
  }

  console.log(
    '========== 准备调用后端支付接口 ==========',
    order.backendOrderId
  )

  // 4. 确认支付
  wx.showModal({
    title: '确认支付',
    content: `支付金额：¥${Number(
      order.finalTotal !== undefined
        ? order.finalTotal
        : order.total || 0
    ).toFixed(2)}`,
    confirmText: '确认支付',
    cancelText: '暂不支付',

    success: (res) => {

      if (!res.confirm) {
        console.log('用户取消支付')
        return
      }

      console.log('========== 用户确认支付 ==========')

      wx.showLoading({
        title: '支付中'
      })

      // 5. 调用后端支付接口
      request(
        `/api/orders/${order.backendOrderId}/pay`,
        'POST',
        {}
      )
      .then((result) => {

        console.log(
          '========== 订单详情页后端支付成功 ==========',
          result
        )

        // 6. 更新本地订单
        const orders = wx.getStorageSync('orders') || []

        const index = orders.findIndex(item => {
          return String(item.id) === String(order.id)
        })

        if (index === -1) {
          throw new Error('本地订单不存在')
        }

        orders[index] = {
          ...orders[index],

          paymentStatus: 'paid',

          paymentTime: new Date().toLocaleString(),

          status: 'pending',

          statusName: '待接单'
        }

        // 7. 保存本地订单
        wx.setStorageSync('orders', orders)

        console.log(
          '========== 本地订单更新完成 ==========',
          orders[index]
        )

        // 8. 更新当前页面
        this.setData({
          order: orders[index]
        })

        // 9. 使用优惠券
        if (orders[index].selectedCouponId) {
          useCoupon(
            orders[index].selectedCouponId,
            orders[index].id
          )
        }

        // 10. 更新状态和时间线
        this.updateStatus()
        this.buildTimeline()

        wx.hideLoading()

        wx.showToast({
          title: '支付成功',
          icon: 'success'
        })

      })
      .catch((error) => {

        console.error(
          '========== 订单详情页后端支付失败 ==========',
          error
        )

        wx.hideLoading()

        wx.showModal({
          title: '支付失败',
          content: '后端支付接口调用失败，请查看控制台。',
          showCancel: false,
          confirmText: '知道了'
        })
      })
    }
  })
},


  // 再来一单
  reorder() {

    const order = this.data.order
  
    if (!order || !order.items || order.items.length === 0) {
      wx.showToast({
        title: '订单商品不存在',
        icon: 'none'
      })
      return
    }
  
    // 读取当前菜单全部商品
    const allFoods = wx.getStorageSync('allFoods') || []
  
    if (allFoods.length === 0) {
      wx.showToast({
        title: '商品数据不存在',
        icon: 'none'
      })
      return
    }
  
    // 按原订单商品数量加入购物车
    const newFoods = allFoods.map(food => {
  
      // 找到订单中的对应商品
      const orderItem = order.items.find(
        item => Number(item.id) === Number(food.id)
      )
  
      if (!orderItem) {
        return food
      }
  
      return {
        ...food,
        count: Number(food.count || 0) +
          Number(orderItem.count || 0)
      }
  
    })
  
    // 只保留数量大于 0 的商品作为购物车
    const cartFoods = newFoods.filter(
      food => Number(food.count || 0) > 0
    )
  
    // 保存商品数据
    wx.setStorageSync(
      'allFoods',
      newFoods
    )
  
    // 保存购物车
    wx.setStorageSync(
      'cartFoods',
      cartFoods
    )
  
    wx.showToast({
      title: '已加入购物车',
      icon: 'success'
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

  },


  // =========================
// 投诉订单
// =========================
submitComplaint() {

  const order = this.data.order

  if (!order || !order.backendOrderId) {
    wx.showModal({
      title: '订单异常',
      content: '当前订单没有对应的后端订单 ID，暂时无法投诉。',
      showCancel: false
    })
    return
  }

  wx.navigateTo({
    url:
      '/pages/complaint-create/complaint-create?orderId=' +
      order.backendOrderId
  })
},


  // 显示更多操作
showMoreActions() {
  this.setData({
    showMoreMenu: true
  })
},

// 关闭更多操作
hideMoreActions() {
  this.setData({
    showMoreMenu: false
  })
},

// 点击菜单内部时阻止冒泡
stopMoreMenuTap() {
  // 什么都不做
},

deleteOrder() {
  const order = this.data.order

  if (!order) {
    return
  }

  wx.showModal({
    title: '删除订单',
    content: '删除后将从订单列表中移除，餐厅后台订单不会受到影响。',
    confirmText: '删除',
    confirmColor: '#D9534F',

    success: (res) => {
      if (!res.confirm) {
        return
      }

      const orders = wx.getStorageSync('orders') || []

      const newOrders = orders.filter(
        item => String(item.id) !== String(order.id)
      )

      wx.setStorageSync('orders', newOrders)

      this.setData({
        showMoreMenu: false
      })

      wx.showToast({
        title: '订单已删除',
        icon: 'success'
      })

      setTimeout(() => {
        wx.navigateBack()
      }, 600)
    }
  })
},

  // =========================
  // 申请退款
  // =========================
  applyRefund() {
    const order = this.data.order
  
// =========================
// 已经申请过退款，禁止再次申请
// =========================
if (this.data.refund) {

  let message = '该订单已经申请过退款，不能重复申请。'

  if (this.data.refundStatus === 'pending_review') {
    message = '该订单正在退款审核中，不能重复申请。'
  }

  if (this.data.refundStatus === 'completed') {
    message = '该订单的退款已经完成，不能再次申请。'
  }

  if (this.data.refundStatus === 'rejected') {
    message = '该订单的退款申请已经被拒绝，不能再次申请。'
  }

  wx.showModal({
    title: '无法再次申请',
    content: message,
    showCancel: false,
    confirmText: '知道了'
  })

  return
}

    // 1. 检查订单
    if (!order || !order.id) {
      wx.showToast({
        title: '订单数据不存在',
        icon: 'none'
      })
      return
    }

    // 2. 检查后端订单 ID
    if (!order.backendOrderId) {
      wx.showModal({
        title: '订单异常',
        content: '当前订单没有对应的后端订单 ID，暂时无法申请退款。',
        showCancel: false
      })
      return
    }

    // 3. 获取退款金额
    const finalTotal = Number(
      order.finalTotal !== undefined
        ? order.finalTotal
        : order.total || 0
    )

    if (!finalTotal || finalTotal <= 0) {
      wx.showToast({
        title: '退款金额异常',
        icon: 'none'
      })
      return
    }

    // 4. 确认退款
    wx.showModal({
      title: '申请退款',
      content: `确认申请退款 ¥${finalTotal.toFixed(2)} 吗？`,
      confirmText: '申请退款',
      cancelText: '暂不申请',
      success: (res) => {
        if (!res.confirm) {
          return
        }

        wx.showLoading({
          title: '提交中'
        })

        // 后端退款接口要求 amount 单位为“分”
        const refundAmount = Math.round(finalTotal * 100)

        request(
          '/api/refunds',
          'POST',
          {
            orderId: order.backendOrderId,
            amount: refundAmount,
            reason: '用户申请退款'
          }
        )
        .then((result) => {

          console.log(
            '========== 退款申请成功 ==========',
            result
          )
        
          wx.hideLoading()
        
          // 立即更新当前订单的退款状态
          this.setData({
            refund: {
              order_id: order.backendOrderId,
              amount: refundAmount,
              status: 'pending_review',
              review_remark: ''
            },
            refundStatus: 'pending_review',
            refundStatusText: '已申请退款',
            refundReviewRemark: '',
            refundAmountText: (
              refundAmount / 100
            ).toFixed(2)
          })
        
          wx.showModal({
            title: '申请成功',
            content: '退款申请已经提交，请等待餐厅审核。',
            showCancel: false,
            confirmText: '知道了'
          })
        })
          .catch((error) => {
            console.error('========== 退款申请失败 ==========')
            console.error(error)

            wx.hideLoading()

            wx.showModal({
              title: '申请失败',
              content: error.message || '退款申请提交失败，请稍后再试。',
              showCancel: false,
              confirmText: '知道了'
            })
          })
      }
    })
  },

  // =========================
// 查询退款申请状态
// =========================
loadRefundStatus() {
  const order = this.data.order

  if (!order || !order.backendOrderId) {
    this.setData({
      refund,
      refundStatus: refund.status,
      refundStatusText: statusText,
      refundReviewRemark: refund.review_remark || '',
      refundAmountText: (Number(refund.amount || 0) / 100).toFixed(2)
    })
    return
  }

  request(
    '/api/refunds/mine',
    'GET'
  )
    .then((result) => {


      const list =
        result &&
        result.data &&
        Array.isArray(result.data)
          ? result.data
          : []

      // 找当前订单对应的退款申请
      const refund = list.find(item => {
        return String(item.order_id) ===
          String(order.backendOrderId)
      })

      if (!refund) {
        this.setData({
          refund: null,
          refundStatus: '',
          refundStatusText: '',
          refundReviewRemark: '',
          refundAmountText: ''
        })
        return
      }

      let statusText = '审核中'

      if (refund.status === 'pending_review') {
        statusText = '审核中'
      } else if (refund.status === 'completed') {
        statusText = '退款成功'
      } else if (refund.status === 'rejected') {
        statusText = '审核未通过'
      }

      this.setData({
        refund,
        refundStatus: refund.status,
        refundStatusText: statusText,
        refundReviewRemark: refund.review_remark || ''
      })
    })
    .catch((error) => {
      console.error('查询退款状态失败：', error)

      // 查询失败不影响订单正常显示
      this.setData({
        refund: null,
        refundStatus: '',
        refundStatusText: '',
        refundReviewRemark: ''
      })
    })
},

})