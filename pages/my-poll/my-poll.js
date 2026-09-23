// ================================
// 食客共创 - 我的投票
// 多投票版本
// ================================

const {
  getPolls,
  hasVoted,
  getMyChoice
} = require('../../utils/poll.js')


function normalizePoll(poll) {

  if (!poll) {
    return null
  }


  const options =
    Array.isArray(poll.options)
      ? poll.options.map(item => {

          return {

            ...item,

            votes:
              Number(
                item.votes !== undefined
                  ? item.votes
                  : item.count || 0
              )

          }

        })
      : []


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
      resultOptions,

    totalVotes:
      totalVotes,

    statusName:
      poll.statusName || statusName

  }

}


// ================================
// 获取最高票选项
// ================================

function getWinners(poll) {

  if (
    !poll ||
    !Array.isArray(poll.options) ||
    poll.options.length === 0
  ) {

    return []

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


  const maxVotes =
    options.reduce(
      (max, item) => {

        return Math.max(
          max,
          Number(item.votes || 0)
        )

      },
      0
    )


  if (maxVotes <= 0) {

    return []

  }


  return options.filter(
    item =>
      Number(item.votes || 0) ===
      maxVotes
  )

}


// ================================
// 获取我的选择名称
// ================================

function getChoiceName(
  poll,
  choiceId
) {

  if (!poll || !choiceId) {
    return '未投票'
  }


  const option =
    (poll.options || []).find(
      item =>
        String(item.id) ===
        String(choiceId)
    )


  return option
    ? option.name
    : '已投票'


}


// ================================
// 页面
// ================================

Page({

  data: {

    // 当前进行中的投票
    activePolls: [],

    // 我参与过的历史投票
    historyPolls: []

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


    const activePolls = []

    const historyPolls = []


    polls.forEach(pollItem => {

      const poll =
        normalizePoll(
          pollItem
        )


      if (!poll) {
        return
      }


      const voted =
        hasVoted(
          poll.id
        )


      const choiceId =
        getMyChoice(
          poll.id
        )


      const myChoice =
        getChoiceName(
          poll,
          choiceId
        )


      // =========================
      // 进行中的投票
      // =========================

      if (
        poll.status === 'active'
      ) {

        activePolls.push({

          ...poll,

          hasVoted:
            voted,

          choiceId:
            choiceId,

          myChoice:
            myChoice

        })

        return

      }


      // =========================
      // 已结束投票
      // =========================
      // 我的投票页面只显示
      // 用户真正参加过的历史投票
      // =========================

      if (voted) {

        const winners =
  getWinners(
    poll
  )


const winnerNames =
  winners.length > 0
    ? winners
        .map(item => item.name)
        .join('、')
    : '暂无结果'


const winnerPercent =
  winners.length > 0
    ? winners[0].percent || 0
    : 0


        historyPolls.push({

          ...poll,

          hasVoted:
            true,

          choiceId:
            choiceId,

          myChoice:
            myChoice,

            winner:
            winnerNames,
          
          resultPercent:
            winnerPercent,
          
          isTie:
            winners.length > 1,

          date:
            poll.endTime ||
            poll.createTime ||
            '已结束'

        })

      }

    })


    this.setData({

      activePolls,

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
  // 去投某一场投票
  // =========================

  goPoll(e) {

    const pollId =
      String(
        e.currentTarget.dataset.pollId || ''
      )


    if (pollId) {

      wx.navigateTo({

        url:
          `/pages/poll/poll?pollId=${encodeURIComponent(pollId)}`

      })

      return

    }


    wx.navigateTo({

      url:
        '/pages/poll/poll'

    })

  }

})