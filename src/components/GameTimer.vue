<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useStopwatchTimer } from "@/composables/useStopwatchTimer";

interface TimerProps {
  accumTime: number;
}

const props = defineProps<TimerProps>();

const emit = defineEmits<{
  "update:accumTime": [value: number];
}>();

/** 計測時間 */
const accumTime = computed({
  get: () => props.accumTime,
  set: (value) => emit("update:accumTime", value),
});

const { resetTimer, startTimer, stopTimer, timeLabel } =
  useStopwatchTimer(accumTime);

// ページ表示時に実行
onMounted(() => {
  startTimer();
});
// defineExpose を使用してコンポーネント内に定義されたメソッドを親コンポーネントから参照できる様にしています。
defineExpose({ startTimer, stopTimer, resetTimer });
</script>
<template>
  <div class="game-status-item">
    <span class="game-status-label">経過時間</span>
    <span role="timer" aria-label="経過時間">{{ timeLabel }}</span>
  </div>
</template>
<style scoped>
.game-status-label {
  color: var(--app-text-muted);
  display: block;
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 6px;
}

.game-status-item span {
  color: var(--app-text);
  display: block;
  font-size: 1.65rem;
  font-weight: bold;
  line-height: 1.2;
  white-space: nowrap;
}

@media (max-width: 760px) {
  .game-status-item span {
    font-size: 1.45rem;
  }
}

@media (max-width: 480px) {
  .game-status-item span {
    font-size: 1.25rem;
  }
}
</style>
