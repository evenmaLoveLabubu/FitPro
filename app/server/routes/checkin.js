import { Router } from 'express'
import CheckIn from '../models/CheckIn.js'
import User from '../models/User.js'
import { authMiddleware } from '../middleware/auth.js'
import { calculateStreak, checkAchievements } from '../utils/streak.js'

const router = Router()

// GET /api/checkin/today
router.get('/today', authMiddleware, async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const checkIn = await CheckIn.findOne({ user: req.userId, date: today })
    if (checkIn) {
      res.json(checkIn)
    } else {
      res.json({ checkedIn: false, completed: false })
    }
  } catch (err) {
    next(err)
  }
})

// POST /api/checkin/today
router.post('/today', authMiddleware, async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0]

    // Upsert CheckIn
    let checkIn = await CheckIn.findOne({ user: req.userId, date: today })
    if (checkIn) {
      checkIn.checkedIn = true
      await checkIn.save()
    } else {
      checkIn = await CheckIn.create({
        user: req.userId,
        date: today,
        checkedIn: true
      })
    }

    // 更新 streak
    const user = await User.findById(req.userId)
    user.streak = await calculateStreak(req.userId)

    // 检查成就
    const newlyUnlocked = checkAchievements(user)
    await user.save()

    res.json({ checkIn, user, newlyUnlocked })
  } catch (err) {
    next(err)
  }
})

export default router
