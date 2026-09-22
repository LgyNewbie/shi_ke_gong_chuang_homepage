Page({

  data: {

    editId: '',

    form: {

      name: '',

      phone: '',

      detail: '',

      isDefault: false

    }

  },


  onLoad(options) {

    const id = options.id || ''


    // 新增
    if (!id) {
      return
    }


    // 编辑
    const addresses =
      wx.getStorageSync('addresses') || []


    const address =
      addresses.find(item => {
        return String(item.id) === String(id)
      })


    if (!address) {
      return
    }


    this.setData({

      editId: id,

      form: {
        name: address.name,
        phone: address.phone,
        detail: address.detail,
        isDefault: address.isDefault
      }

    })

  },


  // 输入
  onInput(e) {

    const field =
      e.currentTarget.dataset.field


    this.setData({

      ['form.' + field]: e.detail.value

    })

  },


  // 默认地址
  onDefaultChange(e) {

    this.setData({

      'form.isDefault':
        e.detail.value

    })

  },


  // 返回
  goBack() {

    wx.navigateBack()

  },


  // 保存
  saveAddress() {

    const form = this.data.form


    if (!form.name.trim()) {

      wx.showToast({
        title: '请输入联系人',
        icon: 'none'
      })

      return
    }


    if (!/^1\d{10}$/.test(form.phone)) {

      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      })

      return
    }


    if (!form.detail.trim()) {

      wx.showToast({
        title: '请输入收货地址',
        icon: 'none'
      })

      return
    }


    let addresses =
      wx.getStorageSync('addresses') || []


    // 编辑
    if (this.data.editId) {

      addresses =
        addresses.map(item => {

          if (
            String(item.id) ===
            String(this.data.editId)
          ) {

            return {

              ...item,

              ...form

            }

          }

          return item

        })

    }

    // 新增
    else {

      const newAddress = {

        id: Date.now(),

        ...form

      }


      addresses.push(newAddress)

    }


    // 如果用户选择默认
    if (form.isDefault) {

      addresses =
        addresses.map(item => {

          return {

            ...item,

            isDefault:
              item.id ===
              (this.data.editId
                ? Number(this.data.editId)
                : addresses[addresses.length - 1].id)

          }

        })

    }


    // 如果这是第一条地址
    if (addresses.length === 1) {

      addresses[0].isDefault = true

    }


    wx.setStorageSync(
      'addresses',
      addresses
    )


    wx.showToast({

      title: '保存成功',

      icon: 'success',

      duration: 800

    })


    setTimeout(() => {

      wx.navigateBack()

    }, 800)

  }

})