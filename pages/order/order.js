const {
  addOrderNotification,
  updateOrderStatus
} = require('../../utils/notification.js')

const {
  useCoupon
} = require('../../utils/coupon.js')

const { request } = require('../../utils/api.js')

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
    // 加载订单
    async loadOrders() {

      // =========================
      // 先读取本地订单
      // =========================
      let orders = wx.getStorageSync('orders') || []
  
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
  
  
// =========================
// 从后端同步订单状态
// =========================
try {

  const backendOrders =
    await request(
      '/api/orders',
      'GET',
      {}
    )

  console.log(
    '========== 后端订单同步成功 ==========',
    backendOrders
  )

  // =========================
  // 查询当前用户退款记录
  // =========================
  let refundRecords = []

  try {

    const refundResult =
      await request(
        '/api/refunds/mine',
        'GET',
        {}
      )

    console.log(
      '========== 后端退款记录同步成功 ==========',
      refundResult
    )

    if (Array.isArray(refundResult)) {
      refundRecords = refundResult
    } else if (
      refundResult &&
      Array.isArray(refundResult.data)
    ) {
      refundRecords = refundResult.data
    }

    console.log(
      '========== 当前用户退款记录数量 ==========',
      refundRecords.length
    )

  } catch (refundError) {

    console.error(
      '========== 退款记录同步失败 ==========',
      refundError
    )

    // 退款查询失败不影响正常订单显示
    refundRecords = []
  }


  if (Array.isArray(backendOrders)) {

    // 根据后端订单 ID 更新本地订单
    orders = orders.map(order => {

      if (!order.backendOrderId) {
        return order
      }

      const backendOrder =
        backendOrders.find(item =>
          String(item.id) ===
          String(order.backendOrderId)
        )

      if (!backendOrder) {
        return order
      }


      // =========================
      // 后端状态 → 小程序状态
      // =========================

      let newStatus =
        order.status

      let newStatusName =
        order.statusName


      // 待付款
      if (backendOrder.status === 'pending') {

        if (order.paymentStatus === 'paid') {

          newStatus = 'pending'
          newStatusName = '待接单'

        } else {

          newStatus = 'pending'
          newStatusName = '待付款'

        }

      }


      // 商家已接单
      else if (
        backendOrder.status === 'accepted'
      ) {

        newStatus = 'accepted'
        newStatusName = '商家已接单'

      }


      // 制作中
      else if (
        backendOrder.status === 'cooking'
      ) {

        newStatus = 'cooking'
        newStatusName = '制作中'

      }


      // 配送中
      else if (
        backendOrder.status === 'delivery'
      ) {

        newStatus = 'delivery'
        newStatusName = '配送中'

      }


      // 待取餐
      else if (
        backendOrder.status === 'ready'
      ) {

        newStatus = 'ready'
        newStatusName = '待取餐'

      }


      // 已完成
      else if (
        backendOrder.status === 'completed'
      ) {

        newStatus = 'completed'
        newStatusName = '已完成'

      }


      // 已取消
      else if (
        backendOrder.status === 'cancelled'
      ) {

        newStatus = 'cancelled'
        newStatusName = '已取消'

      }


      // 已退款
      else if (
        backendOrder.status === 'refunded'
      ) {

        newStatus = 'refunded'
        newStatusName = '已退款'

      }


      // =========================
      // 检查当前订单是否有退款记录
      // =========================

      const refundRecord =
        refundRecords.find(item => {

          return String(item.order_id) ===
            String(order.backendOrderId)

        })


      // =========================
      // 退款状态覆盖订单显示状态
      // =========================

      if (refundRecord) {

        // 退款申请审核中
        if (
          refundRecord.status ===
          'pending_review'
        ) {

          newStatusName = '已申请退款'

        }


        // 退款成功
        else if (
          refundRecord.status ===
          'completed'
        ) {

          newStatusName = '退款成功'

        }


        // 退款失败
        else if (
          refundRecord.status ===
          'rejected'
        ) {

          newStatusName = '退款失败'

        }

      }


      return {

        ...order,

        status: newStatus,

        statusName: newStatusName,

        // 后端已经支付，则同步支付状态
        paymentStatus:
          backendOrder.status !== 'pending'
            ? (
                backendOrder.status === 'refunded'
                  ? 'refunded'
                  : backendOrder.status === 'cancelled'
                    ? order.paymentStatus
                    : 'paid'
              )
            : order.paymentStatus

      }

    })


    // =========================
    // 保存同步后的订单
    // =========================

    wx.setStorageSync(
      'orders',
      orders
    )

  }

} catch (error) {

  console.error(
    '========== 后端订单同步失败 ==========',
    error
  )

  // 后端同步失败时，
  // 不影响原来的本地订单显示

}
  
  
      // =========================
      // 重新计算订单展示数据
      // =========================
  
      const newOrders =
        orders.map(order => {
  
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
  payOrder(e) {
    const id = e.currentTarget.dataset.id
  
    const orders = wx.getStorageSync('orders') || []
  
    const order = orders.find(
      item => String(item.id) === String(id)
    )
  
    if (!order) {
      wx.showToast({
        title: '订单不存在',
        icon: 'none'
      })
      return
    }
  
    // 已经支付过
    if (order.paymentStatus === 'paid') {
      wx.showToast({
        title: '该订单已经支付',
        icon: 'none'
      })
      return
    }
  
    // 没有后端订单 ID
    if (!order.backendOrderId) {
      wx.showModal({
        title: '订单异常',
        content: '当前订单没有对应的后端订单 ID。',
        showCancel: false
      })
      return
    }
  
    wx.showModal({
      title: '确认支付',
      content:
        `支付金额：¥${Number(
          order.finalTotal !== undefined
            ? order.finalTotal
            : order.total || 0
        ).toFixed(2)}`,
      confirmText: '确认支付',
      cancelText: '暂不支付',
  
      success: (res) => {
        if (!res.confirm) return
  
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
              '========== 订单列表页后端支付成功 ==========',
              result
            )
  
            const currentOrders =
              wx.getStorageSync('orders') || []
  
            const updatedOrders =
              currentOrders.map(item => {
                if (String(item.id) !== String(id)) {
                  return item
                }
  
                return {
                  ...item,
                  paymentStatus: 'paid',
                  status: 'pending',
                  statusName: '待接单',
                  paymentTime: new Date().toLocaleString()
                }
              })
  
            wx.setStorageSync(
              'orders',
              updatedOrders
            )
  
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
  
            wx.hideLoading()
  
            wx.showToast({
              title: '支付成功',
              icon: 'success'
            })
          })
          .catch((error) => {
            console.error(
              '========== 订单列表页后端支付失败 ==========',
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


// 取消订单
cancelOrder(e) {
  console.log('========== 点击取消订单 ==========', e)

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

  // 判断订单是否已经付款
  const isPaid =
    order.paymentStatus === 'paid'

  wx.showModal({

    title: isPaid ? '取消并退款' : '取消订单',

    content: isPaid
      ? '该订单已经付款，取消后将进行退款。确定要取消吗？'
      : '确定要取消这个待付款订单吗？',

    confirmText: isPaid ? '确认取消并退款' : '确定取消',

    cancelText: '暂不取消',

    success: (res) => {

      if (!res.confirm) {
        return
      }

      // 没有后端订单 ID
      if (!order.backendOrderId) {

        wx.showModal({
          title: '订单异常',
          content: '当前订单没有对应的后端订单 ID。',
          showCancel: false
        })

        return
      }

      wx.showLoading({
        title: isPaid ? '退款中' : '取消中'
      })

      // 调用后端取消订单接口
      request(
        `/api/orders/${order.backendOrderId}/cancel`,
        'POST',
        {}
      )
        .then((result) => {

          console.log(
            '========== 后端取消/退款成功 ==========',
            result
          )

          const refunded =
            result && result.refunded === true

          const currentOrders =
            wx.getStorageSync('orders') || []

          let cancelledOrder = null

          const updatedOrders =
            currentOrders.map(item => {

              if (
                String(item.id) !== String(id)
              ) {
                return item
              }

              cancelledOrder = {

                ...item,

                status: refunded
                  ? 'refunded'
                  : 'cancelled',

                statusName: refunded
                  ? '已退款'
                  : '已取消',

                cancelTime:
                  new Date().toLocaleString(),

                // 如果发生退款，记录退款时间
                refundTime: refunded
                  ? new Date().toLocaleString()
                  : item.refundTime,

                // 已付款订单退款后更新支付状态
                paymentStatus: refunded
                  ? 'refunded'
                  : item.paymentStatus,

                // 取消订单后释放优惠券
                selectedCouponId: '',
                coupon: null,
                couponDiscount: 0
              }

              return cancelledOrder
            })

          // 保存订单
          wx.setStorageSync(
            'orders',
            updatedOrders
          )

          // 生成订单取消通知
          if (cancelledOrder) {

            addOrderNotification(
              cancelledOrder,
              refunded
                ? 'refunded'
                : 'cancelled'
            )

          }

          // 刷新订单页面
          this.loadOrders()

          wx.hideLoading()

          wx.showToast({

            title: refunded
              ? '退款成功'
              : '订单已取消',

            icon: 'success'

          })

        })
        .catch((error) => {

          console.error(
            '========== 后端取消/退款失败 ==========',
            error
          )

          wx.hideLoading()

          wx.showModal({

            title: isPaid
              ? '退款失败'
              : '取消失败',

            content: isPaid
              ? '后端退款失败，请稍后重试。'
              : '后端取消订单失败，请稍后重试。',

            showCancel: false,

            confirmText: '知道了'

          })

        })

    }

  })

},

  // 再来一单
reorder(e) {

  // 获取当前订单 ID
  const orderId = e.currentTarget.dataset.id

  if (!orderId) {
    wx.showToast({
      title: '订单信息不存在',
      icon: 'none'
    })
    return
  }

  // 读取本地订单
  const orders = wx.getStorageSync('orders') || []

  const order = orders.find(
    item => String(item.id) === String(orderId)
  )

  if (!order) {
    wx.showToast({
      title: '订单不存在',
      icon: 'none'
    })
    return
  }

  // 检查订单商品
  if (!Array.isArray(order.items) || order.items.length === 0) {
    wx.showToast({
      title: '订单商品不存在',
      icon: 'none'
    })
    return
  }

  // 读取菜单中的全部商品
  const allFoods = wx.getStorageSync('allFoods') || []

  if (allFoods.length === 0) {
    wx.showToast({
      title: '商品数据不存在',
      icon: 'none'
    })
    return
  }

  // 将历史订单中的商品加入当前购物车
  const newFoods = allFoods.map(food => {

    const orderItem = order.items.find(
      item => String(item.id) === String(food.id)
    )

    // 当前订单没有这个商品
    if (!orderItem) {
      return food
    }

    return {
      ...food,

      // 当前购物车数量 + 历史订单数量
      count:
        Number(food.count || 0) +
        Number(orderItem.count || 0)
    }

  })

  // 重新生成购物车商品
  const cartFoods = newFoods.filter(
    food => Number(food.count || 0) > 0
  )

  // 保存全部商品
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


  // 去点餐
  goMenu() {

    wx.navigateTo({

      url: '/pages/menu/menu'

    })

  }

})