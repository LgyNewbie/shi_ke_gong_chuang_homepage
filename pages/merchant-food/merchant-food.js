Page({

  data: {
    foods: [],
    currentTab: 'all',

    // 是否处于排序模式
    sortMode: false,

    // 当前正在拖动的商品
    draggingId: null
  },

  onLoad() {
    this.loadFoods()
  },

  onShow() {
    this.loadFoods()
  },

  // 加载商品
  loadFoods() {

    const foods = wx.getStorageSync('allFoods') || []

    // 兼容旧商品
    // 没有 isOnSale 的商品默认视为已上架
    let normalizedFoods = foods.map((food, index) => ({
      ...food,
      isOnSale: food.isOnSale !== false,
      sort: Number.isFinite(Number(food.sort))
        ? Number(food.sort)
        : index + 1
    }))

    // 按排序值排列
    normalizedFoods.sort((a, b) => {
      return a.sort - b.sort
    })

    // 重新整理排序编号
    normalizedFoods = normalizedFoods.map((food, index) => ({
      ...food,
      sort: index + 1
    }))

    wx.setStorageSync(
      'allFoods',
      normalizedFoods
    )

    this.setData({
      foods: normalizedFoods,
      sortMode: false,
      draggingId: null
    })
  },

  // 切换商品状态筛选
  selectTab(e) {

    // 排序过程中不允许切换筛选
    if (this.data.sortMode) {
      wx.showToast({
        title: '请先完成商品排序',
        icon: 'none'
      })
      return
    }

    const tab = e.currentTarget.dataset.tab

    this.setData({
      currentTab: tab
    })
  },

  // 获取当前显示商品
  getFilteredFoods() {

    const foods = this.data.foods
    const tab = this.data.currentTab

    if (tab === 'on') {
      return foods.filter(
        food => food.isOnSale !== false
      )
    }

    if (tab === 'off') {
      return foods.filter(
        food => food.isOnSale === false
      )
    }

    return foods
  },

  // 开始调整排序
  startSortMode() {

    // 排序只针对全部商品
    if (this.data.currentTab !== 'all') {
      wx.showToast({
        title: '请在“全部”中调整商品排序',
        icon: 'none'
      })
      return
    }

    if (!this.data.foods.length) {
      wx.showToast({
        title: '暂无商品可以排序',
        icon: 'none'
      })
      return
    }

    this.setData({
      sortMode: true,
      draggingId: null
    })

    wx.showToast({
      title: '长按商品即可拖动',
      icon: 'none'
    })
  },

  // 长按商品
  startDrag(e) {

    if (!this.data.sortMode) {
      return
    }

    if (this.data.currentTab !== 'all') {
      return
    }

    const id = e.currentTarget.dataset.id

    if (id === undefined || id === null) {
      return
    }

    this.draggingId = id
    this.lastDragY = null
    this.lastMoveTime = 0

    this.setData({
      draggingId: id
    })
  },

  // 手指移动
  onDragMove(e) {

    if (!this.data.sortMode) {
      return
    }

    if (this.draggingId === null || this.draggingId === undefined) {
      return
    }

    if (!e.touches || !e.touches.length) {
      return
    }

    const touch = e.touches[0]

    const currentY =
      touch.clientY !== undefined
        ? touch.clientY
        : touch.pageY

    if (currentY === undefined) {
      return
    }

    const now = Date.now()

    // 限制检测频率，避免列表变化太快
    if (
      this.lastMoveTime &&
      now - this.lastMoveTime < 80
    ) {
      return
    }

    this.lastMoveTime = now

    // 获取当前商品卡片的位置
    wx.createSelectorQuery()
      .selectAll('.food-card')
      .boundingClientRect(rects => {

        if (!rects || !rects.length) {
          return
        }

        const foods = this.data.foods

        const currentIndex =
          foods.findIndex(food =>
            String(food.id) === String(this.draggingId)
          )

        if (currentIndex < 0) {
          return
        }

        /*
         * 找到手指当前位置对应的商品
         */
        let targetIndex = currentIndex

        for (let i = 0; i < rects.length; i++) {

          const rect = rects[i]

          if (!rect) {
            continue
          }

          const middle =
            rect.top + rect.height / 2

          if (currentY < middle) {
            targetIndex = i
            break
          }

          targetIndex = i
        }

        if (targetIndex < 0) {
          targetIndex = 0
        }

        if (targetIndex >= foods.length) {
          targetIndex = foods.length - 1
        }

        // 没有跨越其他商品，不需要移动
        if (targetIndex === currentIndex) {
          return
        }

        /*
         * 重新排列商品
         */
        const newFoods = [...foods]

        const movedFood =
          newFoods.splice(currentIndex, 1)[0]

        newFoods.splice(
          targetIndex,
          0,
          movedFood
        )

        /*
         * 重新生成 sort
         */
        const sortedFoods =
          newFoods.map((food, index) => ({
            ...food,
            sort: index + 1
          }))

        this.setData({
          foods: sortedFoods
        })
      })
      .exec()
  },

  // 手指松开
  endDrag() {

    if (!this.data.sortMode) {
      return
    }

    if (this.draggingId === null) {
      return
    }

    this.lastDragY = null
    this.lastMoveTime = 0

    // 保存当前排序
    wx.setStorageSync(
      'allFoods',
      this.data.foods
    )

    this.setData({
      draggingId: null
    })
  },

  // 完成排序
  finishSort() {

    if (!this.data.sortMode) {
      return
    }

    const sortedFoods =
      this.data.foods.map((food, index) => ({
        ...food,
        sort: index + 1
      }))

    wx.setStorageSync(
      'allFoods',
      sortedFoods
    )

    this.lastDragY = null
    this.lastMoveTime = 0
    this.draggingId = null

    this.setData({
      foods: sortedFoods,
      sortMode: false,
      draggingId: null
    })

    wx.showToast({
      title: '排序已保存',
      icon: 'success'
    })
  },

  // 新增商品
  addFood() {

    if (this.data.sortMode) {
      wx.showToast({
        title: '请先完成商品排序',
        icon: 'none'
      })
      return
    }

    wx.navigateTo({
      url:
        '/pages/merchant-food/merchant-food-edit'
    })
  },

  // 编辑商品
  editFood(e) {

    if (this.data.sortMode) {
      wx.showToast({
        title: '请先完成商品排序',
        icon: 'none'
      })
      return
    }

    const id =
      e.currentTarget.dataset.id

    wx.navigateTo({
      url:
        `/pages/merchant-food/merchant-food-edit?id=${encodeURIComponent(id)}`
    })
  },

  // 上架 / 下架
  toggleSale(e) {

    if (this.data.sortMode) {
      wx.showToast({
        title: '请先完成商品排序',
        icon: 'none'
      })
      return
    }

    const id =
      e.currentTarget.dataset.id

    const foods =
      this.data.foods.map(food => {

        if (food.id !== id) {
          return food
        }

        return {
          ...food,
          isOnSale:
            food.isOnSale === false
        }
      })

    wx.setStorageSync(
      'allFoods',
      foods
    )

    this.setData({
      foods
    })

    const food =
      foods.find(item => item.id === id)

    if (food && food.isOnSale) {

      wx.showToast({
        title: '已重新上架',
        icon: 'success'
      })

    } else {

      wx.showToast({
        title: '已下架',
        icon: 'none'
      })
    }
  },

  // 返回
  goBack() {

    if (this.data.sortMode) {

      wx.showModal({
        title: '正在调整排序',
        content: '是否退出排序？',
        confirmText: '退出',
        cancelText: '继续排序',
        success: res => {

          if (!res.confirm) {
            return
          }

          this.setData({
            sortMode: false,
            draggingId: null
          })

          wx.navigateBack({
            delta: 1
          })
        }
      })

      return
    }

    wx.navigateBack({
      delta: 1
    })
  }

})