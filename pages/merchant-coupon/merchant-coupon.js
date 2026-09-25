// pages/merchant-coupon/merchant-coupon.js

const {
  getCoupons,
  addCoupon,
  updateCoupon,
  deleteCoupon,
  startCouponIssue,
  stopCouponIssue,
  revokeAllUserCoupons
} = require('../../utils/coupon.js')

Page({
  data: {
    coupons: [],
    showForm: false,

    editId: '',

    name: '',
    threshold: '',
    amount: '',
    totalCount: '',
    startTime: '',
    endTime: '',
    promotionName: '',

    issueStatusText: ''
  },

  onLoad() {
    this.loadCoupons()
  },

  onShow() {
    this.loadCoupons()
  },

  // 加载优惠券
  loadCoupons() {
    const coupons = getCoupons().map(item => {
      let issueStatusText = '已停止发放'

      if (item.issueStatus === 'issuing') {
        issueStatusText = '发放中'
      } else if (item.issueStatus === 'finished') {
        issueStatusText = '已发放完'
      }

      return {
        ...item,
        issueStatusText
      }
    })

    this.setData({
      coupons
    })
  },

  // 打开新增表单
  openAdd() {
    this.setData({
      showForm: true,
      editId: '',
      name: '',
      threshold: '',
      amount: '',
      totalCount: '',
      startTime: '',
      endTime: '',
      promotionName: ''
    })
  },

  // 编辑优惠券
  editCoupon(e) {
    const id = e.currentTarget.dataset.id
    const coupon = getCoupons().find(item => item.id === id)

    if (!coupon) {
      return
    }

    this.setData({
      showForm: true,
      editId: coupon.id,
      name: coupon.name || '',
      threshold: coupon.threshold || '',
      amount: coupon.amount || '',
      totalCount: coupon.totalCount || '',
      startTime: coupon.startTime || '',
      endTime: coupon.endTime || '',
      promotionName: coupon.promotionName || ''
    })
  },

  // 输入优惠券名称
  inputName(e) {
    this.setData({
      name: e.detail.value
    })
  },

  // 输入使用门槛
  inputThreshold(e) {
    this.setData({
      threshold: e.detail.value
    })
  },

  // 输入优惠金额
  inputAmount(e) {
    this.setData({
      amount: e.detail.value
    })
  },

  // 输入发放数量
  inputTotalCount(e) {
    this.setData({
      totalCount: e.detail.value
    })
  },

  // 输入开始时间
  inputStartTime(e) {
    this.setData({
      startTime: e.detail.value
    })
  },

  // 输入结束时间
  inputEndTime(e) {
    this.setData({
      endTime: e.detail.value
    })
  },

  // 输入促销名称
  inputPromotionName(e) {
    this.setData({
      promotionName: e.detail.value
    })
  },

  // 保存优惠券
  saveCoupon() {
    const name = this.data.name.trim()
    const threshold = Number(this.data.threshold)
    const amount = Number(this.data.amount)
    const totalCount = Number(this.data.totalCount || 0)

    if (!name) {
      wx.showToast({
        title: '请输入优惠券名称',
        icon: 'none'
      })
      return
    }

    if (
      isNaN(threshold) ||
      threshold <= 0
    ) {
      wx.showToast({
        title: '请输入正确的使用门槛',
        icon: 'none'
      })
      return
    }

    if (
      isNaN(amount) ||
      amount <= 0
    ) {
      wx.showToast({
        title: '请输入正确的优惠金额',
        icon: 'none'
      })
      return
    }

    if (amount >= threshold) {
      wx.showToast({
        title: '优惠金额不能大于等于使用门槛',
        icon: 'none'
      })
      return
    }

    if (
      isNaN(totalCount) ||
      totalCount < 0
    ) {
      wx.showToast({
        title: '请输入正确的发放数量',
        icon: 'none'
      })
      return
    }

    if (
      this.data.startTime &&
      this.data.endTime
    ) {
      const start = new Date(this.data.startTime)
      const end = new Date(this.data.endTime)

      if (
        !isNaN(start.getTime()) &&
        !isNaN(end.getTime()) &&
        start >= end
      ) {
        wx.showToast({
          title: '结束时间必须晚于开始时间',
          icon: 'none'
        })
        return
      }
    }

    const couponData = {
      name,
      type: 'minus',
      threshold,
      amount,
      totalCount,
      startTime: this.data.startTime,
      endTime: this.data.endTime,
      promotionName: this.data.promotionName.trim(),
      enabled: true
    }

    if (this.data.editId) {
      updateCoupon(
        this.data.editId,
        couponData
      )

      wx.showToast({
        title: '修改成功',
        icon: 'success'
      })
    } else {
      addCoupon({
        ...couponData,
        issueStatus: 'stopped',
        issuedCount: 0,
        usedCount: 0
      })

      wx.showToast({
        title: '创建成功',
        icon: 'success'
      })
    }

    this.closeForm()
    this.loadCoupons()
  },

  // 关闭表单
  closeForm() {
    this.setData({
      showForm: false
    })
  },

  // 开始发放
  startIssue(e) {
    const id = e.currentTarget.dataset.id

    const result = startCouponIssue(id)

    wx.showToast({
      title: result.message,
      icon: result.success ? 'success' : 'none'
    })

    this.loadCoupons()
  },

  // 停止发放
  stopIssue(e) {
    const id = e.currentTarget.dataset.id

    wx.showModal({
      title: '停止发放',
      content: '确定停止发放这张优惠券吗？已经领取的优惠券不受影响。',
      success: res => {
        if (!res.confirm) {
          return
        }

        const result = stopCouponIssue(id)

        wx.showToast({
          title: result.message,
          icon: result.success ? 'success' : 'none'
        })

        this.loadCoupons()
      }
    })
  },

  // 回收全部未使用优惠券
  revokeCoupon(e) {
    const id = e.currentTarget.dataset.id

    wx.showModal({
      title: '回收优惠券',
      content: '确定回收这张优惠券吗？所有尚未使用的用户优惠券都会被回收。',
      success: res => {
        if (!res.confirm) {
          return
        }

        const count = revokeAllUserCoupons(
          id,
          '商家回收'
        )

        wx.showModal({
          title: '回收完成',
          content:
            count > 0
              ? `已回收 ${count} 张未使用优惠券。`
              : '没有需要回收的未使用优惠券。',
          showCancel: false,
          success: () => {
            this.loadCoupons()
          }
        })
      }
    })
  },

  // 删除优惠券
  removeCoupon(e) {
    const id = e.currentTarget.dataset.id

    wx.showModal({
      title: '删除优惠券',
      content: '确定删除这张优惠券吗？',
      success: res => {
        if (!res.confirm) {
          return
        }

        deleteCoupon(id)

        wx.showToast({
          title: '删除成功',
          icon: 'success'
        })

        this.loadCoupons()
      }
    })
  }
}) 