import WorkoutRecord from '../models/WorkoutRecord.js'

/**
 * 计算用户连续打卡天数（从今天/昨天往前数连续天数）
 */
export async function calculateStreak(userId) {
  const records = await WorkoutRecord.find({ user: userId, completed: true })
    .sort({ date: -1 })
    .select('date')
    .lean()

  if (!records.length) return 0

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  // 连续天数必须从今天或昨天开始
  if (records[0].date !== today && records[0].date !== yesterday) return 0

  let streak = 1
  for (let i = 0; i < records.length - 1; i++) {
    const curr = new Date(records[i].date)
    const next = new Date(records[i + 1].date)
    const diff = Math.round((curr - next) / 86400000)
    if (diff === 1) {
      streak++
    } else {
      break
    }
  }

  return streak
}

/**
 * 检查并解锁成就
 */
export function checkAchievements(user) {
  const updates = []
  const total = user.totalWorkouts
  const streak = user.streak

  // id:1 "初次打卡"
  if (total >= 1 && !user.achievements.find(a => a.id === 1)?.unlocked) {
    updates.push(1)
  }
  // id:2 "连续7天"
  if (streak >= 7 && !user.achievements.find(a => a.id === 2)?.unlocked) {
    updates.push(2)
  }
  // id:3 "累计10次"
  if (total >= 10 && !user.achievements.find(a => a.id === 3)?.unlocked) {
    updates.push(3)
  }
  // id:4 "连续30天"
  if (streak >= 30 && !user.achievements.find(a => a.id === 4)?.unlocked) {
    updates.push(4)
  }

  for (const id of updates) {
    const ach = user.achievements.find(a => a.id === id)
    if (ach) ach.unlocked = true
  }

  return updates
}
