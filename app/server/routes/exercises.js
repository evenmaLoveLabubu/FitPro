import { Router } from 'express'
import Exercise from '../models/Exercise.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

// GET /api/exercises?category=胸肩
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { category } = req.query
    const filter = { $or: [{ createdBy: null }, { createdBy: req.userId }] }
    if (category) filter.$and = [{ category }]
    const exercises = await Exercise.find(filter).sort({ category: 1, name: 1 })
    res.json(exercises)
  } catch (err) {
    next(err)
  }
})

// POST /api/exercises
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { category, name, description, sets, reps, unit, rest, duration } = req.body
    if (!category || !name) {
      return res.status(400).json({ message: '分类和名称不能为空' })
    }
    const exercise = await Exercise.create({
      createdBy: req.userId,
      category,
      name,
      description: description || '',
      sets: sets ?? 3,
      reps: reps ?? 12,
      unit: unit || '次',
      rest: rest ?? 15,
      duration: duration ?? 0
    })
    res.status(201).json(exercise)
  } catch (err) {
    next(err)
  }
})

// PUT /api/exercises/:id
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const exercise = await Exercise.findOne({ _id: req.params.id, createdBy: req.userId })
    if (!exercise) {
      return res.status(404).json({ message: '动作不存在或无权修改' })
    }
    const { category, name, description, sets, reps, unit, rest, duration } = req.body
    const update = {}
    if (category !== undefined) update.category = category
    if (name !== undefined) update.name = name
    if (description !== undefined) update.description = description
    if (sets !== undefined) update.sets = sets
    if (reps !== undefined) update.reps = reps
    if (unit !== undefined) update.unit = unit
    if (rest !== undefined) update.rest = rest
    if (duration !== undefined) update.duration = duration

    const updated = await Exercise.findByIdAndUpdate(req.params.id, { $set: update }, { new: true })
    res.json(updated)
  } catch (err) {
    next(err)
  }
})

// DELETE /api/exercises/:id
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const exercise = await Exercise.findByIdAndDelete(req.params.id)
    if (!exercise) {
      return res.status(404).json({ message: '动作不存在' })
    }
    res.json({ message: '已删除' })
  } catch (err) {
    next(err)
  }
})

export default router
