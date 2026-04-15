// API 客户端 — 统一 HTTP 请求 + JWT 自动刷新
const BASE_URL = '/api'

function getToken() {
  return localStorage.getItem('sports_token')
}

function getRefreshToken() {
  return localStorage.getItem('sports_refresh_token')
}

function setTokens(access, refresh) {
  localStorage.setItem('sports_token', access)
  localStorage.setItem('sports_refresh_token', refresh)
}

function clearTokens() {
  localStorage.removeItem('sports_token')
  localStorage.removeItem('sports_refresh_token')
}

export function isLoggedIn() {
  return !!getToken()
}

export function logout() {
  clearTokens()
}

async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const options = { method, headers }
  if (body) options.body = JSON.stringify(body)

  let res = await fetch(`${BASE_URL}${path}`, options)

  // Token 过期，尝试刷新
  if (res.status === 401 && path !== '/auth/login' && path !== '/auth/register') {
    const refreshed = await tryRefresh()
    if (refreshed) {
      headers['Authorization'] = `Bearer ${getToken()}`
      options.headers = headers
      res = await fetch(`${BASE_URL}${path}`, options)
    } else {
      clearTokens()
      window.location.href = '/login'
      throw new Error('登录已过期，请重新登录')
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: '请求失败' }))
    throw new Error(err.message || '请求失败')
  }

  return res.json()
}

async function tryRefresh() {
  try {
    const refreshToken = getRefreshToken()
    if (!refreshToken) return false
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    })
    if (!res.ok) return false
    const data = await res.json()
    setTokens(data.token, data.refreshToken)
    return true
  } catch {
    return false
  }
}

// ---- 认证 ----
export const auth = {
  async register(email, password, nickname) {
    const data = await request('POST', '/auth/register', { email, password, nickname })
    setTokens(data.token, data.refreshToken)
    return data.user
  },
  async login(email, password) {
    const data = await request('POST', '/auth/login', { email, password })
    setTokens(data.token, data.refreshToken)
    return data.user
  }
}

// ---- 用户 ----
export const users = {
  getMe: () => request('GET', '/users/me'),
  updateMe: (updates) => request('PATCH', '/users/me', updates)
}

// ---- 训练计划 ----
export const plans = {
  getAll: (goal) => {
    const query = goal ? `?goal=${encodeURIComponent(goal)}` : ''
    return request('GET', `/plans${query}`)
  },
  getById: (id) => request('GET', `/plans/${id}`),
  getWeekPlan: (goal) => {
    const query = goal ? `?goal=${encodeURIComponent(goal)}` : ''
    return request('GET', `/plans/week-plan/list${query}`)
  },
  updateWeekPlanDay: (dayOrder, goal, updates) => {
    const query = goal ? `?goal=${encodeURIComponent(goal)}` : ''
    return request('PUT', `/plans/week-plan/${dayOrder}${query}`, updates)
  }
}

// ---- 训练记录 ----
export const records = {
  getAll: (limit = 50) => request('GET', `/records?limit=${limit}`),
  create: (record) => request('POST', '/records', record),
  getWeekly: () => request('GET', '/records/weekly')
}

// ---- 打卡 ----
export const checkin = {
  getToday: () => request('GET', '/checkin/today'),
  doCheckin: () => request('POST', '/checkin/today', { checkedIn: true })
}

// ---- 动作库 ----
export const exercises = {
  getAll: (category) => {
    const query = category ? `?category=${encodeURIComponent(category)}` : ''
    return request('GET', `/exercises${query}`)
  },
  create: (data) => request('POST', '/exercises', data),
  update: (id, data) => request('PUT', `/exercises/${id}`, data),
  remove: (id) => request('DELETE', `/exercises/${id}`)
}
