// ================================
// 食客共创 - 商家多投票管理
// ================================

const {
  getMessageById,
  updateMessage
} = require('../../utils/message.js')

const {
  addNotification
} = require('../../utils/notification.js')

const {
  getPolls,
  updatePoll
} = require('../../utils/poll.js')


Page({

  data: {

    polls: []

  },


  onShow() {

    this.loadPolls()

  },


  // =========================
  // 加载全部投票
  // =========================

  loadPolls() {

    const polls = getPolls()


    const displayPolls =
      polls.map(poll => {

        let sourceMessage = null


        if (poll.sourceMessageId) {

          sourceMessage =
            getMessageById(
              poll.sourceMessageId
            )

        }


        // 重新给每个选项计算样式
        const options =
          (poll.options || []).map(option => {

            const percent =
              Number(option.percent || 0)


            return {

              ...option,

              // 直接生成完整 CSS
              percentStyle:
                `width: ${percent}%;`

            }

          })


        return {

          ...poll,

          options,

          sourceMessage

        }

      })


    this.setData({

      polls:
        displayPolls

    })

  },


  // =========================
  // 结束某一场投票
  // =========================

  endPoll(e) {

    const pollId =
      String(
        e.currentTarget.dataset.pollId || ''
      )


    if (!pollId) {

      wx.showToast({

        title:
          '没有收到投票ID',

        icon:
          'none'

      })

      return

    }


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
      poll.status !== 'active'
    ) {

      wx.showToast({

        title:
          '这场投票已经结束',

        icon:
          'none'

      })

      return

    }


    wx.showModal({

      title:
        '结束投票',

      content:
        `确定结束“${poll.title}”这场投票吗？`,

      confirmText:
        '结束投票',

      cancelText:
        '暂不结束',

      success: (res) => {

        if (!res.confirm) {
          return
        }


        const endTime =
          new Date().toLocaleString()


        const updatedPoll =
          updatePoll(

            pollId,

            oldPoll => ({

              ...oldPoll,

              status:
                'ended',

              statusName:
                '已结束',

              endTime

            })

          )


        if (!updatedPoll) {

          wx.showToast({

            title:
              '结束投票失败',

            icon:
              'none'

          })

          return

        }


        // 更新来源留言
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


        // 通知
        addNotification({

          id:
            `poll_end_${poll.id}_${Date.now()}`,

          type:
            'poll',

          icon:
            '🗳️',

          iconClass:
            'poll-icon',

          title:
            '投票已经结束',

          content:
            `“${poll.title}”投票已经结束，可以查看最终结果。`,

          time:
            '刚刚',

          read:
            false,

          messageId:
            poll.sourceMessageId || ''

        })


        this.loadPolls()


        wx.showToast({

          title:
            '已结束投票',

          icon:
            'success'

        })

      }

    })

  },


  // =========================
  // 采纳 / 暂不采纳
  // =========================

  makeDecision(e) {

    const pollId =
      String(
        e.currentTarget.dataset.pollId || ''
      )


    const result =
      e.currentTarget.dataset.result


    if (!pollId) {

      wx.showToast({

        title:
          '没有收到投票ID',

        icon:
          'none'

      })

      return

    }


    if (
      result !== 'accepted' &&
      result !== 'rejected'
    ) {

      return

    }


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
      poll.status !== 'ended'
    ) {

      wx.showToast({

        title:
          '请先结束投票',

        icon:
          'none'

      })

      return

    }


    const resultText =
      result === 'accepted'
        ? '已采纳'
        : '暂不采纳'


    wx.showModal({

      title:
        '确认处理',

      content:
        `确定将“${poll.title}”对应的食客建议标记为“${resultText}”吗？`,

      confirmText:
        '确定',

      cancelText:
        '取消',

      success: (res) => {

        if (!res.confirm) {
          return
        }


        const updatedPoll =
          updatePoll(

            pollId,

            oldPoll => ({

              ...oldPoll,

              status:
                result,

              statusName:
                resultText,

              endTime:
                oldPoll.endTime ||
                new Date().toLocaleString()

            })

          )


        if (!updatedPoll) {

          wx.showToast({

            title:
              '处理失败',

            icon:
              'none'

          })

          return

        }


        // 更新来源留言
        if (
          poll.sourceMessageId
        ) {

          updateMessage(

            poll.sourceMessageId,

            oldMessage => ({

              ...oldMessage,

              status:
                result,

              statusName:
                resultText,

              pollId:
                poll.id

            })

          )

        }


        // 通知
        addNotification({

          id:
            `poll_result_${poll.id}_${Date.now()}`,

          type:
            'poll',

          icon:
            '🗳️',

          iconClass:
            'poll-icon',

          title:
            result === 'accepted'
              ? '你参与的建议已被采纳'
              : '投票结果已更新',

          content:
            result === 'accepted'
              ? `“${poll.title}”对应的食客建议已被采纳。`
              : `“${poll.title}”对应的建议暂不采纳。`,

          time:
            '刚刚',

          read:
            false,

          messageId:
            poll.sourceMessageId || ''

        })


        this.loadPolls()


        wx.showModal({

          title:
            '处理完成',

          content:
            result === 'accepted'
              ? '这条食客建议已经标记为“已采纳”。'
              : '这条食客建议已经标记为“暂不采纳”。',

          showCancel:
            false,

          confirmText:
            '好的'

        })

      }

    })

  }

})