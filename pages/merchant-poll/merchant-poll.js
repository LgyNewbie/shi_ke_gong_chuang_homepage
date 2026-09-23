const {
  getMessageById,
  updateMessage
} = require('../../utils/message.js')

const {
  addNotification
} = require('../../utils/notification.js')


Page({
  data: {
    poll: null,

    sourceMessage: null
  },


  onShow() {
    this.loadPoll()
  },


  // =========================
  // 加载当前投票
  // =========================

  loadPoll() {
    const poll =
      wx.getStorageSync('weeklyPoll') || null

    if (!poll) {
      this.setData({
        poll: null,
        sourceMessage: null
      })

      return
    }


    // 重新计算百分比
    const total =
      Number(poll.totalVotes || 0)

    const options =
      (poll.options || []).map(item => {

        let percent = 0

        if (total > 0) {
          percent =
            Math.round(
              Number(item.count || 0)
              / total
              * 100
            )
        }

        return {
          ...item,
          percent
        }
      })


    const newPoll = {
      ...poll,
      options
    }


    // 找到来源留言
    let sourceMessage = null

    if (poll.sourceMessageId) {
      sourceMessage =
        getMessageById(
          poll.sourceMessageId
        )
    }


    this.setData({
      poll: newPoll,
      sourceMessage
    })
  },


  // =========================
  // 处理建议
  // =========================

  makeDecision(e) {
    if (!this.data.poll) {
      return
    }


    const result =
      e.currentTarget.dataset.result


    let resultText = ''

    if (result === 'accepted') {
      resultText = '已采纳'
    }

    if (result === 'rejected') {
      resultText = '暂不采纳'
    }


    if (!resultText) {
      return
    }


    wx.showModal({

      title: '确认处理',

      content:
        `确定将这条投票建议标记为“${resultText}”吗？`,

      confirmText: '确定',

      cancelText: '取消',

      success: (res) => {

        if (!res.confirm) {
          return
        }


        const poll =
          this.data.poll


        // 更新投票状态
        const updatedPoll = {
          ...poll,

          status: result,

          statusName: resultText,

          endTime:
            new Date().toLocaleString()
        }


        wx.setStorageSync(
          'weeklyPoll',
          updatedPoll
        )


        // =========================
        // 更新来源留言
        // =========================

        if (poll.sourceMessageId) {

          updateMessage(
            poll.sourceMessageId,
            oldMessage => ({

              ...oldMessage,

              status: result,

              statusName: resultText,

              pollId: poll.id

            })
          )

        }


        // =========================
        // 生成通知
        // =========================

        addNotification({

          id:
            `poll_result_${poll.id}_${Date.now()}`,

          type: 'poll',

          icon: '🗳️',

          iconClass: 'poll-icon',

          title:
            result === 'accepted'
              ? '你参与的建议已被采纳'
              : '投票结果已更新',

          content:
            result === 'accepted'
              ? `“${poll.title}”对应的食客建议已被采纳。`
              : `“${poll.title}”对应的建议暂不采纳。`,

          time: '刚刚',

          read: false,

          messageId:
            poll.sourceMessageId || ''

        })


        this.setData({
          poll: updatedPoll
        })


        // 如果是采纳
        if (result === 'accepted') {

          wx.showModal({

            title: '处理完成',

            content:
              '这条食客建议已经标记为“已采纳”。',

            showCancel: false,

            confirmText: '好的'

          })

          return
        }


        wx.showModal({

          title: '处理完成',

          content:
            '这条食客建议已经标记为“暂不采纳”。',

          showCancel: false,

          confirmText: '好的'

        })

      }

    })
  }
})