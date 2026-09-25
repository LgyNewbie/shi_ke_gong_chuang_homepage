// pages/my-coupon/my-coupon.js

const {
  getCoupons,
  getUserCoupons,
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

  loadData() {
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
    const myCoupons = getUserCoupons().map(item => {
      let statusText = '未使用'
      let statusClass = 'unused'

      if (item.status === 'used') {
        statusText = '已使用'
        statusClass = 'used'
      } else if (item.revoked === true || item.status === 'revoked') {
        statusText = '已回收'
        statusClass = 'revoked'
      } else {
        const coupon = getCoupons().find(
          couponItem => couponItem.id === item.couponId
        )

        if (coupon && isCouponExpired(coupon)) {
          statusText = '已过期'
          statusClass = 'expired'
        }
      }

      return {
        ...item,
        statusText,
        statusClass
      }
    })

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