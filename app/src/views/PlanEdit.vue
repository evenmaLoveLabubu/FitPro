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
      <p class="nav-title">{{ planName }}</p>
      <button
        class="start-btn"
        :disabled="!exercises.length"
        @click="startWorkout"
      >开始训练</button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-wrap">
      <p class="loading-text">加载中...</p>
    </div>

    <template v-else>
      <!-- Current Exercise List -->
      <div class="section">
        <h3 class="section-title">训练动作 ({{ exercises.length }})</h3>
        <draggable
          v-if="exercises.length"
          v-model="exercises"
          item-key="name"
          handle=".drag-handle"
          animation="200"
          ghost-class="ghost"
          class="exercise-list"
        >
          <template #item="{ element: ex, index: i }">
            <div class="exercise-row">
              <span class="drag-handle">
                <span class="drag-dots"></span>
              </span>
              <span class="exercise-index">{{ i + 1 }}</span>
              <div class="exercise-info">
                <p class="exercise-name">{{ ex.name }}</p>
                <p class="exercise-meta">{{ ex.sets }}组 x {{ ex.reps }}{{ ex.unit }} · 休息{{ ex.rest }}秒</p>
              </div>
              <div class="exercise-actions">
                <button class="action-btn" @click="openEdit(i)">
                  <img src="../assets/images/settings.png" class="action-icon" alt="edit" />
                </button>
                <button class="action-btn delete" @click="removeExercise(i)">
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
          </template>
        </draggable>
        <div v-else class="empty-hint">暂无训练动作，请从下方添加</div>
      </div>

      <!-- Add from Library -->
      <div class="section">
        <div class="section-title-row">
          <h3 class="section-title">添加动作</h3>
          <span class="manage-link" @click="$router.push('/exercises')">管理动作库</span>
        </div>
        <!-- Category Tabs -->
        <div class="category-bar">
          <div
            class="category-item"
            :class="{ active: activeCategory === cat }"
            v-for="cat in categories"
            :key="cat"
            @click="activeCategory = cat"
          >{{ cat }}</div>
        </div>
        <!-- Library List -->
        <div class="library-list">
          <div
            class="library-row"
            v-for="lib in filteredLibrary"
            :key="lib._id || lib.name"
          >
            <div class="library-info">
              <p class="library-name">{{ lib.name }}</p>
              <p class="library-desc">{{ lib.description }}</p>
            </div>
            <button
              class="add-btn"
              :class="{ added: isAdded(lib) }"
              :disabled="isAdded(lib)"
              @click="addFromLibrary(lib)"
            >{{ isAdded(lib) ? '已添加' : '添加' }}</button>
          </div>
        </div>
      </div>
    </template>

    <!-- Edit Exercise Modal -->
    <Teleport to="body">
      <transition name="modal">
        <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
          <div class="modal-sheet">
            <div class="modal-header">
              <button class="modal-close" @click="showEditModal = false">
                <img src="../assets/images/chevronleft.png" class="modal-close-icon" alt="close" />
              </button>
              <h3 class="modal-title">编辑动作</h3>
              <div class="modal-spacer"></div>
            </div>
            <div class="modal-body">
              <div class="field-group">
                <div class="field-label">动作名称</div>
                <input v-model="editForm.name" class="field-input" placeholder="动作名称" />
              </div>
              <div class="field-group">
                <div class="field-label">描述</div>
                <input v-model="editForm.description" class="field-input" placeholder="动作描述" />
              </div>
              <div class="field-row">
                <div class="field-group half">
                  <div class="field-label">组数</div>
                  <input v-model.number="editForm.sets" class="field-input" type="number" min="1" />
                </div>
                <div class="field-group half">
                  <div class="field-label">次数/时长</div>
                  <input v-model.number="editForm.reps" class="field-input" type="number" min="1" />
                </div>
              </div>
              <div class="field-row">
                <div class="field-group third">
                  <div class="field-label">单位</div>
                  <div class="unit-options">
                    <div
                      class="unit-option"
                      :class="{ active: editForm.unit === '次' }"
                      @click="editForm.unit = '次'"
                    >次</div>
                    <div
                      class="unit-option"
                      :class="{ active: editForm.unit === '秒' }"
                      @click="editForm.unit = '秒'"
                    >秒</div>
                  </div>
                </div>
                <div class="field-group third">
                  <div class="field-label">休息(秒)</div>
                  <input v-model.number="editForm.rest" class="field-input" type="number" min="0" />
                </div>
                <div class="field-group third">
                  <div class="field-label">计时(秒)</div>
                  <input v-model.number="editForm.duration" class="field-input" type="number" min="0" placeholder="0=手动" />
                </div>
              </div>
            </div>
            <button class="modal-save" @click="saveEdit">保存修改</button>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import draggable from 'vuedraggable'
import { plans, exercises as exercisesApi } from '../utils/api.js'

const route = useRoute()
const router = useRouter()
const planId = route.params.id

const planName = ref('')
const loading = ref(true)
const currentTime = ref('')
const activeCategory = ref('胸肩')
const defaultCategories = ['胸肩', '背部', '腿部', '核心', '有氧']

const exercises = ref([])
const library = ref([])
const showEditModal = ref(false)
const editIndex = ref(-1)

const categories = computed(() => {
  const cats = new Set(defaultCategories)
  library.value.forEach(e => cats.add(e.category))
  return [...cats]
})

const editForm = ref({
  name: '',
  description: '',
  sets: 3,
  reps: 12,
  unit: '次',
  rest: 15,
  duration: 0
})

const filteredLibrary = computed(() => {
  return library.value.filter(e => e.category === activeCategory.value)
})

function isAdded(lib) {
  return exercises.value.some(e => e.name === lib.name)
}

function addFromLibrary(lib) {
  exercises.value.push({
    name: lib.name,
    description: lib.description,
    sets: lib.sets,
    reps: lib.reps,
    unit: lib.unit,
    rest: lib.rest,
    duration: lib.duration
  })
}

function removeExercise(i) {
  exercises.value.splice(i, 1)
}

function openEdit(i) {
  editIndex.value = i
  const ex = exercises.value[i]
  editForm.value = { ...ex }
  showEditModal.value = true
}

function saveEdit() {
  if (editIndex.value >= 0 && editIndex.value < exercises.value.length) {
    exercises.value[editIndex.value] = { ...editForm.value }
  }
  showEditModal.value = false
}

function startWorkout() {
  if (!exercises.value.length) return
  router.push({
    path: `/workout/${planId}`,
    state: { customExercises: exercises.value }
  })
}

function goBack() {
  router.back()
}

function updateTime() {
  const now = new Date()
  currentTime.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

onMounted(async () => {
  updateTime()
  setInterval(updateTime, 60000)

  try {
    const [plan, lib] = await Promise.all([
      plans.getById(planId),
      exercisesApi.getAll()
    ])
    planName.value = plan.name
    exercises.value = plan.exercises ? plan.exercises.map(e => ({ ...e })) : []
    library.value = lib
  } catch (err) {
    console.error('Failed to load:', err.message)
  } finally {
    loading.value = false
  }
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
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  flex: 1;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 8px;
  font-family: 'Inter', sans-serif;
}

.start-btn {
  height: 36px;
  padding: 0 16px;
  border-radius: 18px;
  border: none;
  background: linear-gradient(90deg, #39ff14, #00c853);
  color: #0a0a0a;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
  font-family: 'Inter', sans-serif;
}

.start-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.start-btn:active:not(:disabled) {
  opacity: 0.8;
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

/* Section */
.section {
  padding: 0 20px;
  margin-top: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 12px;
  font-family: 'Inter', sans-serif;
}

.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-title-row .section-title {
  margin: 0;
}

.manage-link {
  font-size: 12px;
  font-weight: 600;
  color: #39ff14;
  cursor: pointer;
}

.empty-hint {
  text-align: center;
  color: #606060;
  font-size: 14px;
  padding: 30px 0;
}

/* Exercise List */
.exercise-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.exercise-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: #141414;
  border-radius: 14px;
  user-select: none;
}

.exercise-row.ghost {
  opacity: 0.4;
  background: #0d2818;
}

/* Drag Handle */
.drag-handle {
  width: 20px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  flex-shrink: 0;
  touch-action: none;
}

.drag-handle:active {
  cursor: grabbing;
}

.drag-dots {
  width: 16px;
  height: 12px;
  background-image: radial-gradient(circle, #606060 1.5px, transparent 1.5px);
  background-size: 6px 6px;
  background-position: 0 0, 0 6px, 6px 0, 6px 6px;
}

.exercise-index {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  background: #1e1e1e;
  font-size: 11px;
  font-weight: 700;
  color: #39ff14;
  flex-shrink: 0;
  font-family: 'Inter', sans-serif;
}

.exercise-info {
  flex: 1;
  min-width: 0;
}

.exercise-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.exercise-meta {
  font-size: 11px;
  color: #606060;
  margin: 2px 0 0;
}

.exercise-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.action-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: none;
  background: #1e1e1e;
  cursor: pointer;
  padding: 0;
}

.action-icon {
  width: 14px;
  height: 14px;
  object-fit: contain;
}

.action-btn.delete {
  background: rgba(255, 80, 80, 0.15);
}

.action-btn.delete:active {
  background: rgba(255, 80, 80, 0.3);
}

.delete-icon {
  width: 14px;
  height: 14px;
  color: #ff5050;
}

/* Category Bar */
.category-bar {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
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

/* Library List */
.library-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.library-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #141414;
  border-radius: 14px;
}

.library-info {
  flex: 1;
  min-width: 0;
}

.library-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.library-desc {
  font-size: 11px;
  color: #606060;
  margin: 2px 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.add-btn {
  height: 32px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid #39ff14;
  background: transparent;
  color: #39ff14;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
  font-family: 'Inter', sans-serif;
}

.add-btn:active {
  background: rgba(57, 255, 20, 0.1);
}

.add-btn.added {
  border-color: #2a2a2a;
  color: #404040;
  cursor: default;
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

.field-group.third {
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

.modal-save {
  width: 100%;
  height: 48px;
  border-radius: 14px;
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
