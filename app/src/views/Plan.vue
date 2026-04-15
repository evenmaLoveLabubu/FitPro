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

    <!-- Title -->
    <div class="title-row">
      <h1 class="page-title">训练计划</h1>
      <div class="add-btn" @click="openPlanPicker('navigate')"><img src="../assets/images/plus.png" class="add-btn-icon" alt="add" /></div>
    </div>

    <!-- Filter Tabs -->
    <div class="filter-bar">
      <div
        class="filter-item"
        :class="{ active: activeFilter === filter }"
        v-for="filter in filters"
        :key="filter"
        @click="activeFilter = filter"
      >
        {{ filter }}
      </div>
    </div>

    <!-- Week Plan -->
    <div class="plan-list">
      <div
        class="plan-item"
        v-for="(item, index) in weekPlanData"
        :key="item.day"
        :class="{ highlight: item.label === '今天', rest: item.isRest }"
        @click="goWorkout(item)"
      >
        <div class="plan-day" :class="{ active: item.label === '今天' }">
          <p class="day-name">{{ item.day }}</p>
          <p class="day-label" v-if="item.label">{{ item.label }}</p>
        </div>
        <div class="plan-content">
          <p class="plan-name" :class="{ muted: item.isRest }">{{ item.name }}</p>
          <div class="plan-tags" v-if="item.tags.length">
            <span
              v-for="tag in item.tags"
              :key="tag"
              class="plan-tag"
              :class="getTagClass(tag, item)"
            >{{ tag }}</span>
          </div>
        </div>
        <span class="context-btn" @click.stop="openDayMenu(item)">
          <img src="../assets/images/ellipsis.png" class="context-icon" alt="menu" />
        </span>
      </div>
    </div>

    <!-- Plan Picker Modal -->
    <Teleport to="body">
      <transition name="modal">
        <div v-if="showPlanPicker" class="modal-overlay" @click.self="showPlanPicker = false">
          <div class="modal-sheet">
            <div class="modal-header">
              <button class="modal-close" @click="showPlanPicker = false">
                <img src="../assets/images/chevronleft.png" class="modal-close-icon" alt="close" />
              </button>
              <h3 class="modal-title">选择训练计划</h3>
              <div class="modal-spacer"></div>
            </div>
            <div class="modal-body">
              <div
                class="picker-item"
                v-for="p in allPlans"
                :key="p.id"
                @click="selectPlan(p)"
              >
                <div class="picker-info">
                  <p class="picker-name">{{ p.name }}</p>
                  <div class="picker-meta">
                    <span>{{ p.type }}</span>
                    <span>{{ p.duration }}分钟</span>
                    <span>{{ p.calories }}kcal</span>
                  </div>
                </div>
                <span class="picker-arrow"><img src="../assets/images/chevronright.png" class="arrow-icon" alt="arrow" /></span>
              </div>
              <div v-if="!allPlans.length" class="picker-empty">暂无训练计划</div>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Day Menu Modal -->
    <Teleport to="body">
      <transition name="modal">
        <div v-if="showDayMenu" class="modal-overlay" @click.self="showDayMenu = false">
          <div class="modal-sheet">
            <div class="modal-header">
              <button class="modal-close" @click="showDayMenu = false">
                <img src="../assets/images/chevronleft.png" class="modal-close-icon" alt="close" />
              </button>
              <h3 class="modal-title">{{ selectedDay?.day }} · {{ selectedDay?.name }}</h3>
              <div class="modal-spacer"></div>
            </div>
            <div class="modal-body day-menu-body">
              <!-- Training day options -->
              <template v-if="selectedDay && !selectedDay.isRest">
                <div class="menu-option" @click="setRestDay">
                  <div class="menu-option-icon rest-icon">
                    <svg class="menu-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
                    </svg>
                  </div>
                  <span class="menu-option-text">设为休息日</span>
                </div>
                <div class="menu-option" @click="changePlan">
                  <div class="menu-option-icon plan-icon">
                    <svg class="menu-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3" /><path d="M4 22v-7" /><path d="M20 22v-7" /><path d="M20 15s-1-1-4-1-5 2-8 2-4-1-4-1V3" />
                    </svg>
                  </div>
                  <span class="menu-option-text">更换训练计划</span>
                </div>
              </template>
              <!-- Rest day options -->
              <template v-else-if="selectedDay">
                <div class="menu-option" @click="setTrainingDay">
                  <div class="menu-option-icon train-icon">
                    <svg class="menu-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                  </div>
                  <span class="menu-option-text">设为训练日</span>
                </div>
              </template>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { plans } from '../utils/api.js'

const router = useRouter()
const activeFilter = ref('增肌')
const currentTime = ref('')
const weekPlanData = ref([])
const allPlans = ref([])
const showPlanPicker = ref(false)
const showDayMenu = ref(false)
const selectedDay = ref(null)
const pickerMode = ref('navigate') // 'navigate' | 'assign'
const filters = ['增肌', '减脂', '家庭训练']

function getTagClass(tag, item) {
  if (tag === '拉伸放松') return 'orange'
  if (tag === '休息') return 'dim'
  if (item.label === '今天') return 'green'
  return ''
}

function goWorkout(item) {
  if (item.planId) {
    router.push(`/plan/${item.planId}/edit`)
  }
}

async function loadWeekPlan() {
  try {
    weekPlanData.value = await plans.getWeekPlan(activeFilter.value)
  } catch (err) {
    console.error('Failed to load week plan:', err.message)
  }
}

watch(activeFilter, loadWeekPlan)

async function loadAllPlans() {
  try {
    allPlans.value = await plans.getAll(activeFilter.value)
  } catch (err) {
    console.error('Failed to load plans:', err.message)
  }
}

function openPlanPicker(mode) {
  pickerMode.value = mode
  loadAllPlans()
  showPlanPicker.value = true
}

function openDayMenu(item) {
  selectedDay.value = item
  showDayMenu.value = true
}

function selectPlan(p) {
  showPlanPicker.value = false
  if (pickerMode.value === 'assign' && selectedDay.value) {
    assignPlanToDay(p)
  } else {
    router.push(`/plan/${p.id}/edit`)
  }
}

async function setRestDay() {
  showDayMenu.value = false
  if (!selectedDay.value) return
  try {
    await plans.updateWeekPlanDay(selectedDay.value.dayOrder, activeFilter.value, {
      isRest: true,
      planId: null,
      name: '休息日',
      duration: '',
      tags: ['休息']
    })
    await loadWeekPlan()
  } catch (err) {
    console.error('Failed to set rest day:', err.message)
  }
}

function setTrainingDay() {
  showDayMenu.value = false
  openPlanPicker('assign')
}

function changePlan() {
  showDayMenu.value = false
  openPlanPicker('assign')
}

async function assignPlanToDay(workoutPlan) {
  if (!selectedDay.value) return
  try {
    await plans.updateWeekPlanDay(selectedDay.value.dayOrder, activeFilter.value, {
      isRest: false,
      planId: workoutPlan.id,
      name: workoutPlan.name,
      duration: `${workoutPlan.duration}分钟`,
      tags: [workoutPlan.type, `${workoutPlan.exercises.length}个动作`]
    })
    await loadWeekPlan()
  } catch (err) {
    console.error('Failed to assign plan:', err.message)
  }
}

onMounted(() => {
  const now = new Date()
  currentTime.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  loadWeekPlan()
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

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 800;
  color: #fff;
  margin: 0;
  font-family: 'Inter', sans-serif;
}

.add-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: #1e1e1e;
  color: #fff;
  cursor: pointer;
}

.add-btn-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

/* Filter */
.filter-bar {
  display: flex;
  gap: 0;
  padding: 0 20px;
  height: 48px;
  background: #141414;
}

.filter-item {
  flex: 1;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  color: #606060;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Inter', sans-serif;
}

.filter-item.active {
  background: linear-gradient(90deg, #39ff14, #00c853);
  color: #0a0a0a;
  font-weight: 700;
}

/* Plan List */
.plan-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 20px;
}

.plan-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  border-radius: 20px;
  background: #141414;
  cursor: pointer;
  transition: background 0.2s;
}

.plan-item.highlight {
  border: 1px solid rgba(57, 255, 20, 0.25);
}

.plan-day {
  width: 52px;
  height: 52px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: #1e1e1e;
  flex-shrink: 0;
}

.plan-day.active {
  background: linear-gradient(135deg, #39ff14, #00c853);
}

.day-name {
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.plan-day.active .day-name {
  color: #0a0a0a;
}

.day-label {
  font-size: 10px;
  font-weight: 600;
  color: #606060;
  margin: 0;
}

.plan-day.active .day-label {
  color: #0a0a0a;
}

.plan-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.plan-name {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.plan-name.muted {
  color: #606060;
}

.plan-tags {
  display: flex;
  gap: 8px;
}

.plan-tag {
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.06);
  color: #a0a0a0;
}

.plan-tag.green {
  background: rgba(57, 255, 20, 0.12);
  color: #39ff14;
}

.plan-tag.orange {
  background: rgba(255, 179, 71, 0.12);
  color: #ffb347;
}

.plan-tag.dim {
  background: rgba(255, 255, 255, 0.03);
  color: #404040;
}

/* Context Button */
.context-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  cursor: pointer;
  flex-shrink: 0;
}

.context-btn:active {
  background: rgba(255, 255, 255, 0.08);
}

.context-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
  opacity: 0.35;
}

.arrow-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
  color: #a0a0a0;
}

/* ===== Modals ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 200;
  padding: 0 20px 40px;
}

.modal-sheet {
  width: 100%;
  max-width: 400px;
  background: #1a1a1a;
  border-radius: 24px 24px 0;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  padding: 12px 8px;
  border-bottom: 1px solid #2a2a2a;
}

.modal-close {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: #1e1e1e;
  cursor: pointer;
  flex-shrink: 0;
}

.modal-close-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.modal-title {
  font-size: 17px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  flex: 1;
  text-align: center;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modal-spacer {
  width: 36px;
}

.modal-body {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 50vh;
  overflow-y: auto;
}

/* Picker */
.picker-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: #141414;
  border-radius: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.picker-item:active {
  background: #1e1e1e;
}

.picker-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.picker-name {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.picker-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #606060;
}

.picker-arrow {
  display: flex;
  align-items: center;
}

.picker-empty {
  text-align: center;
  padding: 30px;
  color: #606060;
  font-size: 14px;
}

/* Day Menu */
.day-menu-body {
  padding: 20px;
  gap: 10px;
}

.menu-option {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-radius: 14px;
  background: #141414;
  cursor: pointer;
  transition: background 0.2s;
}

.menu-option:active {
  background: #1e1e1e;
}

.menu-option-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  flex-shrink: 0;
}

.rest-icon {
  background: rgba(96, 96, 96, 0.15);
  color: #606060;
}

.train-icon {
  background: rgba(57, 255, 20, 0.12);
  color: #39ff14;
}

.plan-icon {
  background: rgba(0, 198, 255, 0.12);
  color: #00c6ff;
}

.menu-svg {
  width: 20px;
  height: 20px;
}

.menu-option-text {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
}

/* Modal Transition */
.modal-enter-active .modal-overlay,
.modal-leave-active .modal-overlay {
  transition: opacity 0.25s ease;
}

.modal-enter-from .modal-overlay,
.modal-leave-to .modal-overlay {
  opacity: 0;
}

.modal-enter-active .modal-sheet,
.modal-leave-active .modal-sheet {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-sheet,
.modal-leave-to .modal-sheet {
  transform: translateY(100%);
}
</style>
