// utils/coupon.js

// ====================
// 优惠券模板
// ====================

// 获取所有优惠券
function getCoupons() {
  const coupons = wx.getStorageSync('coupons') || []

  if (!Array.isArray(coupons)) {
    return []
  }

  return coupons
}

// 保存所有优惠券
function saveCoupons(coupons) {
  wx.setStorageSync(
    'coupons',
    Array.isArray(coupons) ? coupons : []
  )
}

// 创建优惠券
function addCoupon(coupon) {
  const coupons = getCoupons()

  const newCoupon = {
    id: coupon.id || `coupon_${Date.now()}`,
    name: coupon.name || '',
    type: coupon.type || 'minus',

    // 满多少可以使用
    threshold: Number(coupon.threshold || 0),

    // 减多少
    amount: Number(coupon.amount || 0),

    // 是否启用
    enabled: coupon.enabled !== false,

    // 发放状态
    issueStatus: coupon.issueStatus || 'stopped',

    // 总发放数量，0 表示不限量
    totalCount: Number(coupon.totalCount || 0),

    // 已发放数量
    issuedCount: Number(coupon.issuedCount || 0),

    // 已使用数量
    usedCount: Number(coupon.usedCount || 0),

    // 有效期
    startTime: coupon.startTime || '',
    endTime: coupon.endTime || '',

    // 促销名称
    promotionName: coupon.promotionName || '',

    // 创建时间
    createdAt: coupon.createdAt || new Date().toLocaleString()
  }

  coupons.unshift(newCoupon)
  saveCoupons(coupons)

  return newCoupon
}

// 根据 ID 获取优惠券
function getCouponById(id) {
  const coupons = getCoupons()

  return coupons.find(item => item.id === id) || null
}

// 更新优惠券
function updateCoupon(id, data) {
  const coupons = getCoupons()

  const index = coupons.findIndex(item => item.id === id)

  if (index === -1) {
    return false
  }

  coupons[index] = {
    ...coupons[index],
    ...data,
    id: coupons[index].id
  }

  saveCoupons(coupons)

  return true
}

// 删除优惠券
function deleteCoupon(id) {
  const coupons = getCoupons()

  const newCoupons = coupons.filter(item => item.id !== id)

  saveCoupons(newCoupons)

  return newCoupons.length !== coupons.length
}


// ====================
// 发放管理
// ====================

// 开始发放优惠券
function startCouponIssue(id) {
  const coupon = getCouponById(id)

  if (!coupon) {
    return {
      success: false,
      message: '优惠券不存在'
    }
  }

  if (coupon.enabled === false) {
    return {
      success: false,
      message: '优惠券已停用'
    }
  }

  if (
    Number(coupon.totalCount || 0) > 0 &&
    Number(coupon.issuedCount || 0) >= Number(coupon.totalCount || 0)
  ) {
    return {
      success: false,
      message: '优惠券已发放完'
    }
  }

  updateCoupon(id, {
    issueStatus: 'issuing'
  })

  return {
    success: true,
    message: '已开始发放'
  }
}

// 停止发放优惠券
function stopCouponIssue(id) {
  const coupon = getCouponById(id)

  if (!coupon) {
    return {
      success: false,
      message: '优惠券不存在'
    }
  }

  updateCoupon(id, {
    issueStatus: 'stopped'
  })

  return {
    success: true,
    message: '已停止发放'
  }
}


// ====================
// 用户优惠券
// ====================

// 获取当前用户领取的优惠券
function getUserCoupons() {
  const coupons = wx.getStorageSync('userCoupons') || []

  if (!Array.isArray(coupons)) {
    return []
  }

  return coupons
}

// 保存当前用户优惠券
function saveUserCoupons(coupons) {
  wx.setStorageSync(
    'userCoupons',
    Array.isArray(coupons) ? coupons : []
  )
}

// 用户领取优惠券
function claimCoupon(couponId) {
  const coupon = getCouponById(couponId)

  if (!coupon) {
    return {
      success: false,
      message: '优惠券不存在'
    }
  }

  if (coupon.enabled === false) {
    return {
      success: false,
      message: '优惠券已停用'
    }
  }

  if (coupon.issueStatus !== 'issuing') {
    return {
      success: false,
      message: '该优惠券暂未开放领取'
    }
  }

  // 判断是否超过总发放数量
  if (
    Number(coupon.totalCount || 0) > 0 &&
    Number(coupon.issuedCount || 0) >= Number(coupon.totalCount || 0)
  ) {
    updateCoupon(couponId, {
      issueStatus: 'finished'
    })

    return {
      success: false,
      message: '优惠券已发放完'
    }
  }

  const userCoupons = getUserCoupons()

  // 同一用户不能重复持有同一张未使用优惠券
  const exists = userCoupons.some(item => {
    return (
      item.couponId === couponId &&
      item.status === 'unused'
    )
  })

  if (exists) {
    return {
      success: false,
      message: '你已经领取过这张优惠券'
    }
  }

  const userCoupon = {
    id: `userCoupon_${Date.now()}`,

    couponId,

    name: coupon.name,
    type: coupon.type,
    threshold: coupon.threshold,
    amount: coupon.amount,

    // 当前状态
    status: 'unused',

    // 领取时间
    claimedAt: new Date().toLocaleString(),

    // 使用时间
    usedAt: '',

    // 使用订单
    usedOrderId: '',

    // 回收状态
    revoked: false,
    revokedAt: '',
    revokeReason: ''
  }

  userCoupons.unshift(userCoupon)
  saveUserCoupons(userCoupons)

  // 更新优惠券发放数量
  const newIssuedCount =
    Number(coupon.issuedCount || 0) + 1

  const updateData = {
    issuedCount: newIssuedCount
  }

  // 达到总数量后自动结束发放
  if (
    Number(coupon.totalCount || 0) > 0 &&
    newIssuedCount >= Number(coupon.totalCount || 0)
  ) {
    updateData.issueStatus = 'finished'
  }

  updateCoupon(couponId, updateData)

  return {
    success: true,
    message: '领取成功',
    userCoupon
  }
}


