import { Router } from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { generateTokens, authMiddleware } from '../middleware/auth.js'

const router = Router()

// 默认成就列表
const defaultAchievements = [
  { id: 1, name: '初次打卡', icon: 'star', unlocked: false },
  { id: 2, name: '连续7天', icon: 'flame', unlocked: false },
  { id: 3, name: '累计10次', icon: 'dumbbell', unlocked: false },
  { id: 4, name: '连续30天', icon: 'crown', unlocked: false }
]

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, nickname } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: '邮箱和密码不能为空' })
    }

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(409).json({ message: '该邮箱已注册' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({
      email,
      password: hashedPassword,
      nickname: nickname || '健身达人',
      achievements: defaultAchievements
    })

    const { token, refreshToken } = generateTokens(user._id)
    res.status(201).json({ token, refreshToken, user })
  } catch (err) {
    next(err)
  }
})

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: '邮箱和密码不能为空' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: '邮箱或密码错误' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: '邮箱或密码错误' })
    }

    const { token, refreshToken } = generateTokens(user._id)
    res.json({ token, refreshToken, user })
  } catch (err) {
    next(err)
  }
})

// POST /api/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) {
      return res.status(400).json({ message: '缺少 refreshToken' })
    }

    // 简单验证 refresh token 有效性并生成新 token
    const jwt = await import('jsonwebtoken')
    const { config } = await import('../config/index.js')

    try {
      const decoded = jwt.default.verify(refreshToken, config.jwtSecret)
      const { token } = generateTokens(decoded.userId)
      const newRefreshToken = jwt.default.sign(
        { userId: decoded.userId },
        config.jwtSecret,
        { expiresIn: config.refreshTokenExpiresIn }
      )
      res.json({ token, refreshToken: newRefreshToken })
    } catch {
      return res.status(401).json({ message: 'refreshToken 无效或已过期' })
    }
  } catch (err) {
    next(err)
  }
})

export default router
