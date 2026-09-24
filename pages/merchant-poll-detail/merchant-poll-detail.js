const {
  getPollById
} = require('../../utils/poll.js')

const {
  getMessageById
} = require('../../utils/message.js')


Page({

  data: {

    poll: null,

    sourceMessage: null,

    winnerNames: '',

    isTie: false

  },


  onLoad(options) {

    const pollId =
      options && options.id
        ? decodeURIComponent(
            options.id
          )
        : ''


    if (!pollId) {

      wx.showToast({

        title:
          '没有收到投票ID',

        icon:
          'none'

      })

      return

    }


    this.pollId =
      String(pollId)


    this.loadDetail()

  },


  onShow() {

    if (this.pollId) {

      this.loadDetail()

    }

  },


  // =========================
  // 加载投票详情
  // =========================

  loadDetail() {

    const poll =
      getPollById(
        this.pollId
      )


    if (!poll) {

      this.setData({

        poll: null,

        sourceMessage: null,

        winnerNames: '',

        isTie: false

      })


      wx.showToast({

        title:
          '投票不存在',

        icon:
          'none'

      })

      return

    }


    // =========================
    // 来源留言
    // =========================

    let sourceMessage =
      null


    if (
      poll.sourceMessageId
    ) {

      sourceMessage =
        getMessageById(
          poll.sourceMessageId
        )

    }


    // =========================
    // 计算最高票
    // =========================

    const options =
      Array.isArray(poll.options)
        ? poll.options
        : []


    let maxVotes =
      0


    options.forEach(option => {

      const votes =
        Number(
          option.votes || 0
        )


      if (
        votes > maxVotes
      ) {

        maxVotes =
          votes

      }

    })


    const winners =
  maxVotes > 0
    ? options.filter(
        option =>
          Number(
            option.votes || 0
          ) === maxVotes
      )
    : []

const resultState =
  maxVotes === 0
    ? 'none'
    : winners.length > 1
      ? 'tie'
      : 'winner'

const winnerNames =
  resultState === 'none'
    ? '暂无结果'
    : winners
        .map(
          item =>
            item.name
        )
        .join('、')

const isTie =
  resultState === 'tie'


    // =========================
    // 生成进度条样式
    // =========================

    const detailOptions =
  options.map(option => {

    const percent =
      Number(
        option.percent || 0
      )

    const votes =
      Number(
        option.votes || 0
      )

    let resultLabel = ''

    if (
      resultState === 'winner' &&
      votes === maxVotes
    ) {

      resultLabel = '🏆最高票'

    }

    if (
      resultState === 'tie' &&
      votes === maxVotes
    ) {

      resultLabel = '🤝平票'

    }

    return {

      ...option,

      votes,

      percent,

      isWinner:
        votes === maxVotes &&
        maxVotes > 0,

      resultLabel,

      percentStyle:
        `width: ${percent}%;`

    }

  })


  this.setData({

    poll: {
  
      ...poll,
  
      options:
        detailOptions
  
    },
  
    sourceMessage,
  
    winnerNames,
  
    isTie,
  
    resultState
  
  })

  },


  // =========================
  // 返回
  // =========================

  goBack() {

    const pages =
      getCurrentPages()
  
    if (
      pages &&
      pages.length > 1
    ) {
  
      wx.navigateBack({
  
        delta: 1
  
      })
  
      return
  
    }
  
    wx.redirectTo({
  
      url:
        '/pages/merchant-poll/merchant-poll'
  
    })
  
  },

  // =========================
// 查看原留言
// =========================

openSourceMessage() {

  const sourceMessage =
    this.data.sourceMessage

  if (
    !sourceMessage ||
    !sourceMessage.id
  ) {

    wx.showToast({

      title:
        '原留言不存在',

      icon:
        'none'

    })

    return

  }

  wx.navigateTo({

    url:
      `/pages/message-detail/message-detail?id=${encodeURIComponent(
        sourceMessage.id
      )}`

  })

}

})