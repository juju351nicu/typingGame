<script setup lang="ts">
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Bar, Line } from "vue-chartjs";
import { computed } from "vue";
import AppButtonToggle from "@/components/AppButtonToggle.vue";
import AppStateMessage from "@/components/AppStateMessage.vue";
import { useConfigStore } from "@/stores/config";
import {
  createRankDistributionChartData,
  createRankDistributionChartOptions,
  createResultRankDistribution,
  createTrendLineChartData,
  createTrendLineChartOptions,
  getChartTheme,
} from "@/utils/chartUtils";
import type {
  PerformanceTrendItem,
  PerformanceTrendMetric,
  RankingScore,
} from "@/types/interfaces";

// 使う部品だけを登録し、Chart.js全体をバンドルに含めない。
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
);

interface TrendMetricOption {
  title: string;
  value: PerformanceTrendMetric;
  unit: string;
}

interface RankingTrendPanelProps {
  modelValue: PerformanceTrendMetric;
  performanceTrendItems: PerformanceTrendItem[];
  rankingItems: RankingScore[];
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

/** 表示テーマを参照するストア */
const configStore = useConfigStore();

/** 表示テーマに合わせたグラフの配色 */
const chartTheme = computed(() => getChartTheme(configStore.getDisplayMode));

/** 選択中の指標の表示設定 */
const selectedMetricOption = computed((): TrendMetricOption => {
  return (
    props.trendMetricOptions.find(
      (option) => option.value === props.modelValue
    ) ?? props.trendMetricOptions[0]
  );
});

/** 推移の折れ線グラフ用データ */
const trendChartData = computed(() =>
  createTrendLineChartData(
    props.performanceTrendItems,
    selectedMetricOption.value.title,
    chartTheme.value
  )
);

/** 推移の折れ線グラフ設定 */
const trendChartOptions = computed(() =>
  createTrendLineChartOptions(chartTheme.value, selectedMetricOption.value.unit)
);

/** リザルトランクごとの件数 */
const rankDistribution = computed(() =>
  createResultRankDistribution(props.rankingItems)
);

/** ランク分布の棒グラフ用データ */
const rankChartData = computed(() =>
  createRankDistributionChartData(rankDistribution.value, chartTheme.value)
);

/** ランク分布の棒グラフ設定 */
const rankChartOptions = computed(() =>
  createRankDistributionChartOptions(chartTheme.value)
);

/** 画面読み上げ向けのグラフ説明 */
const trendChartLabel = computed((): string => {
  const values = props.performanceTrendItems
    .map((item) => `${item.playNumber}回目 ${props.getTrendValueLabel(item)}`)
    .join("、");
  return `${props.trendTitle}の折れ線グラフ。${values}`;
});

/** 画面読み上げ向けのランク分布の説明 */
const rankChartLabel = computed((): string => {
  const values = rankDistribution.value
    .map((item) => `${item.rank}ランク ${item.count}回`)
    .join("、");
  return `リザルトランク分布の棒グラフ。${values}`;
});
</script>
<template>
  <section class="trend-panel">
    <div class="trend-panel__header">
      <h2>{{ trendTitle }}</h2>
      <p>現在のフィルターに一致する新しい10件を、プレイ順に表示します。</p>
    </div>
    <AppButtonToggle
      v-model="selectedTrendMetric"
      :items="trendMetricOptions"
      variant="outlined"
      aria-label="表示する指標"
      class="trend-metric-toggle"
    />
    <template v-if="performanceTrendItems.length > 0">
      <div class="trend-chart" data-testid="trend-line-chart">
        <Line
          :data="trendChartData"
          :options="trendChartOptions"
          role="img"
          :aria-label="trendChartLabel"
        />
      </div>
      <details class="chart-table">
        <summary>表で見る</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">プレイ</th>
              <th scope="col">{{ selectedMetricOption.title }}</th>
              <th scope="col">日付</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in performanceTrendItems"
              :key="`${item.date}-${item.score}-${item.time}`"
            >
              <td>{{ item.playNumber }}回目</td>
              <td>{{ getTrendValueLabel(item) }}</td>
              <td>{{ item.date }}</td>
            </tr>
          </tbody>
        </table>
      </details>

      <div class="trend-panel__header trend-panel__header--sub">
        <h2>リザルトランク分布</h2>
        <p>現在のフィルターに一致する全プレイを、ランク別に数えます。</p>
      </div>
      <div
        class="trend-chart trend-chart--bar"
        data-testid="rank-distribution-chart"
      >
        <Bar
          :data="rankChartData"
          :options="rankChartOptions"
          role="img"
          :aria-label="rankChartLabel"
        />
      </div>
      <details class="chart-table">
        <summary>表で見る</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">ランク</th>
              <th scope="col">プレイ回数</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in rankDistribution" :key="item.rank">
              <td>{{ item.rank }}</td>
              <td>{{ item.count }}回</td>
            </tr>
          </tbody>
        </table>
      </details>
    </template>
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

.trend-panel__header--sub {
  margin-top: 28px;
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

.trend-metric-toggle :deep(.app-btn-toggle__button) {
  min-width: 92px;
  text-transform: none;
}

/* Chart.jsはresponsive設定で親要素の大きさに合わせて描画するため、高さを親で決める。 */
.trend-chart {
  height: 240px;
  max-width: 760px;
  position: relative;
}

.trend-chart--bar {
  height: 200px;
}

.chart-table {
  color: var(--app-text-muted);
  font-size: 1.3rem;
  margin-top: 10px;
  max-width: 760px;
}

.chart-table summary {
  cursor: pointer;
}

.chart-table table {
  border-collapse: collapse;
  margin-top: 8px;
  width: 100%;
}

.chart-table th,
.chart-table td {
  border-bottom: 1px solid var(--app-border);
  color: var(--app-text);
  padding: 6px 8px;
  text-align: start;
}

@media (max-width: 720px) {
  .trend-panel {
    padding: 0;
  }

  .trend-metric-toggle {
    max-width: 100%;
    overflow-x: auto;
  }

  .trend-chart {
    height: 200px;
  }

  .trend-chart--bar {
    height: 180px;
  }
}
</style>
