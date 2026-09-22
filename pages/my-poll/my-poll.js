Page({

  data: {

    currentPoll: null,

    myChoice: '',

    historyPolls: []

  },


  onShow() {

    this.loadPoll()

  },


  // 读取投票
  loadPoll() {

    const savedPoll =
      wx.getStorageSync('weeklyPoll')


    const voted =
      wx.getStorageSync('weeklyPollVoted')


    // 当前进行中的投票
    if (savedPoll && voted) {

      const myOptionId =
        wx.getStorageSync('weeklyPollChoice')


      const choice =
        savedPoll.options.find(item => {

          return item.id === myOptionId

        })


      this.setData({

        currentPoll: savedPoll,

        myChoice:
          choice
            ? choice.name
            : '已投票'

      })

    } else {

      this.setData({

        currentPoll: null,

        myChoice: ''

      })

    }


    // 历史投票
    const history =
      wx.getStorageSync('pollHistory') || []


    this.setData({

      historyPolls: history

    })

  },


  // 返回
  goBack() {

    wx.navigateBack()

  },


  // 去投票
  goPoll() {

    wx.navigateTo({

      url: '/pages/poll/poll'

    })

  }

})