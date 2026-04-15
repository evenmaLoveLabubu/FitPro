import { Router } from 'express'
import User from '../models/User.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

// GET /api/users/me
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ message: '用户不存在' })
    }
    res.json(user)
  } catch (err) {
    next(err)
  }
})

// PATCH /api/users/me
router.patch('/me', authMiddleware, async (req, res, next) => {
  try {
    const { nickname, avatar, phone, birthday, goal } = req.body
    const updates = {}
    if (nickname !== undefined) updates.nickname = nickname
    if (avatar !== undefined) updates.avatar = avatar
    if (phone !== undefined) updates.phone = phone
    if (birthday !== undefined) updates.birthday = birthday
    if (goal !== undefined) updates.goal = goal

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    )
    if (!user) {
      return res.status(404).json({ message: '用户不存在' })
    }
    res.json(user)
  } catch (err) {
    next(err)
  }
})

export default router
