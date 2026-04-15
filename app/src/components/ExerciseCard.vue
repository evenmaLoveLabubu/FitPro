<template>
  <div class="exercise-card" :class="{ current: isCurrent, completed: isCompleted }">
    <div class="exercise-number">{{ index + 1 }}</div>
    <div class="exercise-info">
      <div class="exercise-name">{{ exercise.name }}</div>
      <div class="exercise-detail">{{ exercise.sets }}组 x {{ exercise.reps }}{{ exercise.unit }}</div>
    </div>
    <div class="exercise-status">
      <span v-if="isCurrent">进行中</span>
      <span v-else-if="isCompleted" class="done">&#10003;</span>
      <span v-else>待完成</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  exercise: { type: Object, required: true },
  index: { type: Number, required: true },
  isCurrent: { type: Boolean, default: false },
  isCompleted: { type: Boolean, default: false }
})
</script>

<style scoped>
.exercise-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  background: #141414;
}

.exercise-card.current {
  background: rgba(57, 255, 20, 0.08);
  border: 1px solid rgba(57, 255, 20, 0.25);
}

.exercise-card.completed {
  opacity: 0.6;
}

.exercise-number {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #1e1e1e;
  color: #a0a0a0;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}

.exercise-card.current .exercise-number {
  background: #39ff14;
  color: #0a0a0a;
}

.exercise-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.exercise-name {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
}

.exercise-detail {
  font-size: 12px;
  color: #606060;
}

.exercise-card.current .exercise-detail {
  color: #39ff14;
}

.exercise-status {
  font-size: 11px;
  font-weight: 600;
  color: #606060;
}

.exercise-card.current .exercise-status {
  color: #39ff14;
}

.exercise-card.completed .exercise-status {
  color: #39ff14;
}

.done {
  color: #39ff14;
}
</style>
