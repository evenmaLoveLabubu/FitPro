<template>
  <nav class="tab-bar">
    <div class="tab-bar-inner">
      <router-link
        v-for="tab in tabs"
        :key="tab.path"
        :to="tab.path"
        class="tab-item"
        :class="{ active: currentPath === tab.path }"
      >
        <img :src="tab.icon" class="tab-icon" :alt="tab.label" />
        <span class="tab-label">{{ tab.label }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const currentPath = computed(() => route.path)

const tabs = [
  { path: '/', icon: new URL('../assets/images/home.png', import.meta.url).href, label: '首页' },
  { path: '/plan', icon: new URL('../assets/images/target.png', import.meta.url).href, label: '计划' },
  { path: '/stats', icon: new URL('../assets/images/trendingup.png', import.meta.url).href, label: '统计' },
  { path: '/profile', icon: new URL('../assets/images/user.png', import.meta.url).href, label: '我的' }
]
</script>

<style scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 72px;
  background: rgba(10, 10, 10, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px 16px;
  z-index: 100;
}

.tab-bar-inner {
  width: 100%;
  height: 56px;
  background: #1a1a1a;
  border-radius: 28px;
  border: 1px solid #2a2a2a;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
  max-width: 400px;
}

.tab-item {
  flex: 1;
  height: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  text-decoration: none;
  border-radius: 24px;
  transition: background 0.2s;
}

.tab-item.active {
  background: #39ff14;
}

.tab-icon {
  width: 20px;
  height: 20px;
  line-height: 1;
  object-fit: contain;
  filter: brightness(0) saturate(100%) invert(57%) sepia(82%) saturate(1500%) hue-rotate(97deg) brightness(100%) contrast(105%);
}

.tab-label {
  font-size: 10px;
  font-weight: 600;
  color: #39ff14;
  font-family: 'Inter', sans-serif;
}

.tab-item.active .tab-icon {
  filter: brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%);
}

.tab-item.active .tab-label {
  color: #0a0a0a;
}
</style>
