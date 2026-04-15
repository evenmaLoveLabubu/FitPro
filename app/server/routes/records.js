import { Router } from 'express'
import WorkoutRecord from '../models/WorkoutRecord.js'
import CheckIn from '../models/CheckIn.js'
import User from '../models/User.js'
import { authMiddleware } from '../middleware/auth.js'
import { calculateStreak, checkAchievements } from '../utils/streak.js'

const router = Router()

// GET /api/records?limit=7
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50
    const records = await WorkoutRecord.find({ user: req.userId })
      .sort({ date: -1, timestamp: -1 })
      .limit(limit)
    res.json(records)
  } catch (err) {
    next(err)
  }
})

// GET /api/records/weekly
router.get('/weekly', authMiddleware, async (req, res, next) => {
  try {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(today)
    monday.setDate(today.getDate() + mondayOffset)

    const days = []
    const dayNames = ['一', '二', '三', '四', '五', '六', '日']

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const dateStr = d.toISOString().split('T')[0]
      days.push({ day: dayNames[i], date: dateStr, duration: 0 })
    }

    // 查询本周的记录
    const startDate = days[0].date
    const endDate = days[6].date
    const records = await WorkoutRecord.find({
      user: req.userId,
      date: { $gte: startDate, $lte: endDate },
      completed: true
    })

    // 填充每日时长
    for (const record of records) {
      const dayIndex = days.findIndex(d => d.date === record.date)
      if (dayIndex !== -1) {
        days[dayIndex].duration += record.duration
      }
    }

    res.json({ weekStart: startDate, days })
  } catch (err) {
    next(err)
  }
})

// POST /api/records — 原子操作：创建记录 + 更新用户 + 创建 CheckIn + 计算 streak
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { planId, planName, duration, exerciseCount } = req.body
    const today = new Date().toISOString().split('T')[0]

    // 1. 创建训练记录
    const record = await WorkoutRecord.create({
      user: req.userId,
      date: today,
      planId,
      planName,
      duration,
      completed: true,
      exerciseCount,
      timestamp: Date.now()
    })

    // 2. 创建/更新 CheckIn
    let checkIn = await CheckIn.findOne({ user: req.userId, date: today })
    if (checkIn) {
      checkIn.planId = planId
      checkIn.planName = planName
      checkIn.duration = duration
      checkIn.completed = true
      checkIn.exerciseCount = exerciseCount
      await checkIn.save()
    } else {
      checkIn = await CheckIn.create({
        user: req.userId,
        date: today,
        checkedIn: false,
        planId,
        planName,
        duration,
        completed: true,
        exerciseCount
      })
    }

    // 3. 更新用户统计
    const user = await User.findById(req.userId)
    user.totalWorkouts += 1
    user.totalMinutes += Math.round(duration / 60)

    // 4. 重算 streak
    user.streak = await calculateStreak(req.userId)

    // 5. 检查成就
    const newlyUnlocked = checkAchievements(user)
    await user.save()

    res.status(201).json({ record, user, checkIn, newlyUnlocked })
  } catch (err) {
    next(err)
  }
})

export default router
