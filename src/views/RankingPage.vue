<script setup lang="ts">
import AppStateMessage from "@/components/AppStateMessage.vue";
import { useGameScoresStore } from "@/stores/gameScores";
import { computed, ref, watch } from "vue";
import Const from "@/constants/const";
import Util from "@/utils/gameUtils";
import type {
  GameRule,
  GameScore,
  PerformanceTrendItem,
  PerformanceTrendMetric,
  RankingScore,
  TimeLimitSeconds,
} from "@/types/interfaces";

/** 保存済みスコアを管理するストア */
const gameScoresStore = useGameScoresStore();

/** ランキング表の1ページあたりの表示件数 */
const itemsPerPage = ref(Const.NUMBER_OF_ITEMS);

/** ランキング表の表示件数の選択肢 */
const pages = Const.DATA_TABLE_PAGES;

/** ランキング表の列定義 */
const headers = [
  { title: "順位", align: "start", key: "rank" },
  { title: "スコア", align: "end", key: "score" },
  { title: "ランク", align: "center", key: "resultRank" },
  { title: "WPM", align: "end", key: "wpm" },
  { title: "正タイプ", align: "end", key: "correctCharacterCount" },
  { title: "正確率", align: "end", key: "accuracy" },
  { title: "ミス", align: "end", key: "missCount" },
  { title: "難易度", align: "start", key: "mode" },
  { title: "ルール", align: "start", key: "gameRule" },
  { title: "制限時間", align: "start", key: "timeLimitSeconds" },
  { title: "タイム", align: "start", key: "time" },
  { title: "日付", align: "end", key: "date" },
] as const;

/** 難易度フィルター */
const selectedMode = ref<number | null>(null);

/** ゲームルールフィルター */
const selectedGameRule = ref<GameRule | null>(null);

/** タイムアタック制限時間フィルター */
const selectedTimeLimitSeconds = ref<TimeLimitSeconds | null>(null);

/** ランキング画面で選択中の表示タブ */
const selectedRankingTab = ref("summary");

/** パフォーマンス推移で選択中の指標 */
const selectedTrendMetric = ref<PerformanceTrendMetric>("score");

/** 難易度フィルターの選択肢 */
const modeOptions = [{ title: "すべて", value: null }, ...Const.DIFFICULTY_LEVEL];

/** ゲームルールフィルターの選択肢 */
const gameRuleOptions = [
  { title: "すべて", value: null },
  ...Const.GAME_RULE_OPTIONS,
];

/** 制限時間フィルターの選択肢 */
const timeLimitOptions = [
  { title: "すべて", value: null },
  ...Const.TIME_ATTACK_LIMITS,
];

/** 推移グラフの指標選択肢 */
const trendMetricOptions: {
  title: string;
  value: PerformanceTrendMetric;
  unit: string;
}[] = [
  { title: "スコア", value: "score", unit: "" },
  { title: "WPM", value: "wpm", unit: "" },
  { title: "正確率", value: "accuracy", unit: "%" },
];

/** 制限時間フィルターを表示するか */
const isTimeAttackSelected = computed((): boolean => {
  return selectedGameRule.value === Const.GAME_RULE.TIME_ATTACK;
});

/** ランキング絞り込みに使う制限時間 */
const activeTimeLimitSeconds = computed((): TimeLimitSeconds | null => {
  return isTimeAttackSelected.value ? selectedTimeLimitSeconds.value : null;
});

watch(isTimeAttackSelected, (isSelected) => {
  if (!isSelected) {
    selectedTimeLimitSeconds.value = null;
  }
});

/** スコア一覧 */
const gameScores = computed((): GameScore[] => {
  return gameScoresStore.getGameScoreList;
});

/** ランキング用スコア一覧 */
const rankingItems = computed((): RankingScore[] => {
  return Util.createRankingScores(
    gameScores.value,
    selectedMode.value,
    selectedGameRule.value,
    activeTimeLimitSeconds.value
  );
});

