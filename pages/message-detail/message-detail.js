const {
  getMessageById,
  updateMessage
} = require('../../utils/message.js')

Page({
  data: {
    messageId: '',
    post: null,
    comments: [],
    commentText: '',
    replyingTo: null,
    replyHint: '',
    showEmoji: false,

emojiList: [
  '😀', '😂', '😊', '😍',
  '😘', '😋', '🤩', '🥰',
  '👍', '❤️', '👏', '🎉',
  '🤣', '😎', '🥹', '😭',
  '😡', '😱', '🤔', '🙌',
  '✨', '🔥', '🍜', '🍚',
  '🍗', '🥳', '💯', '❤️'
],
  },

  // =========================
  // 页面加载
  // =========================
  onLoad(options) {
    const id = options.id || ''

    this.setData({
      messageId: id
    })

    this.loadMessage(id)
  },

  // =========================
// 创建“评论回复”通知
// =========================
addCommentNotification(target, messageId, replyText) {
  let notifications =
    wx.getStorageSync('notifications') || []

  const targetName =
    target.name ||
    target.userName ||
    '食客'

  const notification = {
    id:
      `comment_reply_${messageId}_${Date.now()}`,

    type: 'comment',

    icon: '💬',

    iconClass: 'comment-icon',

    title: '有人回复了你的评论',

    content:
      `${targetName}的评论收到了回复：${replyText}`,

    time: '刚刚',

    read: false,

    messageId: messageId
  }

  notifications.unshift(notification)

  wx.setStorageSync(
    'notifications',
    notifications
  )
},

  // =========================
  // 每次重新进入页面
  // =========================
  onShow() {
    if (!this.data.messageId) {
      return
    }

    this.loadMessage(this.data.messageId)

    const merchantUpdate =
      wx.getStorageSync('merchantUpdate')

    if (
      merchantUpdate &&
      String(merchantUpdate.id) === String(this.data.messageId)
    ) {
      this.applyMerchantUpdate(merchantUpdate)

      wx.removeStorageSync('merchantUpdate')
    }
  },

  // =========================
  // 返回上一页
  // =========================
  goBack() {
    wx.navigateBack({
      delta: 1
    })
  },

  // =========================
  // 加载留言
  // =========================
  loadMessage(id) {
    const post = getMessageById(id)

    if (!post) {
      wx.showToast({
        title: '留言不存在',
        icon: 'none'
      })

      setTimeout(() => {
        wx.navigateBack({
          delta: 1
        })
      }, 1000)

      return
    }

    const likedMessages =
      wx.getStorageSync('likedMessages') || []

    const liked =
      likedMessages.includes(String(id))

    const comments =
      Array.isArray(post.commentList)
        ? post.commentList
        : []

    this.setData({
      post: {
        ...post,
        liked
      },

      comments
    })
  },

  // =========================
  // 点赞 / 取消点赞
  // =========================
  toggleLike() {
    if (!this.data.post) {
      return
    }

    const id = this.data.post.id

    let likedMessages =
      wx.getStorageSync('likedMessages') || []

    const index =
      likedMessages.indexOf(String(id))

    let liked = false

    let likes =
      Number(this.data.post.likes || 0)

    if (index !== -1) {
      // 取消点赞
      likedMessages.splice(index, 1)

      likes = Math.max(
        0,
        likes - 1
      )

      liked = false
    } else {
      // 点赞
      likedMessages.push(String(id))

      likes += 1

      liked = true
    }

    wx.setStorageSync(
      'likedMessages',
      likedMessages
    )

    const updatedPost =
      updateMessage(
        id,
        oldPost => ({
          ...oldPost,
          likes
        })
      )

    if (!updatedPost) {
      return
    }

    this.setData({
      post: {
        ...updatedPost,
        liked
      }
    })
  },

  // =========================
  // 输入评论
  // =========================
  inputComment(e) {
    this.setData({
      commentText: e.detail.value
    })
  },

  // =========================
  // 回复评论
  // =========================
  replyToComment(e) {
    const index = e.currentTarget.dataset.index
  
    const comment = this.data.comments[index]
  
    if (!comment) {
      return
    }
  
    const name =
      comment.name ||
      comment.userName ||
      '食客'
  
    this.setData({
      replyingTo: {
        id: comment.id,
        name: name
      },
  
      replyHint: `回复 ${name}`
    })
  },

  // =========================
  // 回复商家
  // =========================
  replyToMerchant() {
    this.setData({
      replyingTo: {
        name: '餐厅'
      },

      replyHint: '回复餐厅'
    })
  },

  // =========================
  // 取消回复
  // =========================
  cancelReply() {
    this.setData({
      replyingTo: null,
      replyHint: ''
    })
  },

  // =========================
  // 发送评论
  // =========================
  submitComment() {
    const text = (this.data.commentText || '').trim()
  
    // 没有输入内容
    if (!text) {
      wx.showToast({
        title: '请输入评论内容',
        icon: 'none'
      })
      return
    }
  
    // 当前没有留言
    if (!this.data.post) {
      wx.showToast({
        title: '留言数据不存在',
        icon: 'none'
      })
      return
    }
  
    // 当前留言 ID
    const postId = this.data.post.id
  
    if (!postId) {
      wx.showToast({
        title: '留言ID不存在',
        icon: 'none'
      })
      return
    }
  
    // 创建评论
    const newComment = {
      id: `comment_${Date.now()}`,
    
      name: '食客',
      userName: '食客',
    
      avatar: '',
    
      text: text,
    
      time: '刚刚',
    
      // 当前这条评论属于哪一条留言
      messageId: postId,
    
      // 回复哪一条评论
      replyToId: this.data.replyingTo
        ? this.data.replyingTo.id
        : '',
    
      // 回复谁
      replyToName: this.data.replyingTo
        ? (
            this.data.replyingTo.name ||
            this.data.replyingTo.userName ||
            ''
          )
        : '',
    
      // 兼容旧数据
      replyTo: this.data.replyingTo
        ? (
            this.data.replyingTo.name ||
            this.data.replyingTo.userName ||
            ''
          )
        : ''
    }
  
    // 更新统一留言数据
    const updatedPost = updateMessage(
      postId,
      oldPost => {
  
        const oldComments =
          Array.isArray(oldPost.commentList)
            ? oldPost.commentList
            : []
  
        const newComments = [
          ...oldComments,
          newComment
        ]
  
        return {
          ...oldPost,
  
          commentList: newComments,
  
          commentsCount:
            newComments.length,
  
          comments:
            newComments.length
        }
      }
    )
  
    // 更新失败
    if (!updatedPost) {
      wx.showToast({
        title: '评论失败',
        icon: 'none'
      })
      return
    }

    // =========================
// 如果回复的是其他用户的评论
// 就生成一条评论回复通知
// =========================

const replyTarget = this.data.replyingTo

if (
  replyTarget &&
  replyTarget.name &&
  replyTarget.name !== '食客' &&
  replyTarget.name !== '餐厅'
) {
  this.addCommentNotification(
    replyTarget,
    postId,
    text
  )
}
  
    // 更新页面
    this.setData({
      post: updatedPost,
  
      comments:
        updatedPost.commentList || [],
  
      commentText: '',
  
      replyingTo: null,
  
      replyHint: '',
  
      showEmoji: false
    })
  
    wx.showToast({
      title: '评论成功',
      icon: 'success'
    })
  },

  // =========================
  // 商家处理结果
  // =========================
  applyMerchantUpdate(update) {
    if (!this.data.post) {
      return
    }

    const id =
      this.data.post.id

    const updatedPost =
      updateMessage(
        id,
        oldPost => ({
          ...oldPost,

          reply:
            update.reply ||
            oldPost.reply ||
            null,

          replyTime:
            update.replyTime ||
            oldPost.replyTime ||
            '',

          replyType:
            update.replyType ||
            oldPost.replyType ||
            '',

          status:
            update.status ||
            oldPost.status ||
            '',

          statusName:
            update.statusName ||
            oldPost.statusName ||
            ''
        })
      )

    if (!updatedPost) {
      return
    }

    this.setData({
      post: updatedPost
    })
  },

  // =========================
  // 商家处理
  // =========================
  openMerchantProcess() {
    if (!this.data.post) {
      return
    }

    wx.navigateTo({
      url:
        `/pages/merchant-message/merchant-message?id=${this.data.post.id}`
    })
  },

  // =========================
  // 图片预览
  // =========================
  previewImage(e) {
    const current =
      e.currentTarget.dataset.src

    if (!current) {
      return
    }

    const images =
      this.data.post &&
      this.data.post.images &&
      this.data.post.images.length
        ? this.data.post.images
        : [current]

    wx.previewImage({
      current: current,
      urls: images
    })
  },

  // =========================
  // 清空输入
  // =========================
  clearComment() {
    this.setData({
      commentText: ''
    })
  },

  // =========================
// 打开 / 关闭 Emoji
// =========================
toggleEmoji() {
  this.setData({
    showEmoji: !this.data.showEmoji
  })
},

// =========================
// 选择 Emoji
// =========================
selectEmoji(e) {
  const emoji = e.currentTarget.dataset.emoji

  const text =
    (this.data.commentText || '') + emoji

  this.setData({
    commentText: text
  })
},

})