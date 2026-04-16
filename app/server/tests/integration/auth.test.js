import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { connectDB, disconnectDB, clearDB } from '../helper.js'
import app from '../../app.js'

beforeAll(async () => {
  await connectDB()
})

afterAll(async () => {
  await disconnectDB()
})

beforeEach(async () => {
  await clearDB()
})

describe('POST /api/auth/register', () => {
  it('应成功注册新用户并返回 token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: '123456', nickname: '测试用户' })

    expect(res.status).toBe(201)
    expect(res.body.token).toBeDefined()
    expect(res.body.refreshToken).toBeDefined()
    expect(res.body.user.email).toBe('test@example.com')
    expect(res.body.user.nickname).toBe('测试用户')
    expect(res.body.user.password).toBeUndefined()
  })

  it('应拒绝重复邮箱注册', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: '123456' })

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: '654321' })

    expect(res.status).toBe(409)
    expect(res.body.message).toContain('已注册')
  })

  it('应拒绝缺少邮箱或密码', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: '' })

    expect(res.status).toBe(400)
  })

  it('应使用默认昵称', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: '123456' })

    expect(res.body.user.nickname).toBe('健身达人')
  })

  it('新用户应有默认成就列表', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: '123456' })

    expect(res.body.user.achievements).toHaveLength(4)
    expect(res.body.user.achievements[0].unlocked).toBe(false)
  })
})

describe('POST /api/auth/login', () => {
  it('应成功登录并返回 token', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: '123456' })

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: '123456' })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    expect(res.body.user.email).toBe('test@example.com')
  })

  it('应拒绝错误密码', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: '123456' })

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrong' })

    expect(res.status).toBe(401)
  })

  it('应拒绝不存在的用户', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'notexist@example.com', password: '123456' })

    expect(res.status).toBe(401)
  })

  it('应拒绝缺少参数', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({})

    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/refresh', () => {
  it('应使用有效 refreshToken 刷新 token', async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: '123456' })

    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: registerRes.body.refreshToken })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    expect(res.body.refreshToken).toBeDefined()
  })

  it('应拒绝无效 refreshToken', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'invalid-token' })

    expect(res.status).toBe(401)
  })

  it('应拒绝缺少 refreshToken', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({})

    expect(res.status).toBe(400)
  })
})