/** 直近プレイのパフォーマンス推移 */
const performanceTrendItems = computed((): PerformanceTrendItem[] => {
  return Util.createPerformanceTrendItems(
    rankingItems.value,
    selectedTrendMetric.value
  );
});

/** 選択中の推移グラフ指標 */
const selectedTrendMetricOption = computed(() => {
  return (
    trendMetricOptions.find(
      (item) => item.value === selectedTrendMetric.value
    ) ?? trendMetricOptions[0]
  );
});

/** 推移グラフの見出し */
const trendTitle = computed((): string => {
  return `直近${selectedTrendMetricOption.value.title}推移`;
});

/** 推移グラフ値の表示 */
const getTrendValueLabel = (item: PerformanceTrendItem): string => {
  return `${item.metricValue}${selectedTrendMetricOption.value.unit}`;
};

/** 最高スコア */
const bestScore = computed((): RankingScore | null => {
  return rankingItems.value[0] ?? null;
});

/** 通常モードの最高スコア */
const normalBestScore = computed((): RankingScore | null => {
  return (
    Util.createRankingScores(
      gameScores.value,
      selectedMode.value,
      Const.GAME_RULE.NORMAL
    )[0] ?? null
  );
});

/** タイムアタックの最高スコア */
const timeAttackBestScore = computed((): RankingScore | null => {
  return (
    Util.createRankingScores(
      gameScores.value,
      selectedMode.value,
      Const.GAME_RULE.TIME_ATTACK,
      activeTimeLimitSeconds.value
    )[0] ?? null
  );
});

/** 最高スコアの補足表示 */
const bestScoreSummary = computed((): string => {
  if (!bestScore.value) {
    return "記録なし";
  }

  // ランク・難易度・ルール・タイムを1行で確認できるようにする。
  return Util.getRankingScoreSummary(bestScore.value, { withGameRule: true });
});

/** 通常モード最高スコアの補足表示 */
const normalBestScoreSummary = computed((): string => {
  if (!normalBestScore.value) {
    return "記録なし";
  }

  return Util.getRankingScoreSummary(normalBestScore.value);
});

/** タイムアタック最高スコアの補足表示 */
const timeAttackBestScoreSummary = computed((): string => {
  if (!timeAttackBestScore.value) {
    return "記録なし";
  }

  return Util.getRankingScoreSummary(timeAttackBestScore.value);
});

