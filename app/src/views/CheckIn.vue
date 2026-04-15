<template>
  <div class="page">
    <header class="status-bar">
      <span class="time">{{ currentTime }}</span>
      <div class="status-icons">
        <img src="../assets/images/wifi.png" class="status-icon" alt="wifi" />
        <img src="../assets/images/zap.png" class="status-icon" alt="battery" />
      </div>
    </header>

    <!-- Check-in Header -->
    <div class="checkin-hero">
      <div class="hero-icon"><img src="../assets/images/check1.png" class="hero-icon-img" alt="check" /></div>
      <h1 class="hero-title">训练完成！</h1>
      <p class="hero-sub">{{ feedback }}</p>
    </div>

    <!-- Stats -->
    <div class="stats-row">
      <div class="stat-card">
        <p class="stat-value">{{ record.duration || 0 }}<span class="stat-unit"> 分钟</span></p>
        <p class="stat-label">训练时长</p>
      </div>
      <div class="stat-card">
        <p class="stat-value">{{ record.exerciseCount || 0 }}<span class="stat-unit"> 个</span></p>
        <p class="stat-label">完成动作</p>
      </div>
      <div class="stat-card">
        <p class="stat-value">{{ user.streak }}<span class="stat-unit"> 天</span></p>
        <p class="stat-label">连续打卡</p>
      </div>
    </div>

    <!-- Check-in Button -->
    <button
      class="checkin-btn"
      :class="{ done: checkedIn }"
      @click="doCheckin"
      :disabled="checkedIn"
    >
      <template v-if="checkedIn"><img src="../assets/images/check.png" class="check-icon" alt="done" /> 已打卡</template>
      <template v-else><img src="../assets/images/flame.png" class="check-icon" alt="fire" /> 立即打卡</template>
    </button>

    <!-- Actions -->
    <div class="action-row">
      <router-link to="/" class="action-btn">返回首页</router-link>
      <router-link to="/stats" class="action-btn outline">查看统计</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getUser, getTodayRecord, updateStreak } from '../utils/storage.js'
import { defaultUser } from '../data/mock.js'
import { checkin as checkinApi } from '../utils/api.js'

const user = ref(defaultUser)
const record = ref({})
const checkedIn = ref(false)
const currentTime = ref('')

const feedbacks = [
  '干得不错',
  '太棒了，继续保持！',
  '你是最棒的！',
  '今天的付出会有回报！',
  '优秀！你的坚持让人敬佩！'
]

const feedback = feedbacks[Math.floor(Math.random() * feedbacks.length)]

async function doCheckin() {
  if (checkedIn.value) return
  checkedIn.value = true

  try {
    const result = await checkinApi.doCheckin()
    if (result.user) user.value = result.user
  } catch (err) {
    console.error('Checkin failed:', err.message)
  }
}

onMounted(async () => {
  user.value = await getUser() || defaultUser
  record.value = await getTodayRecord() || {}
  checkedIn.value = record.value.checkedIn || false

  const now = new Date()
  currentTime.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #0a0a0a;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 20px;
}

.status-bar {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0;
  height: 44px;
}

.time {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
}

.status-icons {
  display: flex;
  gap: 6px;
  align-items: center;
}

.status-icon {
  width: 16px;
  height: 16px;
}

.checkin-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 60px;
  gap: 12px;
}

.hero-icon {
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background: linear-gradient(135deg, #39ff14, #00c853);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pop 0.5s ease;
}

.hero-icon-img {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

@keyframes pop {
  0% { transform: scale(0.5); opacity: 0; }
  70% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

.hero-title {
  font-size: 28px;
  font-weight: 800;
  color: #fff;
  margin: 0;
  font-family: 'Inter', sans-serif;
}

.hero-sub {
  font-size: 16px;
  color: #39ff14;
  margin: 0;
}

.stats-row {
  display: flex;
  gap: 12px;
  margin-top: 40px;
  width: 100%;
}

.stat-card {
  flex: 1;
  background: #141414;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 800;
  color: #fff;
  margin: 0;
  font-family: 'Inter', sans-serif;
}

.stat-unit {
  font-size: 12px;
  font-weight: 500;
  color: #a0a0a0;
}

.stat-label {
  font-size: 11px;
  color: #606060;
  margin: 0;
}

.checkin-btn {
  width: 100%;
  max-width: 350px;
  height: 56px;
  border-radius: 16px;
  border: none;
  background: linear-gradient(90deg, #39ff14, #00c853);
  color: #0a0a0a;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 40px;
  transition: all 0.3s;
  font-family: 'Inter', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.check-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.checkin-btn.done {
  background: rgba(57, 255, 20, 0.15);
  color: #39ff14;
}

.checkin-btn:active:not(:disabled) {
  opacity: 0.8;
}

.action-row {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  width: 100%;
  max-width: 350px;
}

.action-btn {
  flex: 1;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: #1a1a1a;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
}

.action-btn.outline {
  border: 1px solid #2a2a2a;
  background: transparent;
  color: #a0a0a0;
}
</style>
