// pages/my-coupon/my-coupon.js

const { request } = require('../../utils/api.js')

const {
  getCoupons,
  claimCoupon,
  isCouponExpired
} = require('../../utils/coupon.js')

Page({
  data: {
    coupons: [],
    myCoupons: []
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  async loadData() {
    const now = new Date()
  
    // ====================
    // 正在发放的优惠券
    // ====================
    const coupons = getCoupons()
      .filter(item => {
        if (item.enabled === false) return false
        if (item.issueStatus !== 'issuing') return false
  
        if (item.startTime) {
          const startTime = new Date(item.startTime)
          if (!isNaN(startTime.getTime()) && now < startTime) {
            return false
          }
        }
  
        if (item.endTime) {
          const endTime = new Date(item.endTime)
          if (!isNaN(endTime.getTime()) && now > endTime) {
            return false
          }
        }
  
        if (
          Number(item.totalCount || 0) > 0 &&
          Number(item.issuedCount || 0) >= Number(item.totalCount || 0)
        ) {
          return false
        }
  
        return true
      })
      .map(item => ({
        ...item,
        remainingCount:
          Number(item.totalCount || 0) > 0
            ? Number(item.totalCount || 0) - Number(item.issuedCount || 0)
            : 0
      }))
  
    // ====================
    // 我的优惠券
    // ====================
    let myCoupons = []
  
    try {
      const result = await request('/api/coupons/mine')
  
      myCoupons = (result || []).map(item => {
        let statusText = '未使用'
        let statusClass = 'unused'
  
        if (item.status === 'used') {
          statusText = '已使用'
          statusClass = 'used'
        } else if (item.status === 'revoked') {
          statusText = '已回收'
          statusClass = 'revoked'
        } else if (item.status === 'expired') {
          statusText = '已过期'
          statusClass = 'expired'
        } else if (item.status === 'unused') {
          statusText = '未使用'
          statusClass = 'unused'
        }
  
        return {
          ...item,
  
          // 给现有页面统一字段
          couponId: item.template_id,
  
          name: item.name || '',
          type: item.type || 'fixed',
  
          // 后端金额单位是“分”，
          // 现有前端优惠券金额使用“元”
          amount: Number(item.value || 0) / 100,
          threshold: Number(item.min_amount || 0) / 100,
  
          claimedAt: item.issued_at || '',
          expireAt: item.expire_at || '',
  
          usedAt: item.used_at || '',
          usedOrderId: item.used_order_id || '',
  
          revoked: item.status === 'revoked',
          revokedAt: item.revoked_at || '',
          revokeReason: item.revoke_reason || '',
  
          statusText,
          statusClass
        }
      })
    } catch (error) {
      console.error('加载我的优惠券失败：', error)
  
      wx.showToast({
        title: '优惠券加载失败',
        icon: 'none'
      })
    }
  
    this.setData({
      coupons,
      myCoupons
    })
  },

  // ====================
  // 领取优惠券
  // ====================
  claimCoupon(e) {
    const couponId = e.currentTarget.dataset.id

    const result = claimCoupon(couponId)

    wx.showToast({
      title: result.message,
      icon: result.success ? 'success' : 'none'
    })

    if (result.success) {
      this.loadData()
    }
  },

  // ====================
  // 查看我的优惠券
  // ====================
  openMyCoupons() {
    wx.showToast({
      title: '当前页面已显示我的优惠券',
      icon: 'none'
    })
  }
})