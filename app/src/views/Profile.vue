<template>
  <div class="page">
    <header class="status-bar">
      <span class="time">{{ currentTime }}</span>
      <div class="status-icons">
        <img src="../assets/images/wifi.png" class="status-icon" alt="wifi" />
        <img src="../assets/images/zap.png" class="status-icon" alt="battery" />
      </div>
    </header>

    <h1 class="page-title">我的</h1>

    <!-- Profile Card -->
    <div class="profile-card">
      <div class="profile-header">
        <div class="profile-avatar" @click="$refs.cardAvatarInput.click()">
          <img
            v-if="user.avatar"
            :src="user.avatar"
            class="profile-avatar-img real-avatar"
            alt="avatar"
          />
          <img v-else src="../assets/images/dumbbell.png" class="profile-avatar-img" alt="avatar" />
          <div class="avatar-edit-badge">
            <img src="../assets/images/plus.png" class="avatar-edit-icon" alt="edit" />
          </div>
        </div>
        <input
          ref="cardAvatarInput"
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          style="display:none"
          @change="handleAvatarChange"
        />
        <div class="profile-info">
          <h2 class="profile-name">{{ user.nickname }}</h2>
          <p class="profile-goal">目标：{{ user.goal }}</p>
        </div>
      </div>
      <div class="profile-stats">
        <div class="profile-stat">
          <p class="ps-value">{{ user.streak || 0 }}</p>
          <p class="ps-label">连续打卡</p>
        </div>
        <div class="stat-divider"></div>
        <div class="profile-stat">
          <p class="ps-value">{{ user.totalWorkouts || 0 }}</p>
          <p class="ps-label">训练次数</p>
        </div>
        <div class="stat-divider"></div>
        <div class="profile-stat">
          <p class="ps-value">{{ totalMin }}</p>
          <p class="ps-label">总时长(分)</p>
        </div>
      </div>
    </div>

    <!-- Achievements -->
    <div class="section">
      <h3 class="section-title">我的成就</h3>
      <div class="achievement-list">
        <div
          class="achievement"
          :class="{ locked: !ach.unlocked }"
          v-for="ach in user.achievements"
          :key="ach.id"
        >
          <img :src="getAchIcon(ach.icon)" class="ach-icon" :alt="ach.name" />
          <span class="ach-name">{{ ach.name }}</span>
          <span class="ach-status">{{ ach.unlocked ? '已解锁' : '未解锁' }}</span>
        </div>
      </div>
    </div>

    <!-- Settings -->
    <div class="section">
      <h3 class="section-title">设置</h3>
      <div class="setting-list">
        <div class="setting-item" @click="showSettingsModal = true">
          <span><img src="../assets/images/settings.png" class="setting-icon" alt="settings" /> 个人设置</span>
          <span class="setting-arrow"><img src="../assets/images/chevronright.png" class="arrow-icon" alt="arrow" /></span>
        </div>
        <div class="setting-item">
          <span><img src="../assets/images/wind.png" class="setting-icon" alt="sound" /> 训练音效</span>
          <span class="setting-arrow"><img src="../assets/images/chevronright.png" class="arrow-icon" alt="arrow" /></span>
        </div>
        <div class="setting-item">
          <span><img src="../assets/images/lifebuoy.png" class="setting-icon" alt="about" /> 关于我们</span>
          <span class="setting-arrow"><img src="../assets/images/chevronright.png" class="arrow-icon" alt="arrow" /></span>
        </div>
        <div class="setting-item logout" @click="handleLogout">
          <span><img src="../assets/images/share2.png" class="setting-icon" alt="logout" /> 退出登录</span>
          <span class="setting-arrow"><img src="../assets/images/chevronright.png" class="arrow-icon" alt="arrow" /></span>
        </div>
      </div>
    </div>

    <!-- Settings Modal -->
    <Teleport to="body">
      <transition name="modal">
        <div v-if="showSettingsModal" class="modal-overlay" @click.self="showSettingsModal = false">
          <div class="modal-sheet">
            <div class="modal-header">
              <button class="modal-close" @click="showSettingsModal = false">
                <img src="../assets/images/chevronleft.png" class="modal-close-icon" alt="close" />
              </button>
              <h3 class="modal-title">个人设置</h3>
              <div class="modal-spacer"></div>
            </div>

            <div class="modal-body">
              <!-- Avatar -->
              <div class="field-group">
                <div class="field-label">头像</div>
                <div class="avatar-upload" @click="$refs.modalAvatarInput.click()">
                  <img
                    v-if="tempAvatar || user.avatar"
                    :src="tempAvatar || user.avatar"
                    class="avatar-upload-img"
                    alt="avatar"
                  />
                  <img v-else src="../assets/images/user.png" class="avatar-upload-img avatar-upload-placeholder" alt="avatar" />
                  <div class="avatar-upload-mask">
                    <img src="../assets/images/plus.png" class="avatar-upload-plus" alt="upload" />
                  </div>
                  <span class="avatar-upload-hint">点击上传</span>
                </div>
                <input
                  ref="modalAvatarInput"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  style="display:none"
                  @change="handleAvatarChange"
                />
                <p v-if="errors.avatar" class="field-error">{{ errors.avatar }}</p>
              </div>

              <!-- Nickname -->
              <div class="field-group">
                <div class="field-label">昵称</div>
                <input
                  v-model="form.nickname"
                  class="field-input"
                  :class="{ 'field-error-border': errors.nickname }"
                  placeholder="请输入昵称"
                  maxlength="12"
                />
                <p v-if="errors.nickname" class="field-error">{{ errors.nickname }}</p>
              </div>

              <!-- Phone -->
              <div class="field-group">
                <div class="field-label">手机号</div>
                <input
                  v-model="form.phone"
                  class="field-input"
                  :class="{ 'field-error-border': errors.phone }"
                  type="tel"
                  placeholder="请输入手机号"
                  maxlength="11"
                />
                <p v-if="errors.phone" class="field-error">{{ errors.phone }}</p>
              </div>

              <!-- Birthday -->
              <div class="field-group">
                <div class="field-label">生日</div>
                <input
                  v-model="form.birthday"
                  class="field-input"
                  :class="{ 'field-error-border': errors.birthday }"
                  type="date"
                  :max="maxBirthday"
                />
                <p v-if="errors.birthday" class="field-error">{{ errors.birthday }}</p>
              </div>

              <!-- Goal -->
              <div class="field-group">
                <div class="field-label">训练目标</div>
                <div class="goal-options">
                  <div
                    class="goal-option"
                    :class="{ active: form.goal === '增肌' }"
                    @click="form.goal = form.goal === '增肌' ? '' : '增肌'"
                  >增肌</div>
                  <div
                    class="goal-option"
                    :class="{ active: form.goal === '减脂' }"
                    @click="form.goal = form.goal === '减脂' ? '' : '减脂'"
                  >减脂</div>
                </div>
                <p v-if="errors.goal" class="field-error">{{ errors.goal }}</p>
              </div>
            </div>

            <p v-if="saveMsg" class="save-msg" :class="{ error: saveMsgType === 'error' }">{{ saveMsg }}</p>
            <button class="modal-save" :disabled="saving" @click="saveSettings">
              {{ saving ? '保存中...' : '保存' }}
            </button>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getUser } from '../utils/storage.js'
