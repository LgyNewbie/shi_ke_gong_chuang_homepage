const {
  getAvailableUserCoupons,
  calculateCouponDiscount
} = require('../../utils/coupon.js')
Page({

  data: {

    // 配送方式
    deliveryType: 'delivery',

    // 默认地址
    address: {
      name: '',
      phone: '',
      detail: ''
    },

    // 购物车商品
    cartItems: [],

    availableCoupons:[],

    // 商品金额
    cartTotal: 0,

    // 商品优惠
    productDiscount: 0,

    // 优惠券
    couponDiscount: 0,

    // 当前选择的优惠券
    selectedCoupon: null,

    // 打包费
    packingFee: 0,

    // 配送费
    deliveryFee: 0,

    // 最终实付
    finalTotal: 0,

    // 支付方式
    paymentMethod: '微信支付',

    // 备注
    remark: ''
  },

  onLoad() {
    this.loadCart()
  },

  onShow() {
    this.loadCart()
  },

  // =========================
  // 读取购物车
  // =========================
  loadCart() {

    const cartItems =
      wx.getStorageSync('cartFoods') || []

    if (cartItems.length === 0) {

      wx.showToast({
        title: '购物车是空的',
        icon: 'none'
      })

      setTimeout(() => {

        wx.navigateBack()

      }, 800)

      return
    }

    // 读取默认地址
    const addresses =
      wx.getStorageSync('addresses') || []

    const defaultAddress =
      addresses.find(item => item.isDefault)

      this.setData({
        cartItems,
        address:defaultAddress
          ? defaultAddress
          : {name:'',phone:'',detail:''}
      }, () => {
        this.calculateTotal()
      })
  },

  // =========================
  // 计算金额
  // =========================
  calculateTotal(){
    let total = 0
    let productDiscount = 0
  
    this.data.cartItems.forEach(item => {
      const price = Number(item.price || 0)
      const count = Number(item.count || 0)
  
      total += price * count
  
      if (
        item.discountEnabled === true &&
        Number(item.discount) > 0 &&
        Number(item.discount) < 10
      ) {
        const discountPrice =
          price * Number(item.discount) / 10
  
        productDiscount +=
          (price - discountPrice) * count
      }
    })
  
    // 商品优惠后的金额
    const afterProductDiscount =
      Math.max(0, total - productDiscount)
  
    // ====================
    // 获取当前订单可用优惠券
    // ====================
  
    // ====================
// 获取当前订单可用优惠券
// ====================

let availableCoupons =
getAvailableUserCoupons(afterProductDiscount)

// ====================
// 排除已经被其他待付款订单占用的优惠券
// ====================

const orders =
wx.getStorageSync('orders') || []

const lockedCouponIds = orders
.filter(order =>
  order &&
  order.paymentStatus === 'unpaid' &&
  order.selectedCouponId
)
.map(order => order.selectedCouponId)

// 当前页面自己已经选择的优惠券不能被自己排除
const currentSelectedCouponId =
this.data.selectedCoupon
  ? this.data.selectedCoupon.id
  : ''

availableCoupons = availableCoupons.filter(item => {
return (
  !lockedCouponIds.includes(item.id) ||
  item.id === currentSelectedCouponId
)
})

let selectedCoupon = this.data.selectedCoupon

// 如果之前选择的优惠券已经不能使用，则自动取消
if (
selectedCoupon &&
!availableCoupons.some(
  item => item.id === selectedCoupon.id
)
) {
selectedCoupon = null
}
  
    // ====================
    // 计算优惠券优惠金额
    // ====================
  
    let couponDiscount = 0
  
    if (selectedCoupon) {
      couponDiscount = calculateCouponDiscount(
        selectedCoupon,
        afterProductDiscount
      )
    }
  
    // ====================
    // 打包费
    // ====================
  
    let packingFee = 0
  
    this.data.cartItems.forEach(item => {
      const itemPackingFee =
        Number(item.packingFee || 0)
  
      const count =
        Number(item.count || 0)
  
      packingFee +=
        itemPackingFee * count
    })
  
    // ====================
    // 配送费
    // ====================
  
    let deliveryFee = 0
  
    if (this.data.deliveryType === 'delivery') {
      this.data.cartItems.forEach(item => {
        const itemDeliveryFee =
          Number(item.deliveryFee || 0)
  
        const count =
          Number(item.count || 0)
  
        deliveryFee +=
          itemDeliveryFee * count
      })
    }
  
    // ====================
    // 最终金额
    // ====================
  
    const finalTotal = Math.max(
      0,
      total
        - productDiscount
        - couponDiscount
        + packingFee
        + deliveryFee
    )
  
    this.setData({
      availableCoupons,
      selectedCoupon,
      cartTotal:Number(total.toFixed(2)),
      productDiscount:Number(productDiscount.toFixed(2)),
      couponDiscount:Number(couponDiscount.toFixed(2)),
      packingFee:Number(packingFee.toFixed(2)),
      deliveryFee:Number(deliveryFee.toFixed(2)),
      finalTotal:Number(finalTotal.toFixed(2))
    })
  },

  chooseCoupon() {
    const coupons = this.data.availableCoupons || []
  
    if (coupons.length === 0) {
      wx.showToast({
        title:'暂无可用优惠券',
        icon:'none'
      })
      return
    }
  
    const itemList = coupons.map(item => {
      return `${item.name} -¥${item.amount}`
    })
  
    wx.showActionSheet({
      itemList,
      success: res => {
        const selectedCoupon = coupons[res.tapIndex]
  
        if (!selectedCoupon) return
  
        this.setData({
          selectedCoupon
        }, () => {
          this.calculateTotal()
        })
      }
    })
  },

  // =========================
  // 选择配送方式
  // =========================
  selectDeliveryType(e) {

    const type =
      e.currentTarget.dataset.type

    this.setData({

      deliveryType: type

    }, () => {

      this.calculateTotal()

    })
  },

  // =========================
  // 选择地址
  // =========================
  chooseAddress() {

    wx.navigateTo({
      url: '/pages/address/address'
    })
  },

  // =========================
  // 选择支付方式
  // =========================
  selectPaymentMethod(e) {

    const method =
      e.currentTarget.dataset.method

    if (!method) {
      return
    }

    this.setData({

      paymentMethod: method

    })
  },

  // =========================
  // 输入备注
  // =========================
  onRemarkInput(e) {

    this.setData({

      remark: e.detail.value

    })
  },

  // =========================
  // 返回购物车
  // =========================
  goBack() {

    wx.navigateBack()
  },

  // =========================
  // 提交订单
  // =========================
  submitOrder() {

    if (
      this.data.deliveryType === 'delivery' &&
      !this.data.address.detail
    ) {

      wx.showModal({

        title: '还没有收货地址',

        content: '请先添加一个收货地址。',

        confirmText: '去添加',

        success: (res) => {

          if (res.confirm) {

            wx.navigateTo({
              url: '/pages/address/address'
            })

          }

        }

      })

      return
    }

    if (!this.data.cartItems.length) {

      wx.showToast({
        title: '购物车是空的',
        icon: 'none'
      })

      return
    }

    // =========================
    // 创建订单
    // =========================

    const order = {
      id:'SK'+Date.now(),
    
      // 订单处理状态
      status:'pending',
      statusName:'待付款',
    
      // 支付状态
      paymentStatus:'unpaid',
    
      // 支付方式
      paymentMethod:this.data.paymentMethod,

      // 配送方式
      deliveryType:
        this.data.deliveryType,

      // 收货地址
      address:
        this.data.deliveryType === 'delivery'
          ? this.data.address
          : null,

      // 商品
      items:
        this.data.cartItems,

      // =========================
      // 金额信息
      // =========================

      // 商品原价小计
      cartTotal:
        this.data.cartTotal,

      // 商品优惠
      productDiscount:
        this.data.productDiscount,

      // 优惠券
couponDiscount:
this.data.couponDiscount,

// 优惠券信息
coupon:
this.data.selectedCoupon,

// 优惠券ID
selectedCouponId:
this.data.selectedCoupon
  ? this.data.selectedCoupon.id
  : '',

      // 打包费
      packingFee:
        this.data.packingFee,

      // 配送费
      deliveryFee:
        this.data.deliveryFee,

      // 最终实付金额
      total:
        this.data.finalTotal,

      finalTotal:
        this.data.finalTotal,


      // 备注
      remark:
        this.data.remark,

      // 创建时间
      createTime:
        new Date().toLocaleString()
    }

    // =========================
    // 保存订单
    // =========================

    const orders =
      wx.getStorageSync('orders') || []

    orders.unshift(order)

    wx.setStorageSync(
      'orders',
      orders
    )

    

    // =========================
    // 清空购物车
    // =========================

    const allFoods =
      wx.getStorageSync('allFoods') || []

    const resetFoods =
      allFoods.map(food => {

        return {

          ...food,

          count: 0

        }

      })

    wx.setStorageSync(
      'allFoods',
      resetFoods
    )

    wx.setStorageSync(
      'cartFoods',
      []
    )

    // =========================
    // 提交成功
    // =========================

    wx.showModal({

      title: '订单提交成功',

      content:
        '订单号：' + order.id,

      confirmText: '查看订单',

      cancelText: '返回首页',

      success: (res) => {

        if (res.confirm) {

          wx.switchTab({

            url: '/pages/order/order'

          })

        } else {

          wx.switchTab({

            url: '/pages/index/index'

          })

        }

      }

    })
  }

})