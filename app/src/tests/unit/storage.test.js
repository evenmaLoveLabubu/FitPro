import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock localStorage
const store = {}
const localStorageMock = {
  getItem: vi.fn((key) => store[key] || null),
  setItem: vi.fn((key, val) => { store[key] = String(val) }),
  removeItem: vi.fn((key) => { delete store[key] }),
  clear: vi.fn(() => { for (const k in store) delete store[k] })
}
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

// Mock api 模块
vi.mock('../../utils/api.js', () => ({
  isLoggedIn: vi.fn(() => !!store.sports_token),
  logout: vi.fn(() => {
    delete store.sports_token
    delete store.sports_refresh_token
  }),
  auth: { register: vi.fn(), login: vi.fn() },
  users: { getMe: vi.fn(), updateMe: vi.fn() },
  plans: { getAll: vi.fn(), getById: vi.fn(), getWeekPlan: vi.fn(), updateWeekPlanDay: vi.fn() },
  records: { getAll: vi.fn(), create: vi.fn(), getWeekly: vi.fn() },
  checkin: { getToday: vi.fn(), doCheckin: vi.fn() },
  exercises: { getAll: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() }
}))

import { getUser, saveUser, getRecords, addRecord, getTodayRecord, isTodayCompleted, initUser } from '../../utils/storage.js'
import * as api from '../../utils/api.js'

describe('Storage 层', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('getUser', () => {
    it('API 成功时应返回用户数据', async () => {
      const mockUser = { nickname: '测试', goal: '减脂' }
      api.users.getMe.mockResolvedValue(mockUser)

      const user = await getUser()
      expect(user).toEqual(mockUser)
    })

    it('API 失败时应返回缓存', async () => {
      const cachedUser = { nickname: '测试', goal: '减脂' }

      // 先成功调用，建立缓存
      api.users.getMe.mockResolvedValue(cachedUser)
      const first = await getUser()
      expect(first).toEqual(cachedUser)

      // 第二次 API 失败，应降级到缓存
      api.users.getMe.mockRejectedValue(new Error('fail'))
      const second = await getUser()
      expect(second).toEqual(cachedUser)
    })
  })

  describe('saveUser', () => {
    it('应调用 API 更新用户', async () => {
      api.users.updateMe.mockResolvedValue({})

      await saveUser({ nickname: '新名字', avatar: '', goal: '增肌' })

      expect(api.users.updateMe).toHaveBeenCalledWith({
        nickname: '新名字',
        avatar: '',
        goal: '增肌'
      })
    })
  })

  describe('getRecords', () => {
    it('API 成功时应返回记录列表', async () => {
      const mockRecords = [{ planName: '训练A' }]
      api.records.getAll.mockResolvedValue(mockRecords)

      const records = await getRecords()
      expect(records).toEqual(mockRecords)
    })
  })

  describe('addRecord', () => {
    it('应调用 API 创建记录并返回结果', async () => {
      const mockResult = {
        record: { planName: '训练', duration: 600 },
        user: { totalWorkouts: 1 },
        checkIn: { completed: true }
      }
      api.records.create.mockResolvedValue(mockResult)

      const result = await addRecord({ planName: '训练', duration: 600 })
      expect(api.records.create).toHaveBeenCalledWith({ planName: '训练', duration: 600 })
      expect(result.record.planName).toBe('训练')
    })
  })

  describe('getTodayRecord', () => {
    it('API 成功时应返回今日记录', async () => {
      const mockToday = { completed: false, checkedIn: false }
      api.checkin.getToday.mockResolvedValue(mockToday)

      const record = await getTodayRecord()
      expect(record).toEqual(mockToday)
    })
  })

  describe('isTodayCompleted', () => {
    it('今日已完成时应返回 true', async () => {
      api.checkin.getToday.mockResolvedValue({ completed: true })

      expect(await isTodayCompleted()).toBe(true)
    })

    it('今日未完成时应返回 false', async () => {
      api.checkin.getToday.mockResolvedValue({ completed: false, checkedIn: false })

      expect(await isTodayCompleted()).toBe(false)
    })
  })

  describe('initUser', () => {
    it('已登录时应从 API 获取用户', async () => {
      api.isLoggedIn.mockReturnValue(true)
      const mockUser = { nickname: '已登录' }
      api.users.getMe.mockResolvedValue(mockUser)

      const user = await initUser()
      expect(user).toEqual(mockUser)
    })

    it('未登录时应返回默认用户', async () => {
      api.isLoggedIn.mockReturnValue(false)

      const user = await initUser()
      expect(user).toBeDefined()
      expect(user.nickname).toBe('健身达人')
    })
  })
})
