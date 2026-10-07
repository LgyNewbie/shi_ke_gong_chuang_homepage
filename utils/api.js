// ================================
// 食客共创 - 后端 API 请求工具
// ================================

// 开发阶段
// 先填写你电脑当前局域网 IP，例如：
// http://192.168.1.100:3000
//
// 注意：
// 不能写 localhost
// 因为手机真机访问 localhost 指向的是手机自己。

const BASE_URL = 'http://192.168.254.145:3000'

// ================================
// 通用请求
// ================================

function request(
  url,
  method = 'GET',
  data = {}
) {

  return new Promise((resolve, reject) => {

    const token =
      wx.getStorageSync('token') || ''

    const header = {
      'content-type': 'application/json'
    }

    if (token) {
      header.Authorization =
        `Bearer ${token}`
    }

    console.log('========== API 请求开始 ==========')
console.log('请求地址：', BASE_URL + url)
console.log('请求方法：', method)
console.log('请求数据：', data)

    wx.request({

      url:
        BASE_URL + url,

      method:
        method,

      data:
        data,

      header:
        header,

      success: (res) => {

        const result =
          res.data || {}

        // 登录失效
        if (res.statusCode === 401) {

          wx.removeStorageSync('token')
          wx.removeStorageSync('userId')

          wx.showToast({
            title: '登录已失效',
            icon: 'none'
          })

          reject(result)
          return
        }

        // HTTP 错误
        if (
          res.statusCode < 200 ||
          res.statusCode >= 300
        ) {

          wx.showToast({
            title:
              result.message ||
              '请求失败',
            icon: 'none'
          })

          reject(result)
          return
        }

        // 后端业务错误
        if (
          result.code !== undefined &&
          result.code !== 0
        ) {

          wx.showToast({
            title:
              result.message ||
              '操作失败',
            icon: 'none'
          })

          reject(result)
          return
        }

        // 返回 data
        resolve(
          result.data !== undefined
            ? result.data
            : result
        )
      },

      fail: (error) => {

        console.error(
          'API 请求失败：',
          error
        )

        wx.showToast({
          title: '网络连接失败',
          icon: 'none'
        })

        reject(error)
      }

    })
  })
}

// ================================
// 导出
// ================================

module.exports = {
  BASE_URL,
  request
}