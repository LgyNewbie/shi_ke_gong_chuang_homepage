const {
  getPolls,
  hasVoted,
  getMyChoice,
  votePoll
} = require('../../utils/poll.js')


Page({

  data: {

    polls: [],

    scrollToPollId: ''

  },


  onLoad(options) {

    const pollId =
      options &&
      options.pollId
        ? String(options.pollId)
        : ''


    this.setData({

      scrollToPollId:
        pollId

    })


    this.loadPolls()

  },


  onShow() {

    this.loadPolls()

  },


  // =========================
  // 加载全部投票
  // =========================

  loadPolls() {

    const polls =
      getPolls()


    const displayPolls =
      polls.map(poll => {

        const voted =
          hasVoted(
            poll.id
          )


        const choiceId =
          getMyChoice(
            poll.id
          )


        return {

          ...poll,

          hasVoted:
            voted,

          selectedId:
            choiceId

        }

      })


    this.setData({

      polls:
        displayPolls

    })

  },


  // =========================
  // 选择选项
  // =========================

  selectOption(e) {

    const pollId =
      String(
        e.currentTarget.dataset.pollId
      )


    const optionId =
      String(
        e.currentTarget.dataset.optionId
      )


    const polls =
      this.data.polls.map(
        poll => {

          if (
            String(poll.id) !==
            String(pollId)
          ) {

            return poll

          }


          if (
            poll.status !==
            'active'
          ) {

            return poll

          }


          if (
            poll.hasVoted
          ) {

            return poll

          }


          return {

            ...poll,

            selectedId:
              optionId

          }

        }
      )


    this.setData({

      polls

    })

  },


  // =========================
  // 提交某一场投票
  // =========================

  submitVote(e) {

    const pollId =
      String(
        e.currentTarget.dataset.pollId
      )


    const poll =
      this.data.polls.find(
        item =>
          String(item.id) ===
          String(pollId)
      )


    if (!poll) {

      wx.showToast({

        title:
          '投票不存在',

        icon:
          'none'

      })

      return
    }


    if (
      poll.status !==
      'active'
    ) {

      wx.showToast({

        title:
          '这场投票已经结束',

        icon:
          'none'

      })

      return
    }


    if (
      poll.hasVoted
    ) {

      wx.showToast({

        title:
          '你已经投过这场投票了',

        icon:
          'none'

      })

      return
    }


    if (
      !poll.selectedId
    ) {

      wx.showToast({

        title:
          '请选择一个选项',

        icon:
          'none'

      })

      return
    }


    const updatedPoll =
      votePoll(

        pollId,

        poll.selectedId

      )


    if (!updatedPoll) {

      wx.showToast({

        title:
          '投票失败',

        icon:
          'none'

      })

      return
    }


    this.loadPolls()


    wx.showToast({

      title:
        '投票成功',

      icon:
        'success'

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