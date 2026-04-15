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
      <div class="nav-btn" @click="goBack">
        <img src="../assets/images/chevronleft.png" class="nav-btn-icon" alt="back" />
      </div>
      <p class="nav-title">动作库</p>
      <button class="add-btn" @click="openCreate">
        <img src="../assets/images/plus.png" class="add-btn-icon" alt="add" />
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-wrap">
      <p class="loading-text">加载中...</p>
    </div>

    <template v-else>
      <!-- Category Tabs -->
      <div class="category-bar">
        <div
          class="category-item"
          :class="{ active: activeCategory === cat }"
          v-for="cat in allCategories"
          :key="cat"
          @click="activeCategory = cat"
        >{{ cat }}</div>
      </div>

      <!-- Exercise List -->
      <div class="exercise-list">
        <div class="list-count">共 {{ filteredExercises.length }} 个动作</div>
        <div
          class="exercise-row"
          v-for="ex in filteredExercises"
          :key="ex._id"
        >
          <div class="exercise-info">
            <p class="exercise-name">
              {{ ex.name }}
              <span v-if="ex.createdBy" class="custom-badge">自定义</span>
            </p>
            <p class="exercise-desc" v-if="ex.description">{{ ex.description }}</p>
            <p class="exercise-meta" v-if="ex.duration > 0">持续 {{ formatDuration(ex.duration) }}</p>
            <p class="exercise-meta" v-else>{{ ex.sets }}组 x {{ ex.reps }}{{ ex.unit }} · 休息{{ ex.rest }}秒</p>
          </div>
          <div class="exercise-actions">
            <button class="action-btn" @click="openEdit(ex)">
              <img src="../assets/images/settings.png" class="action-icon" alt="edit" />
            </button>
            <button class="action-btn delete" @click="confirmDelete(ex)">
              <svg class="delete-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
              </svg>
            </button>
          </div>
        </div>
        <div v-if="!filteredExercises.length" class="empty-hint">
          {{ activeCategory === '全部' ? '暂无动作' : `「${activeCategory}」分类下暂无动作` }}
        </div>
      </div>
    </template>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <transition name="modal">
        <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
          <div class="modal-sheet">
            <div class="modal-header">
              <button class="modal-close" @click="showModal = false">
                <img src="../assets/images/chevronleft.png" class="modal-close-icon" alt="close" />
              </button>
              <h3 class="modal-title">{{ isEditing ? '编辑动作' : '新建动作' }}</h3>
              <div class="modal-spacer"></div>
            </div>
            <div class="modal-body">
              <div class="field-group">
                <div class="field-label">动作名称</div>
                <input v-model="form.name" class="field-input" placeholder="如：杠铃深蹲" />
              </div>
              <div class="field-group">
                <div class="field-label">分类</div>
                <div class="category-select">
                  <div
                    class="cat-option"
                    :class="{ active: form.category === cat }"
                    v-for="cat in formCategories"
                    :key="cat"
                    @click="selectCategory(cat)"
                  >{{ cat }}</div>
                  <input
                    v-model="customCategory"
                    class="cat-input"
                    placeholder="输入新分类"
                    @focus="customCategory = ''; form.category = ''"
                    @input="onCustomCategoryInput"
                  />
                </div>
              </div>
              <div class="field-group">
                <div class="field-label">描述</div>
                <input v-model="form.description" class="field-input" placeholder="动作描述（可选）" />
              </div>
              <div class="field-group">
                <div class="field-label">训练方式</div>
                <div class="mode-switch">
                  <div class="mode-option" :class="{ active: form.mode === 'sets' }" @click="form.mode = 'sets'">按组数</div>
                  <div class="mode-option" :class="{ active: form.mode === 'duration' }" @click="form.mode = 'duration'">按时长</div>
                </div>
              </div>
              <template v-if="form.mode === 'sets'">
                <div class="field-row">
                  <div class="field-group half">
                    <div class="field-label">组数</div>
                    <input v-model.number="form.sets" class="field-input" type="number" min="1" />
                  </div>
                  <div class="field-group half">
                    <div class="field-label">次数</div>
                    <input v-model.number="form.reps" class="field-input" type="number" min="1" />
                  </div>
                </div>
                <div class="field-row">
                  <div class="field-group half">
                    <div class="field-label">单位</div>
                    <div class="unit-options">
                      <div class="unit-option" :class="{ active: form.unit === '次' }" @click="form.unit = '次'">次</div>
                      <div class="unit-option" :class="{ active: form.unit === '秒' }" @click="form.unit = '秒'">秒</div>
                    </div>
                  </div>
                  <div class="field-group half">
                    <div class="field-label">休息(秒)</div>
                    <input v-model.number="form.rest" class="field-input" type="number" min="0" />
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="field-row">
                  <div class="field-group half">
                    <div class="field-label">时长(分钟)</div>
                    <input v-model.number="form.durationMin" class="field-input" type="number" min="1" placeholder="如：5" />
                  </div>
                </div>
              </template>
            </div>
            <button class="modal-save" @click="saveExercise">{{ isEditing ? '保存修改' : '添加动作' }}</button>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Delete Confirm Modal -->
    <Teleport to="body">
      <transition name="modal">
        <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
          <div class="modal-sheet modal-sheet-sm">
            <div class="modal-header">
              <button class="modal-close" @click="showDeleteConfirm = false">
                <img src="../assets/images/chevronleft.png" class="modal-close-icon" alt="close" />
              </button>
              <h3 class="modal-title">确认删除</h3>
              <div class="modal-spacer"></div>
            </div>
            <div class="modal-body">
              <p class="confirm-text">确定要删除「{{ deleteTarget?.name }}」吗？</p>
            </div>
            <button class="modal-save modal-save-danger" @click="doDelete">删除</button>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { exercises as exercisesApi } from '../utils/api.js'

const router = useRouter()
const loading = ref(true)
const currentTime = ref('')
const allExercises = ref([])
const activeCategory = ref('全部')
const defaultCategories = ['胸肩', '背部', '腿部', '核心', '有氧']
const customCategory = ref('')
const showModal = ref(false)
const isEditing = ref(false)
const editId = ref(null)
const showDeleteConfirm = ref(false)
const deleteTarget = ref(null)

const form = ref({
  name: '',
  category: '胸肩',
  description: '',
  mode: 'sets',
  sets: 3,
  reps: 12,
  unit: '次',
  rest: 15,
  duration: 0,
  durationMin: 0
})

const allCategories = computed(() => {
  const cats = new Set(defaultCategories)
  allExercises.value.forEach(ex => cats.add(ex.category))
  return ['全部', ...cats]
})

const formCategories = computed(() => {
  const cats = new Set(defaultCategories)
  allExercises.value.forEach(ex => cats.add(ex.category))
  return [...cats]
})

const filteredExercises = computed(() => {
  if (activeCategory.value === '全部') return allExercises.value
  return allExercises.value.filter(ex => ex.category === activeCategory.value)
})

function goBack() {
  router.back()
}

function onCustomCategoryInput() {
  if (customCategory.value) form.value.category = customCategory.value
}

function selectCategory(cat) {
  form.value.category = cat
  customCategory.value = ''
}

function formatDuration(seconds) {
  const min = Math.round(seconds / 60)
  if (min >= 60) {
    const h = Math.floor(min / 60)
    const m = min % 60
    return m > 0 ? `${h}小时${m}分钟` : `${h}小时`
  }
  return `${min}分钟`
}

function updateTime() {
  const now = new Date()
  currentTime.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

async function loadExercises() {
  try {
    allExercises.value = await exercisesApi.getAll()
  } catch (err) {
    console.error('Failed to load exercises:', err.message)
  }
}

function openCreate() {
  isEditing.value = false
  editId.value = null
  customCategory.value = ''
  form.value = { name: '', category: '胸肩', description: '', mode: 'sets', sets: 3, reps: 12, unit: '次', rest: 15, duration: 0, durationMin: 0 }
  showModal.value = true
}

function openEdit(ex) {
  isEditing.value = true
  editId.value = ex._id
  customCategory.value = ''
  const mode = ex.duration > 0 ? 'duration' : 'sets'
  form.value = {
    name: ex.name,
    category: ex.category,
    description: ex.description || '',
    mode,
    sets: ex.sets,
    reps: ex.reps,
    unit: ex.unit,
    rest: ex.rest,
    duration: ex.duration,
    durationMin: Math.round(ex.duration / 60) || 1
  }
  showModal.value = true
}

async function saveExercise() {
  if (!form.value.name.trim() || !form.value.category.trim()) return

  const isDuration = form.value.mode === 'duration'
  const data = {
    name: form.value.name.trim(),
    category: form.value.category.trim(),
    description: form.value.description.trim(),
    sets: isDuration ? 0 : form.value.sets,
    reps: isDuration ? 0 : form.value.reps,
    unit: form.value.unit,
    rest: isDuration ? 0 : form.value.rest,
    duration: isDuration ? (form.value.durationMin || 1) * 60 : 0
  }

  try {
    if (isEditing.value) {
      await exercisesApi.update(editId.value, data)
    } else {
      await exercisesApi.create(data)
    }
    showModal.value = false
    await loadExercises()
  } catch (err) {
    console.error('Failed to save exercise:', err.message)
  }
}

function confirmDelete(ex) {
  deleteTarget.value = ex
  showDeleteConfirm.value = true
}

async function doDelete() {
  if (!deleteTarget.value) return
  try {
    await exercisesApi.remove(deleteTarget.value._id)
    showDeleteConfirm.value = false
    deleteTarget.value = null
    await loadExercises()
  } catch (err) {
    console.error('Failed to delete exercise:', err.message)
  }
}

onMounted(() => {
  updateTime()
  setInterval(updateTime, 60000)
  loadExercises().finally(() => { loading.value = false })
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #0a0a0a;
  padding-bottom: 40px;
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

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid #1a1a1a;
}

.nav-btn {
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

.nav-btn-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.nav-title {
  font-size: 17px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  flex: 1;
  text-align: center;
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
  border: none;
  cursor: pointer;
  flex-shrink: 0;
}

.add-btn:active {
  background: #2a2a2a;
}

.add-btn-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

.loading-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.loading-text {
  color: #606060;
  font-size: 14px;
}

/* Category Bar */
.category-bar {
  display: flex;
  gap: 6px;
  padding: 16px 20px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.category-bar::-webkit-scrollbar {
  display: none;
}

.category-item {
  height: 32px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  color: #606060;
  cursor: pointer;
  white-space: nowrap;
  background: #141414;
  transition: all 0.2s;
  flex-shrink: 0;
  font-family: 'Inter', sans-serif;
}

.category-item.active {
  background: linear-gradient(90deg, #39ff14, #00c853);
  color: #0a0a0a;
  font-weight: 700;
}

/* Exercise List */
.exercise-list {
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.list-count {
  font-size: 12px;
  color: #606060;
  margin-bottom: 4px;
}

.exercise-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #141414;
  border-radius: 14px;
}

.exercise-info {
  flex: 1;
  min-width: 0;
}

.exercise-name {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.custom-badge {
  padding: 2px 6px;
  border-radius: 6px;
  background: rgba(0, 198, 255, 0.12);
  color: #00c6ff;
  font-size: 10px;
  font-weight: 600;
}

.exercise-desc {
  font-size: 12px;
  color: #606060;
  margin: 2px 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.exercise-meta {
  font-size: 11px;
  color: #606060;
  margin: 4px 0 0;
}

.exercise-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: none;
  background: #1e1e1e;
  cursor: pointer;
  padding: 0;
}

.action-btn:active {
  background: #2a2a2a;
}

.action-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.action-btn.delete {
  background: rgba(255, 80, 80, 0.15);
}

.action-btn.delete:active {
  background: rgba(255, 80, 80, 0.3);
}

.delete-icon {
  width: 16px;
  height: 16px;
  color: #ff5050;
}

.empty-hint {
  text-align: center;
  padding: 40px 0;
  color: #606060;
  font-size: 14px;
}

/* ===== Modal ===== */
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

.modal-sheet-sm {
  max-width: 360px;
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
  border: none;
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
}

.modal-spacer {
  width: 36px;
}

.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 50vh;
  overflow-y: auto;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-group.half {
  flex: 1;
}

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: #a0a0a0;
}

.field-input {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid #2a2a2a;
  background: #141414;
  color: #fff;
  font-size: 15px;
  outline: none;
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
}

.field-input:focus {
  border-color: #39ff14;
}

.field-row {
  display: flex;
  gap: 10px;
}

/* Category Select */
.category-select {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.cat-option {
  height: 36px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  border-radius: 10px;
  background: #141414;
  font-size: 13px;
  font-weight: 500;
  color: #606060;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.cat-option.active {
  border-color: #39ff14;
  background: rgba(57, 255, 20, 0.1);
  color: #39ff14;
}

.cat-input {
  height: 36px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid #2a2a2a;
  background: #141414;
  color: #fff;
  font-size: 13px;
  outline: none;
  min-width: 100px;
  flex: 1;
  font-family: 'Inter', sans-serif;
}

.cat-input:focus {
  border-color: #39ff14;
}

/* Unit Options */
.unit-options {
  display: flex;
  gap: 8px;
}

.unit-option {
  flex: 1;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #141414;
  font-size: 14px;
  font-weight: 600;
  color: #606060;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.unit-option.active {
  border-color: #39ff14;
  background: rgba(57, 255, 20, 0.1);
  color: #39ff14;
}

/* Mode Switch */
.mode-switch {
  display: flex;
  gap: 0;
  background: #141414;
  border-radius: 12px;
  padding: 3px;
}

.mode-option {
  flex: 1;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #606060;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-option.active {
  background: #39ff14;
  color: #0a0a0a;
}

/* Modal Save */
.modal-save {
  width: 100%;
  height: 48px;
  border-radius: 0;
  border: none;
  background: linear-gradient(90deg, #39ff14, #00c853);
  color: #0a0a0a;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
}

.modal-save:active {
  opacity: 0.8;
}

.modal-save-danger {
  background: linear-gradient(90deg, #ff5050, #cc2020);
  color: #fff;
}

.confirm-text {
  font-size: 15px;
  color: #e0e0e0;
  margin: 0;
  text-align: center;
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
