Page({

  data: {

    addresses: []

  },


  onShow() {

    this.loadAddresses()

  },


  // 加载地址
  loadAddresses() {

    const addresses =
      wx.getStorageSync('addresses') || []

    this.setData({
      addresses: addresses
    })

  },


  // 返回
  goBack() {

    wx.navigateBack()

  },


  // 新增地址
  addAddress() {

    wx.navigateTo({
      url: '/pages/address-edit/address-edit'
    })
  
  },


  // 编辑
  editAddress(e) {

    const id =
      e.currentTarget.dataset.id
  
    wx.navigateTo({
      url: '/pages/address-edit/address-edit?id=' + id
    })
  
  },


  // 删除
  deleteAddress(e) {

    const id =
      e.currentTarget.dataset.id


    wx.showModal({

      title: '删除地址',

      content: '确定要删除这个地址吗？',

      success: (res) => {

        if (!res.confirm) {
          return
        }


        let addresses =
          wx.getStorageSync('addresses') || []


        addresses =
          addresses.filter(item => {
            return item.id !== id
          })


        // 如果删除后没有默认地址
        // 就把第一条设置为默认
        if (addresses.length > 0) {

          const hasDefault =
            addresses.some(item => item.isDefault)

          if (!hasDefault) {

            addresses[0].isDefault = true

          }

        }


        wx.setStorageSync(
          'addresses',
          addresses
        )


        this.loadAddresses()


        wx.showToast({
          title: '删除成功',
          icon: 'success'
        })

      }

    })

  },


  // 设为默认
  setDefault(e) {

    const id =
      e.currentTarget.dataset.id


    let addresses =
      wx.getStorageSync('addresses') || []


    addresses =
      addresses.map(item => {

        return {
          ...item,
          isDefault: item.id === id
        }

      })


    wx.setStorageSync(
      'addresses',
      addresses
    )


    this.loadAddresses()


    wx.showToast({
      title: '默认地址已修改',
      icon: 'success'
    })

  }

})