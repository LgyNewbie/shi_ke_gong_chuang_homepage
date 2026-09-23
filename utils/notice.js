function normalizeNotice(item = {}) {
  return {
    id: item.id || `notice_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    title: item.title || '餐厅公告',
    content: item.content || '',
    time: item.time || item.createTime || '刚刚',
    createTime: item.createTime || item.time || '刚刚',
    author: item.author || '餐厅官方',
    type: item.type || '公告'
  }
}

function getDefaultNotices() {
  return [
    normalizeNotice({
      id: 'notice_1',
      title: '本周新品上线',
      content: '本周推出两款季节限定新品，欢迎大家前来品尝，也欢迎在食客留言区分享你的体验。',
      time: '2026-09-22',
      createTime: '2026-09-22',
      author: '餐厅官方',
      type: '新品'
    }),
    normalizeNotice({
      id: 'notice_2',
      title: '营业时间调整通知',
      content: '为了给大家提供更好的用餐体验，本周末营业时间调整为 10:30 - 22:00。',
      time: '2026-09-20',
      createTime: '2026-09-20',
      author: '餐厅官方',
      type: '通知'
    }),
    normalizeNotice({
      id: 'notice_3',
      title: '欢迎参与本周投票',
      content: '本周投票已经开启，欢迎大家为下一款新品提供意见。',
      time: '2026-09-18',
      createTime: '2026-09-18',
      author: '餐厅官方',
      type: '活动'
    })
  ]
}

function getNotices() {
  let notices = wx.getStorageSync('notices')

  if (!Array.isArray(notices)) {
    notices = getDefaultNotices()
    wx.setStorageSync('notices', notices)
  }

  return notices.map(normalizeNotice)
}

function saveNotices(notices = []) {
  const normalized = notices.map(normalizeNotice)
  wx.setStorageSync('notices', normalized)
  return normalized
}

function addNotice(notice) {
  const notices = getNotices()
  const newNotice = normalizeNotice(notice)

  notices.unshift(newNotice)
  saveNotices(notices)

  return newNotice
}

function getNoticeById(id) {
  return getNotices().find(
    item => String(item.id) === String(id)
  ) || null
}

function deleteNotice(id) {
  const notices = getNotices()

  const result = notices.filter(
    item => String(item.id) !== String(id)
  )

  saveNotices(result)

  return result
}

module.exports = {
  normalizeNotice,
  getDefaultNotices,
  getNotices,
  saveNotices,
  addNotice,
  getNoticeById,
  deleteNotice
}