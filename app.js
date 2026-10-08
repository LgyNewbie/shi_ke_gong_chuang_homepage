App({
  onLaunch() {
    const currentUser = wx.getStorageSync('currentUser')

    if (!currentUser) {
      this.devLogin()
    }
  },

  devLogin() {
    wx.request({
      url: 'http://192.168.254.145:3000/api/messages/dev-login',
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        dev_account: 'test_message_user'
      },

      success: (res) => {
        console.log('开发模式登录结果：', res.data)

        if (res.data && res.data.code === 0) {
          wx.setStorageSync('currentUser', res.data.data)

          console.log(
            '当前用户：',
            wx.getStorageSync('currentUser')
          )
        } else {
          console.error(
            '开发模式登录失败：',
            res.data
          )
        }
      },

      fail: (error) => {
        console.error(
          '开发模式登录请求失败：',
          error
        )
      }
    })
  }
})