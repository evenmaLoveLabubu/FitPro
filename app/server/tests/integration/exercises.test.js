import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { connectDB, disconnectDB, clearDB } from '../helper.js'
import Exercise from '../../models/Exercise.js'
import app from '../../app.js'

let token
let userId

beforeAll(async () => {
  await connectDB()
})

afterAll(async () => {
  await disconnectDB()
})

beforeEach(async () => {
  await clearDB()
  // 创建系统预置动作（createdBy: null）
  await Exercise.create([
    { createdBy: null, category: '胸肩', name: '俯卧撑', sets: 3, reps: 15 },
    { createdBy: null, category: '背部', name: '引体向上', sets: 3, reps: 10 }
  ])
  // 创建用户
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'user@test.com', password: '123456' })
  token = res.body.token
  userId = res.body.user._id || res.body.user.id
})

describe('GET /api/exercises', () => {
  it('应返回系统预置动作和用户自建动作', async () => {
    // 创建用户自建动作
    await request(app)
      .post('/api/exercises')
      .set('Authorization', `Bearer ${token}`)
      .send({ category: '腿部', name: '深蹲' })

    const res = await request(app)
      .get('/api/exercises')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.length).toBe(3) // 2 system + 1 user
  })

  it('应支持按分类筛选', async () => {
    const res = await request(app)
      .get('/api/exercises?category=胸肩')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].name).toBe('俯卧撑')
  })

  it('应拒绝无 token 请求', async () => {
    const res = await request(app)
      .get('/api/exercises')

    expect(res.status).toBe(401)
  })
})

describe('POST /api/exercises', () => {
  it('应创建用户自建动作', async () => {
    const res = await request(app)
      .post('/api/exercises')
      .set('Authorization', `Bearer ${token}`)
      .send({
        category: '手臂',
        name: '弯举',
        description: '二头弯举',
        sets: 4,
        reps: 12,
        unit: '次',
        rest: 30
      })

    expect(res.status).toBe(201)
    expect(res.body.name).toBe('弯举')
    expect(res.body.category).toBe('手臂')
    expect(res.body.sets).toBe(4)
  })

  it('应使用默认值', async () => {
    const res = await request(app)
      .post('/api/exercises')
      .set('Authorization', `Bearer ${token}`)
      .send({ category: '核心', name: '平板支撑' })

    expect(res.status).toBe(201)
    expect(res.body.sets).toBe(3)
    expect(res.body.reps).toBe(12)
    expect(res.body.unit).toBe('次')
    expect(res.body.rest).toBe(15)
  })

  it('应拒绝缺少必填字段', async () => {
    const res = await request(app)
      .post('/api/exercises')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '测试' })

    expect(res.status).toBe(400)
  })
})

describe('PUT /api/exercises/:id', () => {
  it('应更新用户自建动作', async () => {
    const created = await request(app)
      .post('/api/exercises')
      .set('Authorization', `Bearer ${token}`)
      .send({ category: '手臂', name: '弯举' })

    const res = await request(app)
      .put(`/api/exercises/${created.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '锤式弯举', sets: 4 })

    expect(res.status).toBe(200)
    expect(res.body.name).toBe('锤式弯举')
    expect(res.body.sets).toBe(4)
  })

  it('不应更新不属于自己的动作', async () => {
    // 创建第二个用户
    const user2Res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'user2@test.com', password: '123456' })

    // 用户1创建动作
    const created = await request(app)
      .post('/api/exercises')
      .set('Authorization', `Bearer ${token}`)
      .send({ category: '手臂', name: '弯举' })

    // 用户2尝试修改
    const res = await request(app)
      .put(`/api/exercises/${created.body._id}`)
      .set('Authorization', `Bearer ${user2Res.body.token}`)
      .send({ name: '被篡改' })

    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/exercises/:id', () => {
  it('应删除用户自建动作', async () => {
    const created = await request(app)
      .post('/api/exercises')
      .set('Authorization', `Bearer ${token}`)
      .send({ category: '手臂', name: '弯举' })

    const res = await request(app)
      .delete(`/api/exercises/${created.body._id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.message).toBe('已删除')
  })

  it('删除后列表中不再出现', async () => {
    const created = await request(app)
      .post('/api/exercises')
      .set('Authorization', `Bearer ${token}`)
      .send({ category: '手臂', name: '弯举' })

    await request(app)
      .delete(`/api/exercises/${created.body._id}`)
      .set('Authorization', `Bearer ${token}`)

    const list = await request(app)
      .get('/api/exercises')
      .set('Authorization', `Bearer ${token}`)

    // 只有 2 个系统预置动作
    expect(list.body).toHaveLength(2)
  })

  it('应拒绝删除不存在的动作', async () => {
    const fakeId = '507f1f77bcf86cd799439011'
    const res = await request(app)
      .delete(`/api/exercises/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
  })
})
