// ================================
// 食客共创 - 留言统一数据
// ================================

function normalizeMessage(item = {}) {
  const images = Array.isArray(item.images)
    ? item.images
    : (item.image ? [item.image] : [])

  const text = item.text || item.content || ''

  const commentList = Array.isArray(item.commentList)
    ? item.commentList
    : []

  return {
    ...item,

    id: item.id || `msg_${Date.now()}`,

    name: item.name || item.userName || '食客',
    userName: item.userName || item.name || '食客',

    avatar: item.avatar || '',
    level: item.level || 1,

    tag: item.tag || item.category || '其他',
    category: item.category || item.tag || '其他',

    text: text,
    content: text,

    images: images,
    image: item.image || images[0] || '',

    likes: Number(item.likes || 0),

    commentList: commentList,

    commentsCount: commentList.length,

    comments: commentList.length,

    reply: item.reply || null,

    replyTime: item.replyTime || '',

    replyType: item.replyType || '',

    status: item.status || '',

    statusName: item.statusName || '',

    time: item.time || item.createTime || '',

    createTime: item.createTime || item.time || ''
  }
}


// ================================
// 获取全部留言
// ================================

function getMessages(defaultMessages = []) {
  let messages = wx.getStorageSync('messages')

  if (!Array.isArray(messages)) {
    messages = defaultMessages.map(item =>
      normalizeMessage(item)
    )

    wx.setStorageSync('messages', messages)
  }

  return messages.map(item =>
    normalizeMessage(item)
  )
}


// ================================
// 保存全部留言
// ================================

function saveMessages(messages = []) {
  const normalized = messages.map(item =>
    normalizeMessage(item)
  )

  // 主数据
  wx.setStorageSync('messages', normalized)

  // 同步“我的留言”
  const oldMyMessages =
    wx.getStorageSync('myMessages') || []

  if (Array.isArray(oldMyMessages)) {
    const myIds = oldMyMessages.map(item =>
      String(item.id)
    )

    const newMyMessages = normalized.filter(item =>
      myIds.includes(String(item.id))
    )

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
  const messages = getMessages()

  const newMessage =
    normalizeMessage(message)

  messages.unshift(newMessage)

  saveMessages(messages)

  // 同时保存我的留言
  const myMessages =
    wx.getStorageSync('myMessages') || []

  myMessages.unshift(newMessage)

  wx.setStorageSync(
    'myMessages',
    myMessages
  )

  return newMessage
}


// ================================
// 根据 ID 获取留言
// ================================

function getMessageById(id) {
  const messages = getMessages()

  return messages.find(item =>
    String(item.id) === String(id)
  ) || null
}


// ================================
// 更新留言
// ================================

function updateMessage(id, updater) {
  const messages = getMessages()

  const index = messages.findIndex(item =>
    String(item.id) === String(id)
  )

  if (index === -1) {
    return null
  }

  const oldMessage = messages[index]

  const newMessage =
    typeof updater === 'function'
      ? updater({ ...oldMessage })
      : {
          ...oldMessage,
          ...updater
        }

  messages[index] =
    normalizeMessage(newMessage)

  saveMessages(messages)

  return messages[index]
}


// ================================
// 删除留言
// ================================

function deleteMessage(id) {
  const messages = getMessages()

  const result =
    messages.filter(item =>
      String(item.id) !== String(id)
    )

  saveMessages(result)

  return result
}


module.exports = {
  normalizeMessage,
  getMessages,
  saveMessages,
  addMessage,
  getMessageById,
  updateMessage,
  deleteMessage
}