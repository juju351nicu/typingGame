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
    <label>タイマー</label>
    <span>{{ timeLabel }}</span>
  </div>
</template>
