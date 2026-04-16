import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { connectDB, disconnectDB, clearDB } from '../helper.js'
import WorkoutPlan from '../../models/WorkoutPlan.js'
import WeekPlan from '../../models/WeekPlan.js'
import app from '../../app.js'

let token

beforeAll(async () => {
  await connectDB()
})

afterAll(async () => {
  await disconnectDB()
})

beforeEach(async () => {
  await clearDB()
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'user@test.com', password: '123456' })
  token = res.body.token

  // 创建模板训练计划
  await WorkoutPlan.create({
    id: 'plan_001',
    name: '全身燃脂训练',
    type: 'HIIT',
    duration: 35,
    calories: 320,
    difficulty: '中等难度',
    goal: '增肌',
    exercises: [
      { name: '深蹲', description: '标准深蹲', sets: 4, reps: 12, unit: '次', rest: 15 }
    ]
  })

  // 创建模板周计划（user: null）
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  for (let i = 0; i < 7; i++) {
    await WeekPlan.create({
      user: null,
      dayOrder: i,
      day: days[i],
      name: i % 3 === 2 ? '休息日' : `训练日${i + 1}`,
      duration: i % 3 === 2 ? '' : '45分钟',
      tags: i % 3 === 2 ? ['休息'] : ['训练'],
      planId: i % 3 === 2 ? null : 'plan_001',
      goal: '增肌',
      isRest: i % 3 === 2
    })
  }
})

describe('GET /api/plans', () => {
  it('应返回所有训练计划', async () => {
    const res = await request(app)
      .get('/api/plans')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.length).toBe(1)
    expect(res.body[0].id).toBe('plan_001')
  })

  it('应按 goal 筛选', async () => {
    // 添加不同目标的计划
    await WorkoutPlan.create({
      id: 'plan_002',
      name: '减脂训练',
      type: '有氧',
      duration: 30,
      calories: 250,
      difficulty: '简单',
      goal: '减脂',
      exercises: []
    })

    const res = await request(app)
      .get('/api/plans?goal=减脂')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].goal).toBe('减脂')
  })

  it('应拒绝无 token', async () => {
    const res = await request(app).get('/api/plans')
    expect(res.status).toBe(401)
  })
})

describe('GET /api/plans/:id', () => {
  it('应返回指定计划', async () => {
    const res = await request(app)
      .get('/api/plans/plan_001')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.name).toBe('全身燃脂训练')
  })

  it('应返回 404 对不存在的计划', async () => {
    const res = await request(app)
      .get('/api/plans/not_exist')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
  })
})

describe('GET /api/plans/week-plan/list', () => {
  it('应懒初始化并返回用户周计划', async () => {
    const res = await request(app)
      .get('/api/plans/week-plan/list?goal=增肌')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(7)
    // 验证模板被复制为用户副本
    const allUserPlans = await WeekPlan.find({ goal: '增肌' })
    expect(allUserPlans.length).toBe(14) // 7 template + 7 user copy
  })

  it('应包含动态标签（今天/明天/后天）', async () => {
    const res = await request(app)
      .get('/api/plans/week-plan/list?goal=增肌')
      .set('Authorization', `Bearer ${token}`)

    const labels = res.body.map(p => p.label)
    expect(labels).toContain('今天')
    expect(labels).toContain('明天')
    expect(labels).toContain('后天')
  })

  it('应拒绝缺少 goal 参数', async () => {
    const res = await request(app)
      .get('/api/plans/week-plan/list')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(400)
  })
})

describe('PUT /api/plans/week-plan/:dayOrder', () => {
  beforeEach(async () => {
    // 确保用户周计划已初始化
    await request(app)
      .get('/api/plans/week-plan/list?goal=增肌')
      .set('Authorization', `Bearer ${token}`)
  })

  it('应更新指定日的周计划', async () => {
    const res = await request(app)
      .put('/api/plans/week-plan/0?goal=增肌')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '胸肌训练', duration: '50分钟' })

    expect(res.status).toBe(200)
    expect(res.body.name).toBe('胸肌训练')
    expect(res.body.duration).toBe('50分钟')
  })

  it('应更新 isRest 状态', async () => {
    const res = await request(app)
      .put('/api/plans/week-plan/0?goal=增肌')
      .set('Authorization', `Bearer ${token}`)
      .send({ isRest: true })

    expect(res.status).toBe(200)
    expect(res.body.isRest).toBe(true)
  })

  it('应拒绝无效的 dayOrder', async () => {
    const res = await request(app)
      .put('/api/plans/week-plan/7?goal=增肌')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '测试' })

    expect(res.status).toBe(400)
  })

  it('应拒绝缺少 goal 参数', async () => {
    const res = await request(app)
      .put('/api/plans/week-plan/0')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '测试' })

    expect(res.status).toBe(400)
  })
})
