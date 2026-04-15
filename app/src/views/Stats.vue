<template>
  <div class="page">
    <header class="status-bar">
      <span class="time">{{ currentTime }}</span>
      <div class="status-icons">
        <img src="../assets/images/wifi.png" class="status-icon" alt="wifi" />
        <img src="../assets/images/zap.png" class="status-icon" alt="battery" />
      </div>
    </header>

    <h1 class="page-title">训练统计</h1>

    <!-- Summary Cards -->
    <div class="summary-row">
      <div class="summary-card">
        <p class="summary-value">{{ user.totalWorkouts || 0 }}</p>
        <p class="summary-label">总训练次数</p>
      </div>
      <div class="summary-card">
        <p class="summary-value">{{ user.streak || 0 }}</p>
        <p class="summary-label">连续打卡</p>
      </div>
      <div class="summary-card">
        <p class="summary-value">{{ totalMinutes }}</p>
        <p class="summary-label">总时长(分)</p>
      </div>
    </div>

    <!-- Weekly Chart -->
    <div class="chart-section">
      <h2 class="section-title">本周训练</h2>
      <div class="chart">
        <div class="chart-bar-group" v-for="(day, i) in weekData" :key="i">
          <div class="chart-bar-wrapper">
            <div
              class="chart-bar"
              :style="{ height: day.height + '%' }"
              :class="{ active: day.today }"
            ></div>
          </div>
          <span class="chart-label" :class="{ active: day.today }">{{ day.label }}</span>
        </div>
      </div>
    </div>

    <!-- Recent Records -->
    <div class="records-section">
      <h2 class="section-title">最近记录</h2>
      <div class="record-list" v-if="records.length">
        <div class="record-item" v-for="rec in records.slice(0, 7)" :key="rec.date + rec.timestamp">
          <div class="record-date">{{ rec.date }}</div>
          <div class="record-info">
            <p class="record-name">{{ rec.planName }}</p>
            <p class="record-detail">{{ Math.round(rec.duration / 60) }}分钟 · {{ rec.exerciseCount }}个动作</p>
          </div>
          <div class="record-status done"><img src="../assets/images/check.png" class="check-icon" alt="done" /></div>
        </div>
      </div>
      <div class="empty" v-else>
        <p>暂无训练记录，快去开始训练吧！</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getUser, getRecords } from '../utils/storage.js'
import { defaultUser } from '../data/mock.js'
import { records as recordsApi } from '../utils/api.js'

const user = ref(defaultUser)
const records = ref([])
const currentTime = ref('')
const weekData = ref([])

const totalMinutes = computed(() => user.value.totalMinutes || 0)

onMounted(async () => {
  user.value = await getUser() || defaultUser
  records.value = await getRecords()

  // 获取本周真实统计数据（修复 Math.random bug）
  try {
    const weekly = await recordsApi.getWeekly()
    const today = new Date().getDay()
    const todayIdx = today === 0 ? 6 : today - 1
    const maxDuration = Math.max(...weekly.days.map(d => d.duration), 1)

    weekData.value = weekly.days.map((d, i) => ({
      label: d.day,
      today: i === todayIdx,
      height: d.duration > 0 ? Math.max(Math.round((d.duration / maxDuration) * 100), 10) : 5
    }))
  } catch (err) {
    console.error('Failed to load weekly stats:', err.message)
    weekData.value = ['一', '二', '三', '四', '五', '六', '日'].map(label => ({
      label, today: false, height: 5
    }))
  }

  const now = new Date()
  currentTime.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #0a0a0a;
  padding-bottom: 80px;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
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

.page-title {
  font-size: 24px;
  font-weight: 800;
  color: #fff;
  margin: 12px 20px 20px;
  font-family: 'Inter', sans-serif;
}

/* Summary */
.summary-row {
  display: flex;
  gap: 12px;
  padding: 0 20px;
  margin-bottom: 24px;
}

.summary-card {
  flex: 1;
  background: #141414;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.summary-value {
  font-size: 28px;
  font-weight: 800;
  color: #39ff14;
  margin: 0;
  font-family: 'Inter', sans-serif;
}

.summary-label {
  font-size: 11px;
  color: #606060;
  margin: 0;
}

/* Chart */
.chart-section, .records-section {
  padding: 0 20px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 16px;
}

.chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 120px;
  background: #141414;
  border-radius: 16px;
  padding: 16px 12px 8px;
}

.chart-bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.chart-bar-wrapper {
  width: 20px;
  height: 80px;
  display: flex;
  align-items: flex-end;
}

.chart-bar {
  width: 100%;
  border-radius: 6px 6px 2px 2px;
  background: #1e1e1e;
  transition: height 0.5s ease;
}

.chart-bar.active {
  background: linear-gradient(180deg, #39ff14, #00c853);
}

.chart-label {
  font-size: 10px;
  color: #606060;
}

.chart-label.active {
  color: #39ff14;
  font-weight: 700;
}

/* Records */
.record-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.record-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #141414;
  border-radius: 14px;
}

.record-date {
  font-size: 12px;
  color: #a0a0a0;
  white-space: nowrap;
}

.record-info {
  flex: 1;
}

.record-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.record-detail {
  font-size: 11px;
  color: #606060;
  margin: 2px 0 0;
}

.record-status {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.check-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.record-status.done {
  background: rgba(57, 255, 20, 0.15);
  color: #39ff14;
}

.empty {
  text-align: center;
  padding: 40px;
  color: #606060;
  font-size: 14px;
}
</style>
