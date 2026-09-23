function getWinner(poll) {
  if (
    !poll ||
    !Array.isArray(poll.options) ||
    poll.options.length === 0
  ) {
    return null
  }

  const options =
    poll.options.map(item => ({
      ...item,

      votes:
        Number(
          item.votes !== undefined
            ? item.votes
            : item.count || 0
        )
    }))


  const totalVotes =
    options.reduce(
      (sum, item) => {
        return sum +
          Number(item.votes || 0)
      },
      0
    )


  const resultOptions =
    options.map(item => ({
      ...item,

      percent:
        totalVotes > 0
          ? Math.round(
              Number(item.votes || 0) /
              totalVotes *
              100
            )
          : 0
    }))


  return resultOptions.reduce(
    (current, item) => {

      if (!current) {
        return item
      }

      return item.votes > current.votes
        ? item
        : current

    },
    null
  )
}


function normalizePoll(poll) {
  if (!poll) {
    return null
  }


  const options =
    Array.isArray(poll.options)
      ? poll.options.map(item => ({
          ...item,

          votes:
            Number(
              item.votes !== undefined
                ? item.votes
                : item.count || 0
            )
        }))
      : []


  const totalVotes =
    options.reduce(
      (sum, item) => {
        return sum +
          Number(item.votes || 0)
      },
      0
    )


  const newOptions =
    options.map(item => ({
      ...item,

      percent:
        totalVotes > 0
          ? Math.round(
              Number(item.votes || 0) /
              totalVotes *
              100
            )
          : 0
    }))


  let statusName = '进行中'


  if (poll.status === 'ended') {
    statusName = '已结束'
  }

  if (poll.status === 'accepted') {
    statusName = '已采纳'
  }

  if (poll.status === 'rejected') {
    statusName = '暂不采纳'
  }


  return {
    ...poll,

    options:
      newOptions,

    totalVotes:
      totalVotes,

    statusName:
      poll.statusName || statusName
  }
}


Page({

  data: {

    currentPoll: null,

    myChoice: '',

    historyPolls: []

  },


  onShow() {

    this.loadPoll()

  },


  // =========================
  // 读取投票
  // =========================

  loadPoll() {

    const savedPoll =
      wx.getStorageSync('weeklyPoll')


    let currentPoll =
      normalizePoll(savedPoll)


    // =========================
    // 当前设备投票状态
    // =========================

    const voted =
      wx.getStorageSync(
        'weeklyPollVoted'
      )


    const choiceId =
      wx.getStorageSync(
        'weeklyPollChoice'
      )


    let myChoice = ''


    if (
      currentPoll &&
      voted === true
    ) {

      const choice =
        currentPoll.options.find(
          item =>
            String(item.id) ===
            String(choiceId)
        )


      myChoice =
        choice
          ? choice.name
          : '已投票'

    } else {

      myChoice = '未投票'

    }


    // =========================
    // 历史投票
    // =========================

    const history =
      wx.getStorageSync(
        'pollHistory'
      ) || []


    const safeHistory =
      Array.isArray(history)
        ? history
        : []


    const historyPolls =
      safeHistory
        .filter(item => {

          if (
            !currentPoll
          ) {
            return true
          }

          return String(item.id) !==
            String(currentPoll.id)

        })
        .map(item => {

          const normalized =
            normalizePoll(item)


          const winner =
            getWinner(normalized)


          return {

            ...normalized,

            date:
              item.date ||
              item.endTime ||
              item.createTime ||
              '已结束',

            myChoice:
              item.myChoice ||
              '未投票',

            winner:
              item.winner ||
              (
                winner
                  ? winner.name
                  : '暂无结果'
              ),

            resultPercent:
              item.resultPercent !== undefined
                ? item.resultPercent
                : (
                    winner
                      ? winner.percent
                      : 0
                  )

          }

        })


    this.setData({

      currentPoll,

      myChoice,

      historyPolls

    })

  },


  // =========================
  // 返回
  // =========================

  goBack() {

    wx.navigateBack()

  },


  // =========================
  // 去投票
  // =========================

  goPoll() {

    wx.navigateTo({

      url:
        '/pages/poll/poll'

    })

  }

})