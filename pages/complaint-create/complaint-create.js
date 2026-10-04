const { request } = require('../../utils/api.js')

Page({

  data: {

    orderId: '',

    // 是否为再次投诉
    isReComplaint: false,

    complaintTypes: [
      '商品质量',
      '服务态度',
      '配送问题',
      '其他'
    ],

    type: '商品质量',

    content: '',

    images: [],

    submitting: false

  },


  onLoad(options) {

  const orderId = options.orderId || ''

  const isReComplaint =
    options.reComplaint === '1'

  this.setData({
    orderId,
    isReComplaint
  })

},


  // 选择投诉类型
  selectType(e) {

    const type =
      e.currentTarget.dataset.type

    this.setData({
      type
    })

  },


  // 输入投诉内容
  onContentInput(e) {

    this.setData({
      content: e.detail.value
    })

  },


  // 选择图片
  chooseImages() {
    const remain = 6 - this.data.images.length
  
    if (remain <= 0) {
      wx.showToast({
        title: '最多上传6张图片',
        icon: 'none'
      })
      return
    }
  
    wx.chooseMedia({
      count: remain,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
  
      success: async (res) => {
  
        wx.showLoading({
          title: '图片上传中...',
          mask: true
        })
  
        try {
  
          const uploadedUrls = []
  
          for (const item of res.tempFiles) {
  
            const uploadResult = await new Promise((resolve, reject) => {
  
              wx.uploadFile({
                url: 'http://192.168.53.145:3000/api/upload',
                filePath: item.tempFilePath,
                name: 'file',
  
                success: (uploadRes) => {
  
                  try {
                    const data = JSON.parse(uploadRes.data)
  
                    if (data.code === 0 && data.data && data.data.url) {
                      resolve(data.data.url)
                    } else {
                      reject(
                        new Error(data.message || '图片上传失败')
                      )
                    }
  
                  } catch (error) {
                    reject(new Error('服务器返回数据异常'))
                  }
                },
  
                fail: (error) => {
                  reject(error)
                }
              })
  
            })
  
            uploadedUrls.push(uploadedUrls.length >= 0 ? uploadResult : '')
          }
  
          this.setData({
            images: [
              ...this.data.images,
              ...uploadedUrls
            ]
          })
  
          wx.hideLoading()
  
          wx.showToast({
            title: '图片上传成功',
            icon: 'success'
          })
  
        } catch (error) {
  
          wx.hideLoading()
  
          console.error('图片上传失败：', error)
  
          wx.showModal({
            title: '上传失败',
            content: '图片上传失败，请检查后端服务和网络连接。',
            showCancel: false
          })
        }
      },
  
      fail: (error) => {
        console.error('选择图片失败：', error)
      }
    })
  },


  // 预览图片
  previewImage(e) {

    const url =
      e.currentTarget.dataset.url

    wx.previewImage({

      current: url,

      urls: this.data.images

    })

  },


  // 删除图片
  deleteImage(e) {

    const index =
      Number(e.currentTarget.dataset.index)

    const images =
      [...this.data.images]

    images.splice(index, 1)

    this.setData({
      images
    })

  },


  // 提交投诉
  submitComplaint() {

    const {
      orderId,
      type,
      content,
      images
    } = this.data


    if (!orderId) {

      wx.showToast({
        title: '订单信息不存在',
        icon: 'none'
      })

      return

    }


    if (!content || !content.trim()) {

      wx.showToast({
        title: '请填写投诉内容',
        icon: 'none'
      })

      return

    }


    this.setData({
      submitting: true
    })


    request(
      '/api/complaints',
      'POST',
      {
        orderId,
        type,
        content: content.trim(),

        // 当前后端要求 images 是 URL 数组
        images: images || []
      }
    )
      .then((result) => {

        console.log(
          '========== 投诉提交成功 ==========',
          result
        )

        this.setData({
          submitting: false
        })

        wx.showModal({

          title: this.data.isReComplaint
            ? '再次投诉已提交'
            : '投诉已提交',
        
          content: this.data.isReComplaint
            ? '您的再次投诉已经提交给餐厅，我们会重新核实处理。'
            : '您的投诉已经提交给餐厅，我们会尽快处理。',
        
          showCancel: false,
        
          confirmText: '知道了',
        
          success: () => {
        
            wx.navigateBack()
        
          }
        
        })

      })
      .catch((error) => {

        console.error(
          '========== 投诉提交失败 ==========',
          error
        )

        this.setData({
          submitting: false
        })

        wx.showModal({

          title: '提交失败',

          content:
            error && error.message
              ? error.message
              : '投诉提交失败，请稍后重试。',

          showCancel: false,

          confirmText: '知道了'

        })

      })

  }

})