
<template>
  <router-view></router-view>
</template>
<script lang="ts" setup>
import { getCurrentInstance } from 'vue';

window.app = getCurrentInstance();
</script>
