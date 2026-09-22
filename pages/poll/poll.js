Page({

  data: {

    selectedId: '',

    hasVoted: false,

    poll: {

      id: 'weekly_001',

      title: '下周最想吃什么新品？',

      description: '从下面三款新品中选出你最期待的一款',

      endDate: '本周日',

      totalVotes: 267,

      options: [

        {
          id: 1,
          name: '辣子鸡',
          desc: '香辣过瘾，经典川味',
          votes: 128,
          percent: 48
        },

        {
          id: 2,
          name: '番茄牛腩',
          desc: '酸甜浓郁，牛腩软嫩',
          votes: 83,
          percent: 31
        },

        {
          id: 3,
          name: '黑椒鸡排',
          desc: '外酥里嫩，黑椒香浓',
          votes: 56,
          percent: 21
        }

      ]

    }

  },


  onLoad() {

    this.loadPoll()

  },


  onShow() {

    this.loadPoll()

  },


  // 读取本地投票数据
  loadPoll() {

    const savedPoll =
      wx.getStorageSync('weeklyPoll')


    if (savedPoll) {

      this.setData({

        poll: savedPoll,

        hasVoted: true

      })

    }

  },


  // 选择投票
  selectOption(e) {

    const id =
      e.currentTarget.dataset.id


    this.setData({

      selectedId: id

    })

  },


  // 提交投票
  submitVote() {

    if (!this.data.selectedId) {

      wx.showToast({

        title: '请选择一个选项',

        icon: 'none'

      })

      return

    }


    // 防止重复投票
    const hasVoted =
      wx.getStorageSync('weeklyPollVoted')


    if (hasVoted) {

      this.setData({

        hasVoted: true

      })

      return

    }


    const options =
      this.data.poll.options.map(item => {

        if (
          item.id ===
          this.data.selectedId
        ) {

          return {

            ...item,

            votes:
              item.votes + 1

          }

        }

        return item

      })


    const totalVotes =
      this.data.poll.totalVotes + 1


    // 重新计算百分比
    const newOptions =
      options.map(item => {

        return {

          ...item,

          percent:
            Math.round(
              item.votes /
              totalVotes *
              100
            )

        }

      })


    const newPoll = {

      ...this.data.poll,

      options: newOptions,

      totalVotes: totalVotes

    }


    // 保存投票结果
    wx.setStorageSync(
      'weeklyPoll',
      newPoll
    )


    // 记录已经投过
    wx.setStorageSync(
      'weeklyPollVoted',
      true
    )

    wx.setStorageSync(
      'weeklyPollChoice',
      this.data.selectedId
    )


    this.setData({

      poll: newPoll,

      hasVoted: true

    })


    wx.showToast({

      title: '投票成功',

      icon: 'success'

    })

  },


  // 返回
  goBack() {

    wx.navigateBack()

  },


  // 去留言
  goCommunity() {

    wx.navigateTo({

      url: '/pages/community/community'

    })

  }

})