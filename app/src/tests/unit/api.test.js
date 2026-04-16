import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, val) => { store[key] = String(val) }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    get _store() { return store }
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

// 重新导入以使用 mock 的 localStorage
const { isLoggedIn, logout } = await import('../../utils/api.js')

describe('API 客户端 - Token 管理', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('isLoggedIn', () => {
    it('无 token 时应返回 false', () => {
      expect(isLoggedIn()).toBe(false)
    })

    it('有 token 时应返回 true', () => {
      localStorageMock.setItem('sports_token', 'test-token')
      expect(isLoggedIn()).toBe(true)
    })
  })

  describe('logout', () => {
    it('应清除 token 和 refreshToken', () => {
      localStorageMock.setItem('sports_token', 'access-token')
      localStorageMock.setItem('sports_refresh_token', 'refresh-token')

      logout()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('sports_token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('sports_refresh_token')
    })
  })
})
