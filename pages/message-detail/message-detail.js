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


if (merchantUpdate) {

  const updateMessageId =
    merchantUpdate.messageId ||
    merchantUpdate.id ||
    ''


  if (
    String(updateMessageId) ===
    String(this.data.messageId)
  ) {

    this.applyMerchantUpdate(
      merchantUpdate
    )

    wx.removeStorageSync(
      'merchantUpdate'
    )

  }

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
  async loadMessage(id) {
    try {
      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: `http://192.168.254.145:3000/api/messages/${id}`,
          method: 'GET',
  
          success: (res) => {
            if (res.data && res.data.code === 0) {
              resolve(res.data.data)
            } else {
              reject(
                new Error(
                  res.data?.message || '获取留言详情失败'
                )
              )
            }
          },
  
          fail: reject
        })
      })
  
      const images = Array.isArray(res.images)
        ? res.images
        : []
  
      const comments = Array.isArray(res.comments)
        ? res.comments.map(comment => ({
            id: comment.id,
            userId: comment.user_id,
            name: comment.is_admin
              ? '🍜 餐厅商家'
              : (comment.nickname || '食客'),
            content: comment.content || '',
            parentId: comment.parent_id,
            isAdmin: Number(comment.is_admin || 0) === 1,
            time: comment.created_at || ''
          }))
        : []
  
      const adminComment = comments.find(
        comment => comment.isAdmin
      )
  
      const post = {
        id: res.id,
        user_id: res.user_id,
  
        name: res.nickname || '食客',
        userName: res.nickname || '食客',
  
        text: res.content || '',
        content: res.content || '',
  
        images,
        image: images[0] || '',
  
        likes: Number(res.like_count || 0),
        comments: Number(res.comment_count || 0),
        commentsCount: Number(res.comment_count || 0),
  
        commentList: comments,
  
        avatar: '',
        level: 1,
        tag: '食客留言',
  
        time: res.created_at || '',
        createTime: res.created_at || '',
  
        status: res.status || 'normal',
  
        // 如果数据库中存在餐厅官方回复
        reply: adminComment
          ? adminComment.content
          : '',
        replyTime: adminComment
          ? adminComment.time
          : '',
        replyType: adminComment
          ? 'official'
          : ''
      }
  
      this.setData({
        post,
        comments,
        messageId: id
      })
  
    } catch (error) {
      console.error('加载留言详情失败：', error)
  
      wx.showToast({
        title: '留言加载失败',
        icon: 'none'
      })
    }
  },

  // =========================
  // 点赞 / 取消点赞
  // =========================
  async toggleLike() {
    const messageId = Number(this.data.messageId)
  
    // 这里先使用当前测试用户 ID 2
    // 后面接入正式登录用户后再替换
    const currentUser = wx.getStorageSync('currentUser')

if (!currentUser || !currentUser.id) {
  wx.showToast({
    title: '请先登录',
    icon: 'none'
  })
  return
}

const userId = Number(currentUser.id)
  
    if (!messageId) {
      wx.showToast({
        title: '留言ID无效',
        icon: 'none'
      })
      return
    }
  
    try {
      const result = await new Promise((resolve, reject) => {
        wx.request({
          url: `http://192.168.254.145:3000/api/messages/${messageId}/like`,
          method: 'POST',
          header: {
            'content-type': 'application/json'
          },
          data: {
            user_id: userId
          },
  
          success: (res) => {
            if (res.data && res.data.code === 0) {
              resolve(res.data.data)
            } else {
              reject(
                new Error(
                  res.data?.message || '点赞失败'
                )
              )
            }
          },
  
          fail: reject
        })
      })
  
      const liked = !!result.liked
      const likeCount = Number(result.like_count || 0)
  
      this.setData({
        'post.likes': likeCount,
        liked
      })
  
    } catch (error) {
      console.error('点赞失败：', error)
  
      wx.showToast({
        title: '点赞失败',
        icon: 'none'
      })
    }
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
  async submitComment() {
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
    const postId = Number(this.data.post.id)
  
    if (!postId) {
      wx.showToast({
        title: '留言ID不存在',
        icon: 'none'
      })
      return
    }
  
    // ==================================================
    // 临时测试用户
    // 后面接入正式用户登录后，再替换成真实 user_id
    // ==================================================
    const currentUser = wx.getStorageSync('currentUser')

    if (!currentUser || !currentUser.id) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    
    const userId = Number(currentUser.id)
  
    // ==================================================
    // 如果是在回复某一条评论
    // 就把这条评论的 id 作为 parent_id
    // ==================================================
    const replyingTo = this.data.replyingTo
  
    const parentId =
      replyingTo && replyingTo.id
        ? Number(replyingTo.id)
        : null
  
    try {
      // ==================================================
      // 调用后端评论接口
      // ==================================================
      const result = await new Promise((resolve, reject) => {
        wx.request({
          url: `http://192.168.254.145:3000/api/messages/${postId}/comments`,
  
          method: 'POST',
  
          header: {
            'content-type': 'application/json'
          },
  
          data: {
            user_id: userId,
            content: text,
            parent_id: parentId
          },
  
          success: (res) => {
            if (
              res.data &&
              res.data.code === 0
            ) {
              resolve(res.data.data)
            } else {
              reject(
                new Error(
                  res.data?.message ||
                  '评论失败'
                )
              )
            }
          },
  
          fail: reject
        })
      })
  
      // ==================================================
      // 后端返回的真实评论
      // ==================================================
      const serverComment = result.comment
  
      // ==================================================
      // 转换成当前详情页使用的评论结构
      // ==================================================
      const newComment = {
        id: serverComment.id,
  
        messageId: serverComment.message_id,
  
        userId: serverComment.user_id,
  
        name: serverComment.is_admin
          ? '🍜 餐厅商家'
          : (
              serverComment.nickname ||
              '食客'
            ),
  
        userName: serverComment.is_admin
          ? '🍜 餐厅商家'
          : (
              serverComment.nickname ||
              '食客'
            ),
  
        avatar: '',
  
        text: serverComment.content || '',
  
        content: serverComment.content || '',
  
        time: serverComment.created_at || '刚刚',
  
        parentId:
          serverComment.parent_id,
  
        replyToId:
          serverComment.parent_id || '',
  
        replyToName:
          replyingTo
            ? (
                replyingTo.name ||
                replyingTo.userName ||
                ''
              )
            : '',
  
        replyTo:
          replyingTo
            ? (
                replyingTo.name ||
                replyingTo.userName ||
                ''
              )
            : '',
  
        isAdmin:
          Number(serverComment.is_admin || 0) === 1
      }
  
      // ==================================================
      // 获取当前已有评论
      // ==================================================
      const oldComments =
        Array.isArray(this.data.comments)
          ? this.data.comments
          : []
  
      // ==================================================
      // 添加后端返回的真实评论
      // ==================================================
      const newComments = [
        ...oldComments,
        newComment
      ]

      const replyTarget = this.data.replyingTo
  
      // ==================================================
      // 使用后端返回的真实评论数量
      // ==================================================
      const commentCount =
        Number(
          result.comment_count ||
          newComments.length
        )
  
      // ==================================================
      // 更新页面
      // 注意：这里不再调用 updateMessage()
      // 评论已经保存到了 SQLite
      // ==================================================
      this.setData({
        'post.commentList': newComments,
        'post.comments': commentCount,
        'post.commentsCount': commentCount,
  
        comments: newComments,
  
        commentText: '',
  
        replyingTo: null,
  
        replyHint: '',
  
        showEmoji: false
      })
  
      // ==================================================
      // 如果回复的是其他用户的评论
      // 就生成评论回复通知
      // ==================================================
      const replyTarget =
        this.data.replyingTo
  
      if (
        replyTarget &&
        replyTarget.name &&
        replyTarget.name !== '食客' &&
        replyTarget.name !== '餐厅' &&
        replyTarget.name !== '🍜 餐厅商家'
      ) {
        this.addCommentNotification(
          replyTarget,
          postId,
          text
        )
      }
  
      wx.showToast({
        title: '评论成功',
        icon: 'success'
      })
  
    } catch (error) {
      console.error(
        '发表评论失败：',
        error
      )
  
      wx.showToast({
        title: '评论失败',
        icon: 'none'
      })
    }
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