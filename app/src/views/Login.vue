<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <img src="../assets/images/dumbbell.png" class="login-logo" alt="logo" />
        <h1 class="login-title">FitTrack</h1>
        <p class="login-subtitle">记录每一次突破</p>
      </div>

      <div v-if="error" class="login-error">{{ error }}</div>

      <div class="form-group">
        <label class="form-label">邮箱</label>
        <input
          v-model="email"
          type="email"
          class="form-input"
          placeholder="请输入邮箱"
          @keyup.enter="handleSubmit"
        />
      </div>

      <div class="form-group">
        <label class="form-label">密码</label>
        <input
          v-model="password"
          type="password"
          class="form-input"
          placeholder="请输入密码"
          @keyup.enter="handleSubmit"
        />
      </div>

      <div v-if="isRegister" class="form-group">
        <label class="form-label">昵称</label>
        <input
          v-model="nickname"
          type="text"
          class="form-input"
          placeholder="请输入昵称（可选）"
          @keyup.enter="handleSubmit"
        />
      </div>

      <button class="login-btn" :disabled="loading" @click="handleSubmit">
        {{ loading ? '请稍候...' : (isRegister ? '注册' : '登录') }}
      </button>

      <p class="switch-mode">
        {{ isRegister ? '已有账号？' : '没有账号？' }}
        <span class="switch-link" @click="isRegister = !isRegister; error = ''">
          {{ isRegister ? '去登录' : '去注册' }}
        </span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../utils/api.js'

const router = useRouter()
const email = ref('')
const password = ref('')
const nickname = ref('')
const isRegister = ref(false)
const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  error.value = ''

  if (!email.value || !password.value) {
    error.value = '请输入邮箱和密码'
    return
  }

  loading.value = true
  try {
    if (isRegister.value) {
      await auth.register(email.value, password.value, nickname.value || undefined)
    } else {
      await auth.login(email.value, password.value)
    }
    router.replace('/')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #0a0a0a;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 380px;
  background: #141414;
  border-radius: 24px;
  padding: 40px 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.login-logo {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.login-title {
  font-size: 28px;
  font-weight: 800;
  color: #fff;
  margin: 0;
  font-family: 'Inter', sans-serif;
}

.login-subtitle {
  font-size: 14px;
  color: #606060;
  margin: 0;
}

.login-error {
  padding: 12px;
  background: rgba(255, 80, 80, 0.1);
  border: 1px solid rgba(255, 80, 80, 0.2);
  border-radius: 12px;
  color: #ff5050;
  font-size: 13px;
  margin: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: #a0a0a0;
}

.form-input {
  height: 48px;
  padding: 0 16px;
  border-radius: 14px;
  border: 1px solid #2a2a2a;
  background: #1a1a1a;
  color: #fff;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #39ff14;
}

.form-input::placeholder {
  color: #404040;
}

.login-btn {
  width: 100%;
  height: 52px;
  border-radius: 14px;
  border: none;
  background: linear-gradient(90deg, #39ff14, #00c853);
  color: #0a0a0a;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
  font-family: 'Inter', sans-serif;
}

.login-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-btn:active:not(:disabled) {
  opacity: 0.8;
}

.switch-mode {
  text-align: center;
  font-size: 13px;
  color: #606060;
  margin: 0;
}

.switch-link {
  color: #39ff14;
  font-weight: 600;
  cursor: pointer;
}
</style>
