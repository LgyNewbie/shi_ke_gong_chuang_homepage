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


      // =========================
      // 计算投票结果状态
      // =========================

      const totalVotes =
        Number(
          poll.totalVotes || 0
        )


      const options =
        Array.isArray(poll.options)
          ? poll.options.map(option => ({
              ...option,
              isMyChoice:
                String(option.id) ===
                String(choiceId)
            }))
          : []


      // 找出最高票数
      const maxVotes =
        options.reduce(
          (max, option) => {

            return Math.max(
              max,
              Number(option.votes || 0)
            )

          },
          0
        )


      // 最高票选项数量
      const winnerCount =
        maxVotes > 0
          ? options.filter(
              option =>
                Number(option.votes || 0) ===
                maxVotes
            ).length
          : 0


      // =========================
      // 判断结果类型
      // =========================

      let resultState =
        'none'


      if (totalVotes > 0) {

        if (winnerCount > 1) {

          resultState =
            'tie'

        } else {

          resultState =
            'winner'

        }

      }


      // =========================
      // 给每个选项增加显示字段
      // =========================

      const resultOptions =
        options.map(option => {

          const votes =
            Number(
              option.votes || 0
            )


          const isWinner =
            maxVotes > 0 &&
            votes === maxVotes


          let resultLabel = ''


          if (
            resultState === 'winner' &&
            isWinner
          ) {

            resultLabel =
              '🏆最高票'

          }


          if (
            resultState === 'tie' &&
            isWinner
          ) {

            resultLabel =
              '🤝平票'

          }


          if (
            totalVotes === 0
          ) {

            resultLabel =
              ''

          }


          return {

            ...option,

            isWinner,

            resultLabel,

            isMyChoice:
              String(option.id) ===
              String(choiceId)

          }

        })


      return {

        ...poll,

        hasVoted:
          voted,

        selectedId:
          choiceId,

        options:
          resultOptions,

        resultState,

        winnerCount

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