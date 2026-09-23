// ================================
// 食客共创 - 消息通知工具
// ================================

function getNotifications() {
  const notifications =
    wx.getStorageSync('notifications')

  if (Array.isArray(notifications)) {
    return notifications
  }

  return []
}


// ================================
// 添加通知
// ================================

function addNotification(data = {}) {
  const notifications = getNotifications()

  const notification = {
    id:
      data.id ||
      `notification_${Date.now()}`,

    type:
      data.type ||
      'system',

    icon:
      data.icon ||
      '🔔',

    iconClass:
      data.iconClass ||
      'system-icon',

    title:
      data.title ||
      '新消息',

    content:
      data.content ||
      '',

    time:
      data.time ||
      '刚刚',

    read: false,

    messageId:
      data.messageId ||
      '',

    orderId:
      data.orderId ||
      ''
  }

  notifications.unshift(notification)

  wx.setStorageSync(
    'notifications',
    notifications
  )

  return notification
}


// ================================
// 订单状态通知
// ================================

function addOrderNotification(
  order,
  status
) {
  if (!order) {
    return
  }

  const orderId = order.id || ''

  let title = '订单状态更新'
  let content = '你的订单状态发生了变化'

  if (status === 'accepted') {
    title = '订单已接单'
    content = '餐厅已经接单，马上开始为你准备。'
  }

  if (status === 'cooking') {
    title = '订单正在制作'
    content = '餐厅正在为你制作，请耐心等待。'
  }

  if (status === 'delivery') {
    title = '订单正在配送'
    content = '你的餐品已经出餐，正在配送中。'
  }

  if (status === 'completed') {
    title = '订单已完成'
    content = '本次订单已经完成，感谢你的支持。'
  }

  if (status === 'cancelled') {
    title = '订单已取消'
    content = '你的订单已经取消。'
  }

  return addNotification({
    id:
      `order_${orderId}_${status}_${Date.now()}`,

    type: 'order',

    icon: '📦',

    iconClass: 'order-icon',

    title: title,

    content: content,

    time: '刚刚',

    orderId: orderId
  })
}


// ================================
// 修改订单状态并通知
// ================================

function updateOrderStatus(
  orderId,
  status,
  statusName
) {
  let orders =
    wx.getStorageSync('orders') || []

  const index =
    orders.findIndex(item =>
      String(item.id) === String(orderId)
    )

  if (index === -1) {
    return null
  }

  const oldOrder = orders[index]

  const newOrder = {
    ...oldOrder,

    status: status,

    statusName:
      statusName || oldOrder.statusName
  }

  orders[index] = newOrder

  wx.setStorageSync(
    'orders',
    orders
  )

  addOrderNotification(
    newOrder,
    status
  )

  return newOrder
}


module.exports = {
  getNotifications,
  addNotification,
  addOrderNotification,
  updateOrderStatus
}