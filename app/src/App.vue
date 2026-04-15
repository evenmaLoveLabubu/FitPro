<template>
  <div id="app">
    <router-view />
    <TabBar v-if="showTabBar" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TabBar from './components/TabBar.vue'

const route = useRoute()

const showTabBar = computed(() => {
  if (route.meta.hideTabBar) return false
  const hideOn = ['/workout', '/checkin', '/login']
  return !hideOn.some(path => route.path.startsWith(path))
})
</script>

<style>
@import './assets/styles/global.css';
</style>