/** ランク表示用CSSクラス */
const getRankClass = (rank: number): string => {
  if (rank === 1) {
    return "rank-first";
  }
  if (rank === 2) {
    return "rank-second";
  }
  if (rank === 3) {
    return "rank-third";
  }
  return "rank-normal";
};
</script>
<template>
  <v-container class="score-board">
    <div class="score-header">
      <div>
        <p class="score-title">Ranking</p>
        <p class="score-subtitle">localStorage に保存されたプレイ履歴です。</p>
      </div>
      <v-select
        v-model="selectedMode"
        :items="modeOptions"
        item-title="title"
        item-value="value"
        label="難易度"
        variant="outlined"
        density="comfortable"
        hide-details
        class="ranking-filter"
      />
      <v-select
        v-model="selectedGameRule"
        :items="gameRuleOptions"
        item-title="title"
        item-value="value"
        label="ルール"
        variant="outlined"
        density="comfortable"
        hide-details
        class="ranking-filter"
      />
      <v-select
        v-if="isTimeAttackSelected"
        v-model="selectedTimeLimitSeconds"
        :items="timeLimitOptions"
        item-title="title"
        item-value="value"
        label="制限時間"
        variant="outlined"
        density="comfortable"
        hide-details
        class="ranking-filter"
      />
    </div>

    <section class="ranking-tabs-panel">
      <v-tabs
        v-model="selectedRankingTab"
        align-tabs="start"
        class="ranking-tabs"
        color="primary"
        density="comfortable"
      >
        <v-tab value="summary">サマリー</v-tab>
        <v-tab value="trend">分析</v-tab>
        <v-tab value="table">ランキング表</v-tab>
      </v-tabs>

      <v-window v-model="selectedRankingTab" class="ranking-window">
        <v-window-item value="summary">
          <div class="summary-grid">
            <div class="summary-card best-score-card">
              <span class="summary-label">最高スコア</span>
              <span class="summary-value">{{ bestScore?.score ?? "-" }}</span>
              <span class="summary-note">{{ bestScoreSummary }}</span>
            </div>
            <div class="summary-card">
              <span class="summary-label">通常ベスト</span>
              <span class="summary-value">
                {{ normalBestScore?.score ?? "-" }}
              </span>
              <span class="summary-note">{{ normalBestScoreSummary }}</span>
            </div>
            <div class="summary-card">
              <span class="summary-label">タイムアタックベスト</span>
              <span class="summary-value">
                {{ timeAttackBestScore?.score ?? "-" }}
              </span>
              <span class="summary-note">{{ timeAttackBestScoreSummary }}</span>
            </div>
            <div class="summary-card">
              <span class="summary-label">プレイ回数</span>
              <span class="summary-value">{{ gameScores.length }}</span>
              <span class="summary-note">保存済みプレイ回数</span>
            </div>
            <div class="summary-card">
              <span class="summary-label">表示件数</span>
              <span class="summary-value">{{ rankingItems.length }}</span>
              <span class="summary-note">現在の表示件数</span>
            </div>
          </div>
        </v-window-item>

        <v-window-item value="trend">
          <section class="trend-panel">
            <div class="trend-panel__header">
              <h2>{{ trendTitle }}</h2>
              <p>
                現在のフィルターに一致する新しい5件を、プレイ順に表示します。
              </p>
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
                  <div
                    class="trend-bar"
                    :style="{ height: `${item.barRatio}%` }"
                  />
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
        </v-window-item>

        <v-window-item value="table">
          <v-data-table
            v-model:items-per-page="itemsPerPage"
            :headers="headers"
            :items="rankingItems"
            :items-per-page-options="pages"
            items-per-page-text="表示行数"
            no-data-text="まだスコアがありません。ゲームをプレイするとここに表示されます。"
            class="ranking-table elevation-1"
          >
            <template v-slot:item.rank="{ value }">
              <span class="rank-badge" :class="getRankClass(value)">
                {{ value }}位
              </span>
            </template>
            <template v-slot:item.score="{ value }">
              <span class="score-cell">{{ value }}</span>
            </template>
            <template v-slot:item.resultRank="{ value }">
              <span
                class="result-rank-badge"
                :style="{ backgroundColor: Util.getResultRankColor(value) }"
              >
                {{ value }}
              </span>
            </template>
            <template v-slot:item.wpm="{ value }">
              <span class="metric-cell">{{ value ?? "-" }}</span>
            </template>
            <template v-slot:item.correctCharacterCount="{ value }">
              <span class="metric-cell">{{ value ?? "-" }}</span>
            </template>
            <template v-slot:item.accuracy="{ value }">
              <span class="metric-cell">
                {{ value != null ? `${value}%` : "-" }}
              </span>
            </template>
            <template v-slot:item.missCount="{ value }">
              <span class="metric-cell">{{ value ?? "-" }}</span>
            </template>
            <template v-slot:item.mode="{ value }">
              <v-chip :color="Util.getColor(value)">
                {{ Util.getLevel(value) }}
              </v-chip>
            </template>
            <template v-slot:item.gameRule="{ item }">
              <v-chip
                :color="
                  Util.getGameRule(item) === Const.GAME_RULE.TIME_ATTACK
                    ? 'deep-purple'
                    : 'grey'
                "
                variant="tonal"
              >
                {{ Util.getScoreGameRuleLabel(item) }}
              </v-chip>
            </template>
            <template v-slot:item.timeLimitSeconds="{ item }">
              <span class="metric-cell">{{ Util.getTimeLimitLabel(item) }}</span>
            </template>
          </v-data-table>
        </v-window-item>
      </v-window>
    </section>
  </v-container>
</template>
<style scoped>
.score-board {
  max-width: 1080px;
}

.score-header {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

.score-title {
  color: #222222;
  font-size: 3.2rem;
  font-weight: bold;
  line-height: 1.2;
  margin: 0;
}

.score-subtitle {
  color: #666666;
  font-size: 1.4rem;
  margin: 8px 0 0;
}

.ranking-filter {
  flex: 1 1 180px;
  max-width: 220px;
}

.ranking-tabs-panel {
  margin-bottom: 24px;
}

.ranking-tabs {
  background: #ffffff;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 14px;
  padding: 0 12px;
}

.ranking-tabs :deep(.v-tab) {
  font-size: 1.3rem;
  font-weight: bold;
  min-width: 112px;
  text-transform: none;
}

.ranking-window {
  background: #ffffff;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 22px;
}

.summary-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.summary-card {
  background: #ffffff;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 18px 20px;
}

.best-score-card {
  border-top: 4px solid #673ab7;
}

.summary-label {
  color: #666666;
  display: block;
  font-size: 1.3rem;
  margin-bottom: 6px;
}

.summary-value {
  color: #222222;
  display: block;
  font-size: 3.2rem;
  font-weight: bold;
  line-height: 1.1;
}

.summary-note {
  color: #666666;
  display: block;
  font-size: 1.3rem;
  margin-top: 8px;
}

.trend-panel {
  background: #ffffff;
}

.trend-panel__header {
  margin-bottom: 14px;
}

.trend-panel__header h2 {
  color: #222222;
  font-size: 1.8rem;
  line-height: 1.3;
  margin: 0;
}

.trend-panel__header p {
  color: #666666;
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
  color: #222222;
  font-size: 1.4rem;
  font-weight: bold;
}

.trend-bar-track {
  align-items: end;
  background: #f1f3f5;
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
  color: #666666;
  font-size: 1.2rem;
  text-align: center;
}

.ranking-table {
  border-radius: 8px;
  overflow: hidden;
}

.ranking-table :deep(.v-table__wrapper) {
  overflow-x: auto;
}

.ranking-table :deep(th),
.ranking-table :deep(td) {
  white-space: nowrap;
}

.rank-badge {
  border-radius: 999px;
  display: inline-block;
  font-size: 1.4rem;
  font-weight: bold;
  min-width: 52px;
  padding: 4px 10px;
  text-align: center;
}

.rank-first {
  background: #fff3bf;
  color: #8a5a00;
}

.rank-second {
  background: #e9ecef;
  color: #495057;
}

.rank-third {
  background: #ffe8cc;
  color: #9c4f00;
}

.rank-normal {
  background: #edf2ff;
  color: #364fc7;
}

.score-cell {
  font-size: 1.8rem;
  font-weight: bold;
}

.result-rank-badge {
  align-items: center;
  border-radius: 50%;
  color: #ffffff;
  display: inline-flex;
  font-size: 1.2rem;
  font-weight: bold;
  height: 34px;
  justify-content: center;
  width: 34px;
}

.metric-cell {
  color: #333333;
  font-weight: bold;
}

@media (max-width: 720px) {
  .score-board {
    padding-left: 12px;
    padding-right: 12px;
  }

  .score-header {
    align-items: stretch;
    flex-direction: column;
    gap: 14px;
    margin-bottom: 18px;
  }

  .score-title {
    font-size: 2.6rem;
  }

  .score-subtitle {
    font-size: 1.2rem;
  }

  .mode-filter {
    max-width: none;
  }

  .ranking-filter {
    max-width: none;
  }

  .ranking-window {
    padding: 16px;
  }

  .ranking-tabs {
    overflow-x: auto;
    padding: 0 8px;
  }

  .ranking-tabs :deep(.v-tab) {
    min-width: 104px;
  }

  .summary-grid {
    gap: 10px;
    grid-template-columns: 1fr;
  }

  .summary-card {
    padding: 14px 16px;
  }

  .summary-value {
    font-size: 2.6rem;
  }

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

  .ranking-table :deep(table) {
    min-width: 760px;
  }
}
</style>
