import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
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
  // 创建测试用户并获取 token
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'user@test.com', password: '123456', nickname: '测试' })
  token = res.body.token
})

describe('GET /api/users/me', () => {
  it('应返回当前用户信息', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.email).toBe('user@test.com')
    expect(res.body.nickname).toBe('测试')
    expect(res.body.password).toBeUndefined()
  })

  it('应拒绝无 token 请求', async () => {
    const res = await request(app)
      .get('/api/users/me')

    expect(res.status).toBe(401)
  })

  it('应拒绝无效 token', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', 'Bearer invalid-token')

    expect(res.status).toBe(401)
  })
})

describe('PATCH /api/users/me', () => {
  it('应更新用户昵称', async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ nickname: '新昵称' })

    expect(res.status).toBe(200)
    expect(res.body.nickname).toBe('新昵称')
  })

  it('应更新用户目标', async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ goal: '增肌' })

    expect(res.status).toBe(200)
    expect(res.body.goal).toBe('增肌')
  })

  it('应同时更新多个字段', async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ nickname: '肌肉男', goal: '增肌', phone: '13800138000' })

    expect(res.status).toBe(200)
    expect(res.body.nickname).toBe('肌肉男')
    expect(res.body.goal).toBe('增肌')
    expect(res.body.phone).toBe('13800138000')
  })

  it('应拒绝无效的 goal 值', async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ goal: '无效目标' })

    expect(res.status).toBe(500)
  })
})