import { defaultUser } from '../data/mock.js'
import { logout, users } from '../utils/api.js'

const achIconMap = {
  star: new URL('../assets/images/award.png', import.meta.url).href,
  flame: new URL('../assets/images/flame.png', import.meta.url).href,
  dumbbell: new URL('../assets/images/dumbbell.png', import.meta.url).href,
  crown: new URL('../assets/images/Frame_2_18.png', import.meta.url).href
}

function getAchIcon(iconKey) {
  return achIconMap[iconKey] || achIconMap.star
}

const router = useRouter()
const user = ref(defaultUser)
const currentTime = ref('')
const showSettingsModal = ref(false)
const saving = ref(false)
const tempAvatar = ref('')
const saveMsg = ref('')
const saveMsgType = ref('')

const form = reactive({
  nickname: '',
  phone: '',
  birthday: '',
  goal: ''
})

const errors = reactive({
  nickname: '',
  phone: '',
  birthday: '',
  goal: ''
})

const maxBirthday = (() => {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 10)
  return d.toISOString().split('T')[0]
})()

const totalMin = computed(() => user.value.totalMinutes || 0)

// 打开弹窗时同步当前用户数据到表单
watch(showSettingsModal, (val) => {
  if (val) {
    form.nickname = user.value.nickname || ''
    form.phone = user.value.phone || ''
    form.birthday = user.value.birthday || ''
    form.goal = user.value.goal || ''
    tempAvatar.value = ''
    saveMsg.value = ''
    saveMsgType.value = ''
    Object.keys(errors).forEach(k => errors[k] = '')
  }
})

function handleLogout() {
  if (confirm('确定要退出登录吗？')) {
    logout()
    router.push('/login')
  }
}

// 校验
function validate() {
  Object.keys(errors).forEach(k => errors[k] = '')
  let valid = true

  if (!form.nickname.trim()) {
    errors.nickname = '昵称不能为空'
    valid = false
  } else if (form.nickname.trim().length > 12) {
    errors.nickname = '昵称最多12个字符'
    valid = false
  }

  if (form.phone) {
    if (!/^1\d{10}$/.test(form.phone)) {
      errors.phone = '请输入正确的11位手机号'
      valid = false
    }
  }

  if (form.birthday) {
    const bday = new Date(form.birthday)
    if (isNaN(bday.getTime())) {
      errors.birthday = '请选择有效的日期'
      valid = false
    } else if (new Date(form.birthday) > new Date(maxBirthday)) {
      errors.birthday = '生日不能晚于10年前'
      valid = false
    }
  }

  if (!form.goal) {
    errors.goal = '请选择训练目标'
    valid = false
  }

  return valid
}

