// ================================
// 食客共创 - 留言统一数据
// ================================


function normalizeMessage(item = {}) {

  const images =
    Array.isArray(item.images)
      ? item.images
      : (item.image ? [item.image] : [])


  const text =
    item.text || item.content || ''


  const commentList =
    Array.isArray(item.commentList)
      ? item.commentList
      : []


  return {

    ...item,

    id:
      item.id ||
      `msg_${Date.now()}`,

    name:
      item.name ||
      item.userName ||
      '食客',

    userName:
      item.userName ||
      item.name ||
      '食客',

    avatar:
      item.avatar || '',

    level:
      item.level || 1,

    tag:
      item.tag ||
      item.category ||
      '其他',

    category:
      item.category ||
      item.tag ||
      '其他',

    text:
      text,

    content:
      text,

    images:
      images,

    image:
      item.image ||
      images[0] ||
      '',

    likes:
      Number(item.likes || 0),

    commentList:
      commentList,

      commentsCount: Number(
        item.commentsCount ??
        item.comment_count ??
        item.comments ??
        commentList.length
      ),
      
      comments: Number(
        item.commentsCount ??
        item.comment_count ??
        item.comments ??
        commentList.length
      ),

    reply:
      item.reply || null,

    replyTime:
      item.replyTime || '',

    replyType:
      item.replyType || '',

    status:
      item.status || '',

    statusName:
      item.statusName || '',

    time:
      item.time ||
      item.createTime ||
      '',

    createTime:
      item.createTime ||
      item.time ||
      ''

  }

}


// ================================
// 获取全部留言
// ================================

function getMessages(defaultMessages = []) {

  let messages =
    wx.getStorageSync('messages')


  if (!Array.isArray(messages)) {

    messages =
      defaultMessages.map(item =>
        normalizeMessage(item)
      )


    wx.setStorageSync(
      'messages',
      messages
    )

  }


  return messages.map(item =>
    normalizeMessage(item)
  )

}


// ================================
// 获取“我的留言”
// ================================
// 以 myMessages 中保存的 ID 为准，
// 不再根据用户名“食客”判断。
// 同时自动去重。
// ================================

function getMyMessages() {

  const allMessages =
    getMessages()


  const savedMyMessages =
    wx.getStorageSync(
      'myMessages'
    ) || []


  if (
    !Array.isArray(savedMyMessages)
  ) {

    return []

  }


  const myIds = {}


  savedMyMessages.forEach(item => {

    if (
      item &&
      item.id !== undefined &&
      item.id !== null
    ) {

      myIds[
        String(item.id)
      ] = true

    }

  })


  const result = []


  const usedIds = {}


  allMessages.forEach(item => {

    const id =
      String(item.id)


    if (
      myIds[id] &&
      !usedIds[id]
    ) {

      result.push(
        item
      )

      usedIds[id] = true

    }

  })


  // 同步清理 myMessages 中的重复记录
  const cleanMyMessages =
    result.map(item =>
      normalizeMessage(item)
    )


  wx.setStorageSync(
    'myMessages',
    cleanMyMessages
  )


  return cleanMyMessages

}


// ================================
// 保存全部留言
// ================================

function saveMessages(messages = []) {

  const normalized =
    messages.map(item =>
      normalizeMessage(item)
    )


  // 主数据
  wx.setStorageSync(
    'messages',
    normalized
  )


  // =========================
  // 同步“我的留言”
  // =========================

  const oldMyMessages =
    wx.getStorageSync(
      'myMessages'
    ) || []


  if (
    Array.isArray(oldMyMessages)
  ) {

    const myIds = {}


    oldMyMessages.forEach(item => {

      if (
        item &&
        item.id !== undefined &&
        item.id !== null
      ) {

        myIds[
          String(item.id)
        ] = true

      }

    })


    const newMyMessages = []


    const usedIds = {}


    normalized.forEach(item => {

      const id =
        String(item.id)


      if (
        myIds[id] &&
        !usedIds[id]
      ) {

        newMyMessages.push(
          item
        )

        usedIds[id] = true

      }

    })


    wx.setStorageSync(
      'myMessages',
      newMyMessages
    )

  }


  return normalized

}


// ================================
// 新增留言
// ================================

function addMessage(message) {

  const messages =
    getMessages()


  const newMessage =
    normalizeMessage({
      ...message,
      isMine: true
    })


  // =========================
  // 主数据
  // =========================

  messages.unshift(
    newMessage
  )


  wx.setStorageSync(
    'messages',
    messages
  )


  // =========================
  // 我的留言
  // =========================
  // 先删除同 ID 的旧记录，
  // 再插入一次，彻底避免重复。
  // =========================

  const oldMyMessages =
    wx.getStorageSync(
      'myMessages'
    ) || []


  const cleanMyMessages =
    Array.isArray(oldMyMessages)
      ? oldMyMessages.filter(
          item =>
            String(item.id) !==
            String(newMessage.id)
        )
      : []


  cleanMyMessages.unshift(
    newMessage
  )


  wx.setStorageSync(
    'myMessages',
    cleanMyMessages
  )


  return newMessage

}


// ================================
// 根据 ID 获取留言
// ================================

function getMessageById(id) {

  const messages =
    getMessages()


  return messages.find(item =>
    String(item.id) ===
    String(id)
  ) || null

}


// ================================
// 更新留言
// ================================

function updateMessage(id, updater) {

  const messages =
    getMessages()


  const index =
    messages.findIndex(item =>
      String(item.id) ===
      String(id)
    )


  if (index === -1) {
    return null
  }


  const oldMessage =
    messages[index]


  const newMessage =
    typeof updater === 'function'
      ? updater({
          ...oldMessage
        })
      : {
          ...oldMessage,
          ...updater
        }


  messages[index] =
    normalizeMessage(
      newMessage
    )


  saveMessages(
    messages
  )


  return messages[index]

}


// ================================
// 删除留言
// ================================

function deleteMessage(id) {

  const messages =
    getMessages()


  const result =
    messages.filter(item =>
      String(item.id) !==
      String(id)
    )


  saveMessages(
    result
  )


  // 同时从“我的留言”删除
  const myMessages =
    wx.getStorageSync(
      'myMessages'
    ) || []


  if (
    Array.isArray(myMessages)
  ) {

    const newMyMessages =
      myMessages.filter(item =>
        String(item.id) !==
        String(id)
      )


    wx.setStorageSync(
      'myMessages',
      newMyMessages
    )

  }


  return result

}


// ================================
// 从后端获取留言
// ================================

function fetchMessagesFromServer(options = {}) {

  return new Promise((resolve, reject) => {

    const {
      keyword = '',
      sort = 'hot'
    } = options

    wx.request({

      url: 'http://192.168.254.145:3000/api/messages',

      method: 'GET',

      data: {
        keyword,
        sort
      },

      success(res) {

        if (
          res.statusCode !== 200 ||
          !res.data ||
          res.data.code !== 0
        ) {

          reject(
            new Error(
              res.data && res.data.message
                ? res.data.message
                : '获取留言失败'
            )
          )

          return

        }

        const serverMessages =
          Array.isArray(res.data.data)
            ? res.data.data
            : []


        const normalized =
          serverMessages.map(item =>
            normalizeMessage({

              ...item,

              id: item.id,

              name:
                item.nickname ||
                item.name ||
                '食客',

              userName:
                item.nickname ||
                item.userName ||
                '食客',

              avatar:
                item.avatar || '',

              text:
                item.content ||
                item.text ||
                '',

              images:
                item.images || [],

              likes:
                Number(
                  item.like_count ||
                  item.likes ||
                  0
                ),

              commentsCount:
                Number(
                  item.comment_count ||
                  item.commentsCount ||
                  0
                ),

              comments:
                Number(
                  item.comment_count ||
                  item.comments ||
                  0
                ),

              time:
                item.created_at ||
                item.time ||
                '',

              createTime:
                item.created_at ||
                item.createTime ||
                '',

              status:
                item.status ||
                'normal'

            })
          )


        resolve(normalized)

      },

      fail(error) {

        reject(error)

      }

    })

  })

}


// ================================
// 导出
// ================================

module.exports = {

  normalizeMessage,

  getMessages,

  getMyMessages,

  saveMessages,

  addMessage,

  getMessageById,

  updateMessage,

  deleteMessage,

  fetchMessagesFromServer

}