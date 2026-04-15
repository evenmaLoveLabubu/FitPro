import jwt from 'jsonwebtoken'
import { config } from '../config/index.js'

export function generateTokens(userId) {
  const token = jwt.sign({ userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  })
  const refreshToken = jwt.sign({ userId }, config.jwtSecret, {
    expiresIn: config.refreshTokenExpiresIn
  })
  return { token, refreshToken }
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: '未登录，请先登录' })
  }

  const token = header.split(' ')[1]
  try {
    const decoded = jwt.verify(token, config.jwtSecret)
    req.userId = decoded.userId
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token 已过期', code: 'TOKEN_EXPIRED' })
    }
    return res.status(401).json({ message: 'Token 无效' })
  }
}