async function saveSettings() {
  if (!validate()) return

  saving.value = true
  const updates = {
    nickname: form.nickname.trim(),
    goal: form.goal
  }
  if (form.phone) updates.phone = form.phone
  if (form.birthday) updates.birthday = form.birthday
  if (tempAvatar.value) updates.avatar = tempAvatar.value

  try {
    const updated = await users.updateMe(updates)
    user.value = updated
    saveMsg.value = '保存成功'
    saveMsgType.value = 'success'
    setTimeout(() => { showSettingsModal.value = false }, 800)
  } catch (err) {
    console.error('Save settings failed:', err.message)
    saveMsg.value = '保存失败，请重试'
    saveMsgType.value = 'error'
  } finally {
    saving.value = false
  }
}

// 头像上传（两个入口共用）
function handleAvatarChange(e) {
  const file = e.target.files?.[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    errors.avatar = '图片大小不能超过 2MB'
    return
  }

  errors.avatar = ''

  const reader = new FileReader()
  reader.onload = () => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const size = 128
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')

      const minSide = Math.min(img.width, img.height)
      const sx = (img.width - minSide) / 2
      const sy = (img.height - minSide) / 2
      ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size)

      let dataUrl
      try {
        dataUrl = canvas.toDataURL('image/webp', 0.8)
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        }
      } catch {
        dataUrl = canvas.toDataURL('image/jpeg', 0.8)
      }
      tempAvatar.value = dataUrl
    }
    img.onerror = () => {
      tempAvatar.value = reader.result
    }
    img.src = reader.result
  }
  reader.readAsDataURL(file)
}

onMounted(async () => {
  user.value = await getUser() || defaultUser
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

/* Profile Card */
.profile-card {
  margin: 0 20px 24px;
  background: #141414;
  border-radius: 20px;
  padding: 20px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.profile-avatar {
  width: 64px;
  height: 64px;
  border-radius: 32px;
  background: linear-gradient(135deg, #39ff14, #00c853);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
}

.profile-avatar-img {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.profile-avatar-img.real-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-edit-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #39ff14;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-edit-icon {
  width: 12px;
  height: 12px;
  object-fit: contain;
  filter: brightness(0);
}

.profile-name {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.profile-goal {
  font-size: 13px;
  color: #39ff14;
  margin: 4px 0 0;
}

.profile-stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.profile-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.ps-value {
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  margin: 0;
  font-family: 'Inter', sans-serif;
}

.ps-label {
  font-size: 11px;
  color: #606060;
  margin: 0;
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: #2a2a2a;
}

/* Sections */
.section {
  padding: 0 20px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 12px;
}

/* Setting List */
.setting-list {
  display: flex;
  flex-direction: column;
  background: #141414;
  border-radius: 14px;
  overflow: hidden;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  font-size: 14px;
  color: #fff;
  border-bottom: 1px solid #1e1e1e;
  cursor: pointer;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
  margin-right: 10px;
  vertical-align: middle;
}

.arrow-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.setting-arrow {
  display: flex;
  align-items: center;
}

.setting-item.logout span:first-child {
  color: #ff5050;
}

/* Achievements */
.achievement-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.achievement {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: #141414;
  border-radius: 14px;
}

.achievement.locked {
  opacity: 0.5;
}

.ach-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.ach-name {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.ach-status {
  font-size: 12px;
  color: #606060;
}

.achievement:not(.locked) .ach-status {
  color: #39ff14;
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
  padding: 20px 16px 0 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

/* Form Fields */
.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
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
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.field-input:focus {
  border-color: #39ff14;
}

.field-error-border {
  border-color: #ff5050;
}

.field-error {
  font-size: 12px;
  color: #ff5050;
  margin: 0;
}

/* Avatar Upload */
.avatar-upload {
  display: flex;
  align-items: center;
  gap: 14px;
}

.avatar-upload-img {
  width: 56px;
  height: 56px;
  border-radius: 28px;
  object-fit: cover;
  background: #1e1e1e;
  flex-shrink: 0;
}

.avatar-upload-placeholder {
  opacity: 0.3;
}

.avatar-upload-mask {
  position: relative;
}

.avatar-upload-plus {
  width: 56px;
  height: 56px;
  border-radius: 28px;
  object-fit: contain;
  opacity: 0.6;
}

.avatar-upload-hint {
  font-size: 12px;
  color: #606060;
}

/* Goal Options */
.goal-options {
  display: flex;
  gap: 10px;
}

.goal-option {
  flex: 1;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #141414;
  font-size: 14px;
  font-weight: 600;
  color: #606060;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.goal-option.active {
  border-color: #39ff14;
  background: rgba(57, 255, 20, 0.1);
  color: #39ff14;
}

/* Save Message */
.save-msg {
  text-align: center;
  font-size: 13px;
  color: #39ff14;
  margin: -8px 0 0;
}

.save-msg.error {
  color: #ff5050;
}

/* Save Button */
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
  transition: opacity 0.2s;
}

.modal-save:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.modal-save:active:not(:disabled) {
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
