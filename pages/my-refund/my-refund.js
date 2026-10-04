const { request } = require('../../utils/api.js')

Page({

  data: {

    // 退款记录
    list: [],

    // 加载状态
    loading: true

  },


  // =========================
  // 页面加载
  // =========================

  onLoad() {

    this.loadRefunds()

  },


  // =========================
  // 页面显示
  // =========================

  onShow() {

    this.loadRefunds()

  },


  // =========================
  // 加载我的退款
  // =========================

  async loadRefunds() {

    const loginUser =
      wx.getStorageSync('loginUser') || null

    if (
      !loginUser ||
      !loginUser.isLogin
    ) {

      this.setData({

        list: [],

        loading: false

      })

      return

    }


    this.setData({

      loading: true

    })


    try {

      const result =
        await request(
          '/api/refunds/mine',
          {
            method: 'GET'
          }
        )


      const list =
        Array.isArray(result)
          ? result
          : []


      const formattedList =
        list.map(item => {

          return {

            ...item,

            statusText:
              this.getStatusText(
                item.status
              ),

            statusClass:
              this.getStatusClass(
                item.status
              ),

            amountText:
              this.formatAmount(
                item.amount
              ),

            createdTime:
              this.formatTime(
                item.created_at
              ),

            reviewedTime:
              this.formatTime(
                item.reviewed_at ||
                item.completed_at
              ),

            reviewRemark:
              item.review_remark ||
              ''

          }

        })


      this.setData({

        list: formattedList,

        loading: false

      })


    } catch (error) {

      console.error(
        '加载我的退款失败：',
        error
      )


      this.setData({

        list: [],

        loading: false

      })

    }

  },


  // =========================
  // 退款状态文字
  // =========================

  getStatusText(status) {

    const map = {

      pending_review:
        '审核中',

      completed:
        '退款成功',

      rejected:
        '退款失败'

    }


    return map[status] || '处理中'

  },


  // =========================
  // 退款状态样式
  // =========================

  getStatusClass(status) {

    const map = {

      pending_review:
        'pending',

      completed:
        'completed',

      rejected:
        'rejected'

    }


    return map[status] || 'pending'

  },


  // =========================
  // 金额格式
  // 后端 amount 单位：分
  // =========================

  formatAmount(amount) {

    const value =
      Number(amount || 0) / 100

    return value.toFixed(2)

  },


  // =========================
  // 时间格式
  // =========================

  formatTime(time) {

    if (!time) {

      return ''

    }


    return String(time)

      .replace('T', ' ')

      .replace(/\.\d+Z$/, '')

  },


  // =========================
  // 下拉刷新
  // =========================

  onPullDownRefresh() {

    this.loadRefunds()

      .finally(() => {

        wx.stopPullDownRefresh()

      })

  }

})