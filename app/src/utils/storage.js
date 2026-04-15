// storage.js — 兼容层，将原有 localStorage 接口替换为 API 调用
// 所有函数改为 async，保持原有函数名和返回格式
import * as api from './api.js'
import { isLoggedIn } from './api.js'
import { defaultUser } from '../data/mock.js'

// 缓存：用于乐观读取
let _userCache = null
let _recordsCache = null
let _todayCache = null

// 用户数据
export async function getUser() {
  try {
    const user = await api.users.getMe()
    _userCache = user
    return user
  } catch {
    return _userCache || null
  }
}

export async function saveUser(user) {
  _userCache = user
  try {
    await api.users.updateMe({
      nickname: user.nickname,
      avatar: user.avatar,
      goal: user.goal
    })
  } catch (err) {
    console.error('saveUser failed:', err.message)
  }
}

// 训练记录
export async function getRecords() {
  try {
    _recordsCache = await api.records.getAll(50)
    return _recordsCache
  } catch {
    return _recordsCache || []
  }
}

export async function addRecord(record) {
  const result = await api.records.create(record)
  _recordsCache = [result.record, ...(_recordsCache || [])]
  _userCache = result.user
  _todayCache = result.checkIn
  return result
}

// 今日训练状态
export async function getTodayRecord() {
  try {
    _todayCache = await api.checkin.getToday()
    return _todayCache
  } catch {
    return _todayCache || {}
  }
}

export async function setTodayRecord(record) {
  // 不再需要，addRecord 原子操作已包含
  _todayCache = { ...record, date: new Date().toISOString().split('T')[0] }
}

export async function isTodayCompleted() {
  const record = await getTodayRecord()
  return record && (record.completed || record.checkedIn)
}

// 更新连续打卡天数（服务端已自动计算）
export async function updateStreak() {
  const user = await getUser()
  return user
}

// 初始化：已登录则从服务端获取，否则返回默认值
export async function initUser() {
  if (isLoggedIn()) {
    return getUser()
  }
  return defaultUser
}
