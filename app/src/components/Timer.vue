<template>
  <div class="timer-display" :class="{ active: isRunning }">
    <div class="timer-ring">
      <svg viewBox="0 0 72 72" class="ring-svg">
        <circle cx="36" cy="36" r="33" class="ring-bg" />
        <circle
          cx="36" cy="36" r="33"
          class="ring-progress"
          :style="{ strokeDashoffset: progressOffset }"
        />
      </svg>
      <div class="timer-text">
        <span class="timer-value">{{ displayTime }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  seconds: { type: Number, default: 0 },
  isRunning: { type: Boolean, default: false },
  autoStart: { type: Boolean, default: false }
})

const emit = defineEmits(['tick', 'complete'])

const remaining = ref(props.seconds)
let interval = null

const displayTime = computed(() => {
  const m = Math.floor(remaining.value / 60)
  const s = remaining.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const progressOffset = computed(() => {
  const circumference = 2 * Math.PI * 33
  const total = props.seconds || 1
  const progress = remaining.value / total
  return circumference * (1 - progress)
})

function start() {
  stop()
  interval = setInterval(() => {
    if (remaining.value > 0) {
      remaining.value--
      emit('tick', remaining.value)
    } else {
      stop()
      emit('complete')
    }
  }, 1000)
}

function stop() {
  if (interval) {
    clearInterval(interval)
    interval = null
  }
}

function reset() {
  stop()
  remaining.value = props.seconds
}

watch(() => props.isRunning, (val) => {
  if (val) start()
  else stop()
})

watch(() => props.seconds, (val) => {
  remaining.value = val
})

onUnmounted(() => stop())

defineExpose({ start, stop, reset, remaining })
</script>

<style scoped>
.timer-display {
  width: 72px;
  height: 72px;
  position: relative;
}

.timer-ring {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 3px solid #39ff14;
  background: #0d2818;
}

.ring-svg {
  position: absolute;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring-bg {
  fill: none;
  stroke: rgba(57, 255, 20, 0.15);
  stroke-width: 3;
}

.ring-progress {
  fill: none;
  stroke: #39ff14;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-dasharray: 207.35;
  transition: stroke-dashoffset 0.5s ease;
}

.timer-text {
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.timer-value {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  font-family: 'Inter', sans-serif;
}
</style>
