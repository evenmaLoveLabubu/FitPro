import { Router } from 'express'
import WorkoutPlan from '../models/WorkoutPlan.js'
import WeekPlan from '../models/WeekPlan.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

// GET /api/plans?goal=增肌
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { goal } = req.query
    const filter = {}
    if (goal) filter.goal = goal
    const plans = await WorkoutPlan.find(filter)
    res.json(plans)
  } catch (err) {
    next(err)
  }
})

// GET /api/plans/:id
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const plan = await WorkoutPlan.findOne({ id: req.params.id })
    if (!plan) {
      return res.status(404).json({ message: '训练计划不存在' })
    }
    res.json(plan)
  } catch (err) {
    next(err)
  }
})

// GET /api/plans/week-plan/list?goal=增肌
router.get('/week-plan/list', authMiddleware, async (req, res, next) => {
  try {
    const { goal } = req.query
    if (!goal) return res.status(400).json({ message: '缺少 goal 参数' })

    // 确保用户有自己的周计划副本（懒初始化）
    const existing = await WeekPlan.findOne({ user: req.userId, goal })
    if (!existing) {
      const templates = await WeekPlan.find({ user: null, goal }).sort({ dayOrder: 1 })
      if (templates.length) {
        const docs = templates.map(t => ({
          user: req.userId,
          dayOrder: t.dayOrder,
          day: t.day,
          name: t.name,
          duration: t.duration,
          tags: [...t.tags],
          planId: t.planId,
          goal: t.goal,
          isRest: t.isRest
        }))
        await WeekPlan.insertMany(docs)
      }
    }

    const plans = await WeekPlan.find({ user: req.userId, goal }).sort({ dayOrder: 1 })

    // 动态标签（今天/明天/后天）
    const today = new Date().getDay()
    const todayIdx = today === 0 ? 6 : today - 1

    const result = plans.map((p, i) => {
      const item = p.toObject()
      if (i === todayIdx) {
        item.label = '今天'
      } else if (i === (todayIdx + 1) % 7) {
        item.label = '明天'
      } else if (i === (todayIdx + 2) % 7) {
        item.label = '后天'
      } else {
        item.label = ''
      }
      return item
    })

    res.json(result)
  } catch (err) {
    next(err)
  }
})

// PUT /api/plans/week-plan/:dayOrder?goal=增肌
router.put('/week-plan/:dayOrder', authMiddleware, async (req, res, next) => {
  try {
    const { goal } = req.query
    if (!goal) return res.status(400).json({ message: '缺少 goal 参数' })

    const dayOrder = parseInt(req.params.dayOrder, 10)
    if (isNaN(dayOrder) || dayOrder < 0 || dayOrder > 6) {
      return res.status(400).json({ message: '无效的 dayOrder' })
    }

    const { isRest, planId, name, duration, tags } = req.body
    const update = {}
    if (isRest !== undefined) update.isRest = isRest
    if (planId !== undefined) update.planId = planId || null
    if (name !== undefined) update.name = name
    if (duration !== undefined) update.duration = duration
    if (tags !== undefined) update.tags = tags

    const plan = await WeekPlan.findOneAndUpdate(
      { user: req.userId, goal, dayOrder },
      { $set: update },
      { new: true }
    )

    if (!plan) {
      return res.status(404).json({ message: '周计划不存在' })
    }

    res.json(plan)
  } catch (err) {
    next(err)
  }
})

export default router
