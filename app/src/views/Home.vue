<template>
  <div class="page">
    <!-- Status Bar -->
    <header class="status-bar">
      <span class="time">{{ currentTime }}</span>
      <div class="status-icons">
        <img src="../assets/images/wifi.png" class="status-icon" alt="wifi" />
        <img src="../assets/images/zap.png" class="status-icon" alt="battery" />
      </div>
    </header>

    <!-- Content -->
    <main class="content">
      <!-- Greeting -->
      <div class="greeting-row">
        <div class="greeting">
          <p class="greeting-sub">Good Morning <img src="../assets/images/dumbbell.png" class="inline-icon" alt="muscle" /></p>
          <p class="greeting-main">今天也要加油！</p>
        </div>
        <div class="avatar"><img src="../assets/images/award.png" class="avatar-img" alt="trophy" /></div>
      </div>

      <!-- Streak Card -->
      <div class="streak-card">
        <div class="streak-info">
          <p class="streak-label"><img src="../assets/images/flame.png" class="inline-icon" alt="flame" /> 连续打卡</p>
          <p class="streak-count">{{ user.streak }} 天</p>
          <p class="streak-motto">{{ randomMotivation }}</p>
        </div>
        <div class="streak-badge"><img src="../assets/images/award.png" class="badge-img" alt="trophy" /></div>
      </div>

      <!-- Today's Workout -->
      <div class="workout-card">
        <div class="workout-header">
          <div class="workout-title-row">
            <p class="workout-label">今日训练</p>
            <span class="workout-tag">{{ plan.type }}</span>
          </div>
          <h2 class="workout-name">{{ plan.name }}</h2>
        </div>
        <div class="workout-meta">
          <span class="meta-item"><img src="../assets/images/clock.png" class="inline-icon" alt="clock" /> {{ plan.duration }} 分钟</span>
          <span class="meta-item"><img src="../assets/images/flame.png" class="inline-icon" alt="calories" /> {{ plan.calories }} kcal</span>
          <span class="meta-item"><img src="../assets/images/zap.png" class="inline-icon" alt="difficulty" /> {{ plan.difficulty }}</span>
        </div>
        <router-link
          v-if="!todayCompleted && plan.id && !isRestDay"
          :to="`/plan/${plan.id}/edit`"
          class="start-btn"
        >
          <img src="../assets/images/play.png" class="play-icon" alt="play" />
          开始训练
        </router-link>
        <div v-else-if="!todayCompleted && isRestDay" class="rest-btn">
          今天是休息日，好好恢复
        </div>
        <div v-else class="completed-btn" @click="goWorkout">
          <img src="../assets/images/check.png" class="check-icon" alt="check" />
 已完成 · 再练一次
        </div>
      </div>

      <!-- AI Coach -->
      <div class="ai-card">
        <div class="ai-header">
          <div class="ai-avatar"><img src="../assets/images/Frame_2_18.png" class="ai-avatar-img" alt="ai" /></div>
          <div class="ai-title">
            <p class="ai-name">AI 智能教练</p>
            <p class="ai-desc">根据你的状态实时推荐</p>
          </div>
        </div>
        <div class="ai-message">
          嗨！根据你昨天的训练数据，今天建议进行全身HIIT。你的心肺功能恢复良好，可以尝试中高强度！
        </div>
        <div class="ai-tags">
          <span class="ai-tag green"><img src="../assets/images/dumbbell.png" class="inline-icon" alt="intensity" /> 中高强度</span>
          <span class="ai-tag blue"><img src="../assets/images/clock.png" class="inline-icon" alt="duration" /> {{ plan.duration }}分钟</span>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { motivations, defaultUser } from '../data/mock.js'
import { getUser, isTodayCompleted, initUser } from '../utils/storage.js'
import { plans } from '../utils/api.js'

const router = useRouter()
const plan = ref({ id: '', name: '今日训练', type: '', duration: 0, calories: 0, difficulty: '', exercises: [] })
const isRestDay = ref(false)
const user = ref(defaultUser)
const todayCompleted = ref(false)
const currentTime = ref('')

const randomMotivation = ref(motivations[Math.floor(Math.random() * motivations.length)])

function updateTime() {
  const now = new Date()
  currentTime.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

function goWorkout() {
  if (plan.value.id) router.push(`/plan/${plan.value.id}/edit`)
}

onMounted(async () => {
  user.value = await initUser()
  todayCompleted.value = await isTodayCompleted()

  // 获取今日训练计划
  try {
    const weekPlan = await plans.getWeekPlan(user.value.goal)
    const todayItem = weekPlan.find(p => p.label === '今天')
    if (todayItem) {
      isRestDay.value = todayItem.isRest || !todayItem.planId
      if (todayItem.planId) {
        const planDetail = await plans.getById(todayItem.planId)
        plan.value = planDetail
      } else {
        plan.value = { id: '', name: todayItem.name, type: '休息', duration: 0, calories: 0, difficulty: '轻松', exercises: [] }
      }
    }
  } catch (err) {
    console.error('Failed to load plan:', err.message)
  }

  updateTime()
  setInterval(updateTime, 60000)
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
  background: #0a0a0a;
}

.time {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  font-family: 'Inter', sans-serif;
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

.content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 20px;
}

/* Greeting */
.greeting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.greeting-sub {
  font-size: 13px;
  color: #39ff14;
  margin: 0;
}

.greeting-main {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  margin: 2px 0 0;
  font-family: 'Inter', sans-serif;
}

.avatar {
  line-height: 1;
}

.avatar-img {
  width: 42px;
  height: 42px;
  object-fit: contain;
}

.inline-icon {
  width: 16px;
  height: 16px;
  vertical-align: middle;
  margin-right: 2px;
}

.badge-img {
  width: 64px;
  height: 64px;
  object-fit: contain;
}

.play-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.check-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

/* Streak */
.streak-card {
  background: linear-gradient(135deg, #1a1a1a 0%, #0d2818 100%);
  border-radius: 20px;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.streak-label {
  font-size: 13px;
  font-weight: 600;
  color: #a0a0a0;
  margin: 0;
}

.streak-count {
  font-size: 32px;
  font-weight: 800;
  color: #fff;
  margin: 4px 0;
  font-family: 'Inter', sans-serif;
}

.streak-motto {
  font-size: 12px;
  color: #39ff14;
  margin: 0;
}

.streak-badge {
  line-height: 1;
}

.ai-avatar-img {
  width: 22px;
  height: 22px;
  object-fit: contain;
}

/* Workout Card */
.workout-card {
  background: #141414;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.workout-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.workout-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.workout-label {
  font-size: 13px;
  font-weight: 600;
  color: #a0a0a0;
  margin: 0;
}

.workout-tag {
  padding: 4px 10px;
  border-radius: 10px;
  background: rgba(57, 255, 20, 0.12);
  font-size: 11px;
  font-weight: 700;
  color: #39ff14;
}

.workout-name {
  font-size: 26px;
  font-weight: 800;
  color: #fff;
  margin: 0;
  font-family: 'Inter', sans-serif;
}

.workout-meta {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.meta-item {
  font-size: 13px;
  font-weight: 500;
  color: #a0a0a0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.start-btn {
  width: 100%;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 14px;
  background: linear-gradient(90deg, #39ff14 0%, #00c853 100%);
  color: #0a0a0a;
  font-size: 16px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.2s;
  font-family: 'Inter', sans-serif;
}

.start-btn:active {
  opacity: 0.8;
}

.completed-btn {
  width: 100%;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 14px;
  background: rgba(57, 255, 20, 0.15);
  color: #39ff14;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
}

.rest-btn {
  width: 100%;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 14px;
  background: rgba(96, 96, 96, 0.15);
  color: #606060;
  font-size: 15px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
}

/* AI Card */
.ai-card {
  background: linear-gradient(135deg, #0a2540 0%, #0d3a2f 100%);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ai-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ai-avatar {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: linear-gradient(135deg, #00c6ff 0%, #39ff14 100%);
  font-size: 18px;
}

.ai-name {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.ai-desc {
  font-size: 11px;
  color: #6cffb0;
  margin: 2px 0 0;
}

.ai-message {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 14px;
  font-size: 13px;
  color: #e8e8e8;
  line-height: 1.5;
}

.ai-tags {
  display: flex;
  gap: 8px;
}

.ai-tag {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.ai-tag.green {
  background: rgba(57, 255, 20, 0.15);
  color: #39ff14;
}

.ai-tag.blue {
  background: rgba(0, 198, 255, 0.12);
  color: #00c6ff;
}
</style>
