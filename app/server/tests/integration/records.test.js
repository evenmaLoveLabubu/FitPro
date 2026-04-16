import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { connectDB, disconnectDB, clearDB } from '../helper.js'
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
    .send({ email: 'user@test.com', password: '123456', nickname: '测试' })
  token = res.body.token
})

describe('POST /api/records', () => {
  it('应创建训练记录并更新用户统计', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${token}`)
      .send({
        planId: 'plan_001',
        planName: '全身燃脂训练',
        duration: 2100,
        exerciseCount: 6
      })

    expect(res.status).toBe(201)
    expect(res.body.record.planId).toBe('plan_001')
    expect(res.body.record.completed).toBe(true)
    expect(res.body.user.totalWorkouts).toBe(1)
    expect(res.body.user.totalMinutes).toBe(35) // 2100/60
    expect(res.body.checkIn).toBeDefined()
  })

  it('应自动创建 CheckIn', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${token}`)
      .send({
        planId: 'plan_001',
        planName: '训练',
        duration: 600,
        exerciseCount: 3
      })

    expect(res.status).toBe(201)
    expect(res.body.checkIn.completed).toBe(true)
  })

  it('首次训练应解锁「初次打卡」成就', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${token}`)
      .send({
        planId: 'plan_001',
        planName: '训练',
        duration: 600,
        exerciseCount: 3
      })

    expect(res.body.newlyUnlocked).toContain(1)
  })

  it('应拒绝无 token 请求', async () => {
    const res = await request(app)
      .post('/api/records')
      .send({ planId: 'plan_001', planName: '训练', duration: 600, exerciseCount: 3 })

    expect(res.status).toBe(401)
  })
})

describe('GET /api/records', () => {
  it('应返回用户的训练记录列表', async () => {
    // 先创建记录
    await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${token}`)
      .send({ planId: 'plan_001', planName: '训练A', duration: 600, exerciseCount: 3 })

    const res = await request(app)
      .get('/api/records')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].planName).toBe('训练A')
  })

  it('应支持 limit 参数', async () => {
    // 创建多条记录
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${token}`)
        .send({ planId: 'plan_001', planName: `训练${i}`, duration: 600, exerciseCount: 3 })
    }

    const res = await request(app)
      .get('/api/records?limit=3')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(3)
  })

  it('新用户应返回空列表', async () => {
    const res = await request(app)
      .get('/api/records')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(0)
  })
})

describe('GET /api/records/weekly', () => {
  it('应返回本周数据', async () => {
    const res = await request(app)
      .get('/api/records/weekly')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.weekStart).toBeDefined()
    expect(res.body.days).toHaveLength(7)
    expect(res.body.days[0].day).toBe('一')
    expect(res.body.days[6].day).toBe('日')
  })

  it('本周有记录时应包含时长', async () => {
    await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${token}`)
      .send({ planId: 'plan_001', planName: '训练', duration: 1200, exerciseCount: 4 })

    const res = await request(app)
      .get('/api/records/weekly')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    // 今天对应的 day 应有 duration
    const todayRecord = res.body.days.find(d => d.duration > 0)
    expect(todayRecord).toBeDefined()
    expect(todayRecord.duration).toBe(1200)
  })
})
