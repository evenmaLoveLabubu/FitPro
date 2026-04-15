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

    <!-- Nav Bar -->
    <div class="nav-bar">
      <div class="nav-btn" @click="goBack"><img src="../assets/images/chevronleft.png" class="nav-btn-icon" alt="back" /></div>
      <p class="nav-title">{{ plan ? plan.name : '加载中...' }}</p>
      <div class="nav-btn"><img src="../assets/images/ellipsis.png" class="nav-btn-icon" alt="more" /></div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-wrap">
      <p class="loading-text">加载训练计划...</p>
    </div>

    <template v-else-if="plan">

    <!-- Video Area -->
    <div class="video-area">
      <div class="video-placeholder">
        <img src="../assets/images/dumbbell.png" class="video-icon" alt="exercise" />
        {{ currentExercise.name }}
      </div>
    </div>

    <!-- Workout Content -->
    <div class="workout-content" v-if="workoutStatus === 'active'">
      <!-- Exercise Info -->
      <div class="exercise-info-row">
        <div class="exercise-text">
          <h2 class="exercise-name">{{ currentExercise.name }}</h2>
          <p class="exercise-desc">{{ currentExercise.description }}</p>
        </div>
        <div class="set-badge">
          <span class="set-current">{{ currentSet }}</span>
          <span class="set-sep">/</span>
          <span class="set-total">{{ currentExercise.sets }}</span>
          <span class="set-unit">组</span>
        </div>
      </div>

      <!-- Timer & Info -->
      <div class="timer-section">
        <div class="timer-info">
          <p class="timer-label">{{ phaseLabel }}</p>
          <p class="timer-value">{{ displayTime }}</p>
        </div>
        <div class="reps-badge">
          <span class="reps-num">{{ currentExercise.reps }}</span>
          <span class="reps-unit">{{ currentExercise.unit }}</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="actions">
        <button class="btn-skip" @click="skipExercise">
          <img src="../assets/images/skipforward.png" class="btn-icon" alt="skip" />
 跳过
        </button>
        <button class="btn-done" @click="completeCurrent">
          <img src="../assets/images/check.png" class="btn-icon" alt="done" />
 完成
        </button>
      </div>

      <!-- Exercise List -->
      <p class="list-title">训练动作列表</p>
      <div class="exercise-list">
        <ExerciseCard
          v-for="(ex, i) in plan.exercises"
          :key="i"
          :exercise="ex"
          :index="i"
          :is-current="i === currentExerciseIndex"
          :is-completed="i < currentExerciseIndex"
        />
      </div>
    </div>

    <!-- Rest Phase -->
    <div class="rest-content" v-else-if="workoutStatus === 'rest'">
      <div class="rest-info">
        <div class="rest-circle">
          <p class="rest-timer">{{ displayTime }}</p>
        </div>
        <p class="rest-label">休息一下</p>
        <p class="rest-next">下一个动作：{{ nextExerciseName }}</p>
      </div>
      <button class="btn-skip-rest" @click="skipRest">跳过休息</button>
    </div>

    <!-- Complete -->
    <div class="complete-content" v-else-if="workoutStatus === 'done'">
      <div class="complete-icon"><img src="../assets/images/Frame_2_18.png" class="complete-icon-img" alt="complete" /></div>
      <h2 class="complete-title">训练完成！</h2>
      <p class="complete-stats">
        共完成 {{ plan.exercises.length }} 个动作 · 约 {{ plan.duration }} 分钟
      </p>
      <router-link to="/checkin" class="btn-checkin">查看训练总结</router-link>
    </div>
    </template>

    <!-- Error -->
    <div v-else class="loading-wrap">
      <p class="loading-text">训练计划不存在</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { plans } from '../utils/api.js'
import { addRecord } from '../utils/storage.js'
import ExerciseCard from '../components/ExerciseCard.vue'

const route = useRoute()
const router = useRouter()

const planId = route.params.id
const plan = ref(null)
const loading = ref(true)

const currentExerciseIndex = ref(0)
const currentSet = ref(1)
const workoutStatus = ref('active') // active | rest | done
const phase = ref('exercise') // exercise | rest
const timerSeconds = ref(0)
let interval = null
const currentTime = ref('')
const workoutStartTime = ref(null)

