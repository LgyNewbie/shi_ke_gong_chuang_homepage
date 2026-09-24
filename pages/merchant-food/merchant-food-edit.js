Page({

  data: {
    // 是否编辑已有商品
    isEdit: false,
  
    // 商品ID
    foodId: null,
  
    // 商品信息
    name: '',
    price: '',
    category: 'rice',
    hot: false,
    image: '/images/food1.jpg',
    desc: '',
    ingredients: '',
    taste: '',
    weight: '',
    allergen: '',
  
    // 商品级费用
    packingFee: '',
    deliveryFee: ''
  },

  onLoad(options) {

    // 编辑商品
    if (options.id) {

      const id =
        Number(options.id)

      this.setData({
        isEdit: true,
        foodId: id
      })

      this.loadFood(id)

      return
    }

    // 新增商品
    this.setData({
      isEdit: false,
      foodId: null
    })

  },


  // 加载商品
  loadFood(id) {

    const foods =
      wx.getStorageSync('allFoods') || []

    const food =
      foods.find(item => item.id === id)

    if (!food) {

      wx.showToast({
        title: '商品不存在',
        icon: 'none'
      })

      return
    }

    this.setData({

      name: food.name || '',

      price:
        food.price !== undefined
          ? String(food.price)
          : '',

      category:
        food.category || 'rice',

      hot:
        food.hot === true,

      image:
        food.image || '/images/food1.jpg',

      desc:
        food.desc || '',

      ingredients:
        food.ingredients || '',

      taste:
        food.taste || '',

      weight:
        food.weight || '',

      allergen:
        food.allergen || '',

      packingFee:
        food.packingFee !== undefined
          ? String(food.packingFee)
          : '0',
      
      deliveryFee:
        food.deliveryFee !== undefined
          ? String(food.deliveryFee)
          : '0'

    })

  },


  // 商品名称
  inputName(e) {

    this.setData({
      name: e.detail.value
    })

  },


  // 商品价格
  inputPrice(e) {

    this.setData({
      price: e.detail.value
    })

  },

  // 打包费
inputPackingFee(e) {

  this.setData({
    packingFee: e.detail.value
  })

},

// 配送费
inputDeliveryFee(e) {

  this.setData({
    deliveryFee: e.detail.value
  })

},


  // 商品描述
  inputDesc(e) {

    this.setData({
      desc: e.detail.value
    })

  },


  // 配料
  inputIngredients(e) {

    this.setData({
      ingredients: e.detail.value
    })

  },


  // 口味
  inputTaste(e) {

    this.setData({
      taste: e.detail.value
    })

  },


  // 重量
  inputWeight(e) {

    this.setData({
      weight: e.detail.value
    })

  },


  // 过敏原
  inputAllergen(e) {

    this.setData({
      allergen: e.detail.value
    })

  },


  // 分类
  selectCategory(e) {

    const category =
      e.currentTarget.dataset.category

    this.setData({
      category
    })

  },


  // 是否热销
  toggleHot(e) {

    this.setData({
      hot:
        e.detail.value
    })

  },


  // 选择图片
  chooseImage() {

    wx.chooseMedia({

      count: 1,

      mediaType: ['image'],

      sourceType: [
        'album',
        'camera'
      ],

      success: res => {

        if (
          !res.tempFiles ||
          !res.tempFiles.length
        ) {
          return
        }

        this.setData({
          image:
            res.tempFiles[0].tempFilePath
        })

      }

    })

  },


  // 保存商品
  saveFood() {

    const name =
      this.data.name.trim()

    const priceText =
      String(this.data.price).trim()

    const desc =
      this.data.desc.trim()


    // =========================
    // 基础验证
    // =========================

    if (!name) {

      wx.showToast({
        title: '请输入商品名称',
        icon: 'none'
      })

      return
    }


    if (!priceText) {

      wx.showToast({
        title: '请输入商品价格',
        icon: 'none'
      })

      return
    }


    const price =
      Number(priceText)

    // =========================
// 费用
// =========================

const packingFee =
Number(this.data.packingFee || 0)

const deliveryFee =
Number(this.data.deliveryFee || 0)


if (
!Number.isFinite(packingFee) ||
packingFee < 0
) {

wx.showToast({
  title: '请输入正确的打包费',
  icon: 'none'
})

return
}


if (
!Number.isFinite(deliveryFee) ||
deliveryFee < 0
) {

wx.showToast({
  title: '请输入正确的配送费',
  icon: 'none'
})

return
}


    if (
      !Number.isFinite(price) ||
      price <= 0
    ) {

      wx.showToast({
        title: '请输入正确价格',
        icon: 'none'
      })

      return
    }


    if (!desc) {

      wx.showToast({
        title: '请输入商品描述',
        icon: 'none'
      })

      return
    }


    const foods =
      wx.getStorageSync('allFoods') || []


    // =========================
    // 编辑已有商品
    // =========================

    if (this.data.isEdit) {

      const foodId =
        this.data.foodId

      const updatedFoods =
        foods.map(food => {

          if (food.id !== foodId) {
            return food
          }

          return {

            ...food,

            name,

            price,

            category:
              this.data.category,

            hot:
              this.data.hot,

            image:
              this.data.image,

            desc,

            ingredients:
              this.data.ingredients.trim(),

            taste:
              this.data.taste.trim(),

            weight:
              this.data.weight.trim(),

            allergen:
              this.data.allergen.trim(),
            
            packingFee,
            
            deliveryFee

          }

        })


      wx.setStorageSync(
        'allFoods',
        updatedFoods
      )


      wx.showToast({

        title: '商品已更新',

        icon: 'success',

        success: () => {

          setTimeout(() => {

            wx.navigateBack({
              delta: 1
            })

          }, 500)

        }

      })

      return
    }


    // =========================
    // 新增商品
    // =========================

    const newId =
      foods.length > 0
        ? Math.max(
            ...foods.map(
              item => Number(item.id) || 0
            )
          ) + 1
        : 1


    const newFood = {

      id: newId,

      name,

      category:
        this.data.category,

      hot:
        this.data.hot,

      price,

      sales: 0,

      image:
        this.data.image,

      desc,

      ingredients:
        this.data.ingredients.trim(),

      taste:
        this.data.taste.trim(),

      weight:
        this.data.weight.trim(),

      allergen:
        this.data.allergen.trim(),
      
      packingFee,
      
      deliveryFee,
      
      count: 0,
      
      isOnSale: true

    }


    foods.push(newFood)


    wx.setStorageSync(
      'allFoods',
      foods
    )


    wx.showToast({

      title: '商品上架成功',

      icon: 'success',

      success: () => {

        setTimeout(() => {

          wx.navigateBack({
            delta: 1
          })

        }, 500)

      }

    })

  },


  // 返回
  goBack() {

    wx.navigateBack({
      delta: 1
    })

  }

})