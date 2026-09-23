Page({

  data: {

    selectedId: '',

    hasVoted: false,


    // 默认投票
    poll: {

      id: 'weekly_001',

      title: '下周最想吃什么新品？',

      description: '从下面三款新品中选出你最期待的一款',

      endDate: '本周日',

      totalVotes: 267,

      options: [

        {
          id: '1',
          name: '辣子鸡',
          desc: '香辣过瘾，经典川味',
          votes: 128,
          percent: 48
        },

        {
          id: '2',
          name: '番茄牛腩',
          desc: '酸甜浓郁，牛腩软嫩',
          votes: 83,
          percent: 31
        },

        {
          id: '3',
          name: '黑椒鸡排',
          desc: '外酥里嫩，黑椒香浓',
          votes: 56,
          percent: 21
        }

      ]

    }

  },


  // =========================
  // 页面加载
  // =========================

  onLoad() {

    this.loadPoll()

  },


  // =========================
  // 页面显示
  // =========================

  onShow() {

    this.loadPoll()

  },


  // =========================
  // 读取本地投票
  // =========================

  loadPoll() {

    const savedPoll =
      wx.getStorageSync('weeklyPoll')


    // 没有商家发布的新投票
    if (!savedPoll) {

      this.setData({

        hasVoted: false,

        selectedId: ''

      })

      return

    }


    // =========================
    // 兼容旧投票数据
    // count → votes
    // =========================

    const options =
      Array.isArray(savedPoll.options)
        ? savedPoll.options.map(item => ({

            ...item,

            votes:
              Number(
                item.votes !== undefined
                  ? item.votes
                  : item.count || 0
              )

          }))
        : []


    // 重新计算总票数
    const totalVotes =
      options.reduce(
        (sum, item) => {
          return sum + Number(item.votes || 0)
        },
        0
      )


    // 重新计算百分比
    const newOptions =
      options.map(item => {

        const votes =
          Number(item.votes || 0)

        return {

          ...item,

          votes,

          percent:
            totalVotes > 0
              ? Math.round(
                  votes /
                  totalVotes *
                  100
                )
              : 0

        }

      })


    const poll = {

      ...savedPoll,

      options: newOptions,

      totalVotes:
        totalVotes

    }


    // =========================
    // 查看当前设备是否已经投票
    // =========================

    const voted =
      wx.getStorageSync('weeklyPollVoted')


    const choice =
      wx.getStorageSync('weeklyPollChoice')


    this.setData({

      poll,

      hasVoted:
        voted === true,

      selectedId:
        choice || ''

    })


    // 同步修正 Storage
    wx.setStorageSync(
      'weeklyPoll',
      poll
    )

  },


  // =========================
  // 选择投票
  // =========================

  selectOption(e) {

    if (this.data.hasVoted) {
      return
    }


    const id =
      e.currentTarget.dataset.id


    this.setData({

      selectedId:
        String(id)

    })

  },


  // =========================
  // 提交投票
  // =========================

  submitVote() {

    if (this.data.hasVoted) {

      wx.showToast({

        title: '你已经投过票了',

        icon: 'none'

      })

      return

    }


    if (!this.data.selectedId) {

      wx.showToast({

        title: '请选择一个选项',

        icon: 'none'

      })

      return

    }


    const poll =
      this.data.poll


    if (
      !poll ||
      !Array.isArray(poll.options)
    ) {

      wx.showToast({

        title: '投票不存在',

        icon: 'none'

      })

      return

    }


    // =========================
    // 更新票数
    // =========================

    const options =
      poll.options.map(item => {

        if (
          String(item.id) ===
          String(this.data.selectedId)
        ) {

          return {

            ...item,

            votes:
              Number(item.votes || 0) + 1

          }

        }

        return item

      })


    // 总票数
    const totalVotes =
      options.reduce(
        (sum, item) => {

          return sum +
            Number(item.votes || 0)

        },
        0
      )


    // =========================
    // 重新计算百分比
    // =========================

    const newOptions =
      options.map(item => {

        const votes =
          Number(item.votes || 0)


        return {

          ...item,

          votes,

          percent:
            totalVotes > 0
              ? Math.round(
                  votes /
                  totalVotes *
                  100
                )
              : 0

        }

      })


    const newPoll = {

      ...poll,

      options:
        newOptions,

      totalVotes:
        totalVotes

    }


    // =========================
    // 保存投票结果
    // =========================

    wx.setStorageSync(

      'weeklyPoll',

      newPoll

    )


    // 当前设备已经投过票
    wx.setStorageSync(

      'weeklyPollVoted',

      true

    )


    // 保存选择
    wx.setStorageSync(

      'weeklyPollChoice',

      String(
        this.data.selectedId
      )

    )


    this.setData({

      poll:
        newPoll,

      hasVoted:
        true

    })


    wx.showToast({

      title: '投票成功',

      icon: 'success'

    })

  },


  // =========================
  // 返回
  // =========================

  goBack() {

    wx.navigateBack()

  },


  // =========================
  // 去留言
  // =========================

  goCommunity() {

    wx.navigateTo({

      url:
        '/pages/community/community'

    })

  }

})