const currentExercise = computed(() => {
  if (!plan.value || !plan.value.exercises.length) return { name: '', description: '', sets: 1, reps: 0, unit: '次', rest: 15, duration: 0 }
  return plan.value.exercises[currentExerciseIndex.value] || plan.value.exercises[0]
})

const nextExerciseName = computed(() => {
  const next = plan.value.exercises[currentExerciseIndex.value + 1]
  return next ? next.name : '训练即将结束'
})

const phaseLabel = computed(() => {
  if (phase.value === 'rest') return '休息时间'
  return '剩余时间'
})

const displayTime = computed(() => {
  const m = Math.floor(timerSeconds.value / 60)
  const s = timerSeconds.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

function startTimer(seconds) {
  stopTimer()
  timerSeconds.value = seconds
  interval = setInterval(() => {
    if (timerSeconds.value > 0) {
      timerSeconds.value--
    } else {
      stopTimer()
      onTimerComplete()
    }
  }, 1000)
}

function stopTimer() {
  if (interval) {
    clearInterval(interval)
    interval = null
  }
}

function onTimerComplete() {
  if (phase.value === 'rest') {
    // 休息结束，进入下一个动作或组
    goToNextSet()
  } else {
    // 动作计时结束（如平板支撑），自动完成该组
    completeCurrentSet()
  }
}

function completeCurrent() {
  if (phase.value === 'exercise') {
    completeCurrentSet()
  } else if (phase.value === 'rest') {
    skipRest()
  }
}

function completeCurrentSet() {
  if (currentSet.value < currentExercise.value.sets) {
    // 同一动作下一组，先休息
    currentSet.value++
    enterRest()
  } else {
    // 当前动作所有组完成，进入下一个动作
    if (currentExerciseIndex.value < plan.value.exercises.length - 1) {
      currentExerciseIndex.value++
      currentSet.value = 1
      enterRest()
    } else {
      // 全部完成
      finishWorkout()
    }
  }
}

function skipExercise() {
  if (currentExerciseIndex.value < plan.value.exercises.length - 1) {
    currentExerciseIndex.value++
    currentSet.value = 1
    phase.value = 'exercise'
    startTimer(currentExercise.value.duration || 45)
  } else {
    finishWorkout()
  }
}

function enterRest() {
  phase.value = 'rest'
  workoutStatus.value = 'rest'
  startTimer(currentExercise.value.rest || 15)
}

function goToNextSet() {
  phase.value = 'exercise'
  workoutStatus.value = 'active'
  if (currentExercise.value.duration) {
    startTimer(currentExercise.value.duration)
  } else {
    // 次数类动作，不自动计时，手动点击完成
    timerSeconds.value = 0
  }
}

function skipRest() {
  stopTimer()
  goToNextSet()
}

async function finishWorkout() {
  stopTimer()
  workoutStatus.value = 'done'

  // 原子操作：保存训练记录 + 更新用户统计 + 创建 CheckIn
  const elapsed = workoutStartTime.value
    ? Math.round((Date.now() - workoutStartTime.value) / 1000)
    : plan.value.duration * 60

  try {
    await addRecord({
      planId: plan.value.id,
      planName: plan.value.name,
      duration: elapsed,
      exerciseCount: plan.value.exercises.length
    })
  } catch (err) {
    console.error('Failed to save record:', err.message)
  }
}

function goBack() {
  if (workoutStatus.value === 'active' || workoutStatus.value === 'rest') {
    if (confirm('确定要退出训练吗？当前进度将不会保存。')) {
      stopTimer()
      router.back()
    }
  } else {
    router.back()
  }
}

function updateTime() {
  const now = new Date()
  currentTime.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

onMounted(async () => {
  updateTime()
  setInterval(updateTime, 60000)
  workoutStartTime.value = Date.now()

  // 从 API 获取训练计划
  try {
    plan.value = await plans.getById(planId)
    // 接收 PlanEdit 传来的自定义动作列表
    if (history.state?.customExercises) {
      plan.value = { ...plan.value, exercises: history.state.customExercises }
    }
    if (currentExercise.value.duration) {
      startTimer(currentExercise.value.duration)
    }
  } catch (err) {
    console.error('Failed to load plan:', err.message)
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  stopTimer()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #0a0a0a;
  display: flex;
  flex-direction: column;
}

.loading-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-text {
  font-size: 16px;
  color: #606060;
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

.nav-btn-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
}

.nav-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: #1e1e1e;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
}

.nav-title {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

/* Video Area */
.video-area {
  width: 100%;
  height: 240px;
  background: linear-gradient(135deg, #1a1a1a, #0d2818);
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-placeholder {
  font-size: 48px;
  color: rgba(57, 255, 20, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.video-icon {
  width: 64px;
  height: 64px;
  object-fit: contain;
  opacity: 0.5;
}

/* Workout Content */
.workout-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
}

.exercise-info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.exercise-name {
  font-size: 36px;
  font-weight: 800;
  color: #fff;
  margin: 0;
  font-family: 'Inter', sans-serif;
}

.exercise-desc {
  font-size: 13px;
  color: #a0a0a0;
  margin: 4px 0 0;
}

.set-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 14px;
  border-radius: 12px;
  background: #1e1e1e;
}

.set-current {
  font-size: 20px;
  font-weight: 800;
  color: #39ff14;
  font-family: 'Inter', sans-serif;
}

.set-sep {
  font-size: 14px;
  color: #606060;
}

.set-total {
  font-size: 14px;
  color: #606060;
}

.set-unit {
  font-size: 11px;
  color: #606060;
}

/* Timer */
.timer-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #141414;
  border-radius: 20px;
  padding: 20px 24px;
}

.timer-label {
  font-size: 12px;
  color: #606060;
  margin: 0 0 4px;
}

.timer-value {
  font-size: 48px;
  font-weight: 800;
  color: #39ff14;
  line-height: 1;
  margin: 0;
  font-family: 'Inter', sans-serif;
}

.reps-badge {
  width: 72px;
  height: 72px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  border-radius: 36px;
  background: #0d2818;
  border: 3px solid #39ff14;
}

.reps-num {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
}

.reps-unit {
  font-size: 11px;
  color: #39ff14;
}

/* Actions */
.actions {
  display: flex;
  gap: 12px;
}

.btn-skip {
  flex: 1;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 14px;
  border: 1px solid #2a2a2a;
  background: #1a1a1a;
  color: #a0a0a0;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
}

.btn-done {
  flex: 1;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 14px;
  border: none;
  background: linear-gradient(90deg, #39ff14, #00c853);
  color: #0a0a0a;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
}

.btn-done:active, .btn-skip:active {
  opacity: 0.8;
}

.btn-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.list-title {
  font-size: 14px;
  font-weight: 600;
  color: #a0a0a0;
  margin: 0;
}

.exercise-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Rest */
.rest-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 20px;
}

.rest-circle {
  width: 120px;
  height: 120px;
  border-radius: 60px;
  border: 4px solid #39ff14;
  background: #0d2818;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rest-timer {
  font-size: 40px;
  font-weight: 800;
  color: #39ff14;
  margin: 0;
  font-family: 'Inter', sans-serif;
}

.rest-label {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.rest-next {
  font-size: 14px;
  color: #a0a0a0;
  margin: 0;
}

.btn-skip-rest {
  width: 100%;
  height: 52px;
  border-radius: 14px;
  border: 1px solid #2a2a2a;
  background: #1a1a1a;
  color: #a0a0a0;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
}

/* Complete */
.complete-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 40px 20px;
}

.complete-icon {
  animation: bounce 0.6s ease;
}

.complete-icon-img {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.complete-title {
  font-size: 28px;
  font-weight: 800;
  color: #fff;
  margin: 0;
}

.complete-stats {
  font-size: 14px;
  color: #a0a0a0;
  margin: 0;
}

.btn-checkin {
  width: 100%;
  max-width: 300px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: linear-gradient(90deg, #39ff14, #00c853);
  color: #0a0a0a;
  font-size: 16px;
  font-weight: 700;
  text-decoration: none;
  margin-top: 16px;
}
</style>
