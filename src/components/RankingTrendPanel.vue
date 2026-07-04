<script setup lang="ts">
import AppStateMessage from "@/components/AppStateMessage.vue";
import type {
  PerformanceTrendItem,
  PerformanceTrendMetric,
} from "@/types/interfaces";
import { computed } from "vue";

interface TrendMetricOption {
  title: string;
  value: PerformanceTrendMetric;
  unit: string;
}

interface RankingTrendPanelProps {
  modelValue: PerformanceTrendMetric;
  performanceTrendItems: PerformanceTrendItem[];
  trendMetricOptions: TrendMetricOption[];
  trendTitle: string;
  getTrendValueLabel: (item: PerformanceTrendItem) => string;
}

const props = defineProps<RankingTrendPanelProps>();

const emit = defineEmits<{
  "update:modelValue": [value: PerformanceTrendMetric];
}>();

const selectedTrendMetric = computed({
  get: (): PerformanceTrendMetric => props.modelValue,
  set: (value: PerformanceTrendMetric) => emit("update:modelValue", value),
});
</script>
<template>
  <section class="trend-panel">
    <div class="trend-panel__header">
      <h2>{{ trendTitle }}</h2>
      <p>現在のフィルターに一致する新しい5件を、プレイ順に表示します。</p>
    </div>
    <v-btn-toggle
      v-model="selectedTrendMetric"
      class="trend-metric-toggle"
      color="primary"
      density="comfortable"
      mandatory
      variant="outlined"
    >
      <v-btn
        v-for="option in trendMetricOptions"
        :key="option.value"
        :value="option.value"
      >
        {{ option.title }}
      </v-btn>
    </v-btn-toggle>
    <div v-if="performanceTrendItems.length > 0" class="trend-bars">
      <div
        v-for="item in performanceTrendItems"
        :key="`${item.date}-${item.score}-${item.time}`"
        class="trend-item"
      >
        <span class="trend-value">{{ getTrendValueLabel(item) }}</span>
        <div class="trend-bar-track">
          <div class="trend-bar" :style="{ height: `${item.barRatio}%` }" />
        </div>
        <span class="trend-label">{{ item.playNumber }}回目</span>
      </div>
    </div>
    <AppStateMessage
      v-else
      type="empty"
      title="表示できる履歴がありません"
      message="ゲームをプレイすると推移が表示されます。"
    />
  </section>
</template>
<style scoped>
.trend-panel {
  background: var(--app-surface);
}

.trend-panel__header {
  margin-bottom: 14px;
}

.trend-panel__header h2 {
  color: var(--app-text);
  font-size: 1.8rem;
  line-height: 1.3;
  margin: 0;
}

.trend-panel__header p {
  color: var(--app-text-muted);
  font-size: 1.3rem;
  margin: 6px 0 0;
}

.trend-metric-toggle {
  margin-bottom: 18px;
}

.trend-metric-toggle :deep(.v-btn) {
  min-width: 92px;
  text-transform: none;
}

.trend-bars {
  align-items: end;
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(5, minmax(54px, 1fr));
  max-width: 760px;
  min-height: 132px;
}

.trend-item {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.trend-value {
  color: var(--app-text);
  font-size: 1.4rem;
  font-weight: bold;
}

.trend-bar-track {
  align-items: end;
  background: var(--app-track-bg);
  border-radius: 8px;
  display: flex;
  height: 88px;
  overflow: hidden;
  width: 100%;
}

.trend-bar {
  background: #673ab7;
  border-radius: 8px 8px 0 0;
  min-height: 4px;
  width: 100%;
}

.trend-label {
  color: var(--app-text-muted);
  font-size: 1.2rem;
  text-align: center;
}

@media (max-width: 720px) {
  .trend-panel {
    padding: 0;
  }

  .trend-metric-toggle {
    max-width: 100%;
    overflow-x: auto;
  }

  .trend-bars {
    gap: 10px;
    grid-template-columns: repeat(5, minmax(44px, 1fr));
    min-height: 118px;
  }

  .trend-bar-track {
    height: 78px;
  }
}
</style>