// ====================
// 优惠券有效性
// ====================

// 判断优惠券是否已经过期
function isCouponExpired(coupon) {
  if (!coupon) {
    return true
  }

  const now = new Date()

  if (coupon.endTime) {
    const endTime = new Date(coupon.endTime)

    if (
      !isNaN(endTime.getTime()) &&
      now > endTime
    ) {
      return true
    }
  }

  return false
}

// 获取用户当前可用优惠券
function getAvailableUserCoupons(orderAmount) {
  const amount = Number(orderAmount || 0)

  const userCoupons = getUserCoupons()
  const now = new Date()

  return userCoupons.filter(item => {
    // 已使用
    if (item.status === 'used') {
      return false
    }

    // 已回收
    if (item.revoked === true || item.status === 'revoked') {
      return false
    }

    const coupon = getCouponById(item.couponId)

    if (!coupon) {
      return false
    }

    // 商家停用
    if (coupon.enabled === false) {
      return false
    }

    // 未达到使用门槛
    if (
      Number(coupon.threshold || 0) > amount
    ) {
      return false
    }

    // 未到开始时间
    if (coupon.startTime) {
      const startTime = new Date(coupon.startTime)

      if (
        !isNaN(startTime.getTime()) &&
        now < startTime
      ) {
        return false
      }
    }

    // 已过期
    if (coupon.endTime) {
      const endTime = new Date(coupon.endTime)

      if (
        !isNaN(endTime.getTime()) &&
        now > endTime
      ) {
        return false
      }
    }

    return true
  })
}


// ====================
// 优惠券计算
// ====================

// 计算优惠券优惠金额
function calculateCouponDiscount(coupon, orderAmount) {
  if (!coupon) {
    return 0
  }

  const amount = Number(orderAmount || 0)
  const threshold = Number(coupon.threshold || 0)
  const couponAmount = Number(coupon.amount || 0)

  if (amount < threshold) {
    return 0
  }

  if (coupon.type === 'minus') {
    return Math.min(
      couponAmount,
      amount
    )
  }

  return 0
}


// ====================
// 优惠券使用
// ====================

// 使用优惠券
function useCoupon(userCouponId, orderId) {
  const userCoupons = getUserCoupons()

  const index = userCoupons.findIndex(
    item => item.id === userCouponId
  )

  if (index === -1) {
    return false
  }

  if (
    userCoupons[index].status === 'used' ||
    userCoupons[index].revoked === true
  ) {
    return false
  }

  userCoupons[index].status = 'used'
  userCoupons[index].usedAt =
    new Date().toLocaleString()
  userCoupons[index].usedOrderId =
    orderId || ''

  saveUserCoupons(userCoupons)

  // 更新优惠券使用数量
  const couponId = userCoupons[index].couponId
  const coupon = getCouponById(couponId)

  if (coupon) {
    updateCoupon(couponId, {
      usedCount:
        Number(coupon.usedCount || 0) + 1
    })
  }

  return true
}


// ====================
// 优惠券回收
// ====================

// 商家回收指定用户的一张优惠券
function revokeUserCoupon(
  userCouponId,
  reason
) {
  const userCoupons = getUserCoupons()

  const index = userCoupons.findIndex(
    item => item.id === userCouponId
  )

  if (index === -1) {
    return false
  }

  // 已使用不能回收
  if (userCoupons[index].status === 'used') {
    return false
  }

  // 已经回收
  if (userCoupons[index].revoked === true) {
    return false
  }

  userCoupons[index].status = 'revoked'
  userCoupons[index].revoked = true
  userCoupons[index].revokedAt =
    new Date().toLocaleString()
  userCoupons[index].revokeReason =
    reason || '商家回收'

  saveUserCoupons(userCoupons)

  return true
}

// 回收某张优惠券的全部未使用用户券
function revokeAllUserCoupons(
  couponId,
  reason
) {
  const userCoupons = getUserCoupons()

  let count = 0

  userCoupons.forEach(item => {
    if (
      item.couponId === couponId &&
      item.status !== 'used' &&
      item.revoked !== true
    ) {
      item.status = 'revoked'
      item.revoked = true
      item.revokedAt =
        new Date().toLocaleString()
      item.revokeReason =
        reason || '商家回收'

      count++
    }
  })

  saveUserCoupons(userCoupons)

  // 同时停止发放
  updateCoupon(couponId, {
    issueStatus: 'stopped'
  })

  return count
}


// ====================
// 导出
// ====================

module.exports = {
  getCoupons,
  saveCoupons,

  addCoupon,
  getCouponById,
  updateCoupon,
  deleteCoupon,

  startCouponIssue,
  stopCouponIssue,

  getUserCoupons,
  saveUserCoupons,
  claimCoupon,

  isCouponExpired,
  getAvailableUserCoupons,
  calculateCouponDiscount,

  useCoupon,

  revokeUserCoupon,
  revokeAllUserCoupons
}