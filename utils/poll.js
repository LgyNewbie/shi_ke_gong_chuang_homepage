const {
  updateMessage
} = require('./message.js')

// ================================
// 食客共创 - 多投票统一数据工具
// ================================


// ================================
// 标准化投票
// ================================

function normalizePoll(item = {}) {

  const options =
    Array.isArray(item.options)
      ? item.options.map((option, index) => {

          const votes =
            Number(
              option.votes !== undefined
                ? option.votes
                : option.count || 0
            )

          return {
            ...option,

            id:
              String(
                option.id !== undefined
                  ? option.id
                  : `option_${index}`
              ),

            name:
              option.name || `选项${index + 1}`,

            desc:
              option.desc || '',

            votes:
              votes
          }

        })
      : []


  const totalVotes =
    options.reduce(
      (sum, option) => {
        return sum + Number(option.votes || 0)
      },
      0
    )


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
  
  
  const resultOptions =
    options.map(option => {
  
      const votes =
        Number(option.votes || 0)
  
  
      const percent =
        totalVotes > 0
          ? Math.round(
              votes /
              totalVotes *
              100
            )
          : 0
  
  
      return {
  
        ...option,
  
        votes,
  
        percent,
  
        // 有票时才判断最高票
        isWinner:
          maxVotes > 0 &&
          votes === maxVotes
  
      }
  
    })


  let statusName = '进行中'


  if (item.status === 'ended') {
    statusName = '已结束'
  }

  if (item.status === 'accepted') {
    statusName = '已采纳'
  }

  if (item.status === 'rejected') {
    statusName = '暂不采纳'
  }


  return {

    ...item,

    id:
      item.id ||
      `poll_${Date.now()}`,

    title:
      item.title || '食客共创投票',

    description:
      item.description || '',

    endDate:
      item.endDate || '',

    options:
      resultOptions,

    totalVotes:
      totalVotes,

    status:
      item.status || 'active',

    statusName:
      item.statusName || statusName,

    sourceMessageId:
      item.sourceMessageId || '',

    createTime:
      item.createTime || '',

    startTime:
      item.startTime || '',

    endTime:
      item.endTime || ''

  }
}


// ================================
// 获取全部投票
// ================================

function getPolls() {

  let polls =
    wx.getStorageSync('polls')


  // 兼容旧版 weeklyPoll
  if (!Array.isArray(polls)) {

    const oldPoll =
      wx.getStorageSync('weeklyPoll')


    if (oldPoll) {

      polls = [
        normalizePoll(oldPoll)
      ]

    } else {

      polls = []

    }


    wx.setStorageSync(
      'polls',
      polls
    )
  }


  // 如果旧版 polls 是空数组，但 weeklyPoll 有数据
  if (
    polls.length === 0
  ) {

    const oldPoll =
      wx.getStorageSync('weeklyPoll')


    if (oldPoll) {

      polls = [
        normalizePoll(oldPoll)
      ]

      wx.setStorageSync(
        'polls',
        polls
      )
    }
  }


  const normalized =
  polls.map(item =>
    normalizePoll(item)
  )


// =========================
// 自动检查投票截止日期
// =========================

const now =
  new Date()

const today =
  `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`


  const checkedPolls =
  normalized.map(poll => {

    // =========================
    // 不是进行中的投票
    // =========================

    if (
      poll.status !== 'active'
    ) {

      return poll

    }


    // =========================
    // 没有截止日期
    // =========================

    if (
      !poll.endDate
    ) {

      return poll

    }


    // =========================
    // 判断是否已经到期
    // =========================

    if (
      poll.endDate < today
    ) {

      const endedPoll = {

        ...poll,

        status:
          'ended',

        statusName:
          '已结束',

        endTime:
          poll.endTime ||
          `${poll.endDate} 23:59:59`

      }


      // =========================
      // 同步来源留言
      // =========================

      if (
        poll.sourceMessageId
      ) {

        updateMessage(

          poll.sourceMessageId,

          oldMessage => ({

            ...oldMessage,

            status:
              'ended',

            statusName:
              '投票已结束',

            pollId:
              poll.id

          })

        )

      }


      return endedPoll

    }


    return poll

  })


wx.setStorageSync(
  'polls',
  checkedPolls
)


// =========================
// 同步旧版 weeklyPoll
// =========================

const weeklyPoll =
  wx.getStorageSync(
    'weeklyPoll'
  )


if (
  weeklyPoll &&
  weeklyPoll.id
) {

  const currentPoll =
    checkedPolls.find(
      item =>
        String(item.id) ===
        String(weeklyPoll.id)
    )


  if (currentPoll) {

    wx.setStorageSync(
      'weeklyPoll',
      currentPoll
    )

  }

}


return checkedPolls
}


// ================================
// 保存全部投票
// ================================

function savePolls(polls = []) {

  const normalized =
    polls.map(item =>
      normalizePoll(item)
    )


  wx.setStorageSync(
    'polls',
    normalized
  )


  return normalized
}


// ================================
// 新增投票
// ================================

function addPoll(poll) {

  const polls =
    getPolls()


  const newPoll =
    normalizePoll(poll)


  polls.unshift(
    newPoll
  )


  const savedPolls =
    savePolls(
      polls
    )


  // 旧首页兼容
  wx.setStorageSync(
    'weeklyPoll',
    newPoll
  )


  return savedPolls[0]
}


// ================================
// 根据 ID 获取投票
// ================================

function getPollById(id) {

  if (!id) {
    return null
  }


  const polls =
    getPolls()


  return polls.find(
    item =>
      String(item.id) ===
      String(id)
  ) || null
}


// ================================
// 更新投票
// ================================

function updatePoll(id, updater) {

  const polls =
    getPolls()


  const index =
    polls.findIndex(
      item =>
        String(item.id) ===
        String(id)
    )


  if (index === -1) {
    return null
  }


  const oldPoll =
    polls[index]


  const newPoll =
    typeof updater === 'function'
      ? updater({
          ...oldPoll
        })
      : {
          ...oldPoll,
          ...updater
        }


  polls[index] =
    normalizePoll(
      newPoll
    )


  savePolls(
    polls
  )


  // 保留旧首页字段兼容
  const weeklyPoll =
    wx.getStorageSync('weeklyPoll')


  if (
    weeklyPoll &&
    String(weeklyPoll.id) ===
    String(id)
  ) {

    wx.setStorageSync(
      'weeklyPoll',
      polls[index]
    )

  }


  return polls[index]
}


// ================================
// 获取用户投票记录
// ================================
// 新版结构：
// pollVotes = {
//   "poll_xxx": "option_xxx",
//   "poll_yyy": "option_yyy"
// }
//
// 一个投票对应一条记录
// 不再让 weeklyPollVoted 干扰其他投票
// ================================

function getVoteRecords() {

  let records =
    wx.getStorageSync('pollVotes')


  const recordsExist =
    records &&
    typeof records === 'object' &&
    !Array.isArray(records)


  if (!recordsExist) {

    records = {}

  }


  // =========================
  // 旧数据只迁移一次
  // =========================

  const migrated =
    wx.getStorageSync(
      'pollVoteMigrationDone'
    )


  if (!migrated) {

    const oldPoll =
      wx.getStorageSync(
        'weeklyPoll'
      )


    const oldVoted =
      wx.getStorageSync(
        'weeklyPollVoted'
      )


    const oldChoice =
      wx.getStorageSync(
        'weeklyPollChoice'
      )


    // 只有在确实存在旧版投票记录时才迁移
    if (
      oldPoll &&
      oldVoted === true &&
      oldChoice
    ) {

      const oldPollId =
        String(oldPoll.id)


      if (
        !records[oldPollId]
      ) {

        records[oldPollId] =
          String(oldChoice)

      }

    }


    wx.setStorageSync(
      'pollVotes',
      records
    )


    wx.setStorageSync(
      'pollVoteMigrationDone',
      true
    )

  }


  return records
}


// ================================
// 判断某场投票是否投过
// ================================

function hasVoted(pollId) {

  if (!pollId) {
    return false
  }


  const records =
    getVoteRecords()


  return !!(
    records &&
    records[
      String(pollId)
    ]
  )
}


// ================================
// 获取某场投票的选择
// ================================

function getMyChoice(pollId) {

  if (!pollId) {
    return ''
  }


  const records =
    getVoteRecords()


  return records[
    String(pollId)
  ] || ''
}


// ================================
// 给某场投票记录用户选择
// ================================

function setMyChoice(
  pollId,
  optionId
) {

  const records =
    getVoteRecords()


  records[
    String(pollId)
  ] =
    String(optionId)


  wx.setStorageSync(
    'pollVotes',
    records
  )


  // 注意：
  // 这里不再同步 weeklyPollVoted
  // 也不再同步 weeklyPollChoice
  //
  // 因为现在已经是多投票结构，
  // 每一场投票都必须独立保存。


  return records
}


// ================================
// 提交投票
// ================================

function votePoll(
  pollId,
  optionId
) {

  if (!pollId || !optionId) {
    return null
  }


  const poll =
    getPollById(
      pollId
    )


  if (!poll) {
    return null
  }


  // 只有进行中的投票允许参与
  if (
    poll.status !== 'active'
  ) {

    return null
  }


  // 当前这场已经投过
  if (
    hasVoted(
      pollId
    )
  ) {

    return null
  }


  // 检查选项是否存在
  const optionExists =
    poll.options.some(
      option =>
        String(option.id) ===
        String(optionId)
    )


  if (!optionExists) {
    return null
  }


  const updatedPoll =
    updatePoll(
      pollId,

      oldPoll => {

        const options =
          oldPoll.options.map(
            option => {

              if (
                String(option.id) ===
                String(optionId)
              ) {

                return {

                  ...option,

                  votes:
                    Number(
                      option.votes || 0
                    ) + 1

                }

              }

              return option

            }
          )


        return {

          ...oldPoll,

          options

        }

      }
    )


  if (!updatedPoll) {
    return null
  }


  // 单独保存这一场投票的用户选择
  setMyChoice(
    pollId,
    optionId
  )


  return updatedPoll
}


// ================================
// 导出
// ================================

module.exports = {

  normalizePoll,

  getPolls,

  savePolls,

  addPoll,

  getPollById,

  updatePoll,

  getVoteRecords,

  hasVoted,

  getMyChoice,

  setMyChoice,

  votePoll

}