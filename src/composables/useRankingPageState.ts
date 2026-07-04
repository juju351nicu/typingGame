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

interface GameScoresReader {
  getGameScoreList: GameScore[];
}

/** ランキング表の列定義 */
export const rankingHeaders = [
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

/** パフォーマンス推移で選択できる指標 */
export const trendMetricOptions: {
  title: string;
  value: PerformanceTrendMetric;
  unit: string;
}[] = [
  { title: "スコア", value: "score", unit: "" },
  { title: "WPM", value: "wpm", unit: "" },
  { title: "正確率", value: "accuracy", unit: "%" },
];

/**
 * ランク表示用CSSクラスを取得する。
 *
 * @param rank 順位
 * @returns 順位に応じたCSSクラス
 */
export const getRankingRankClass = (rank: number): string => {
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

/**
 * 未保存のメトリクス値をハイフン表示へ変換する。
 *
 * @param value 表示対象の値
 * @returns 表示用文字列
 */
export const formatNullableMetric = (
  value: number | string | null | undefined
): string => {
  return value != null ? String(value) : "-";
};

/**
 * 正確率を表示用文字列へ変換する。
 *
 * @param value 正確率
 * @returns 表示用文字列
 */
export const formatAccuracyMetric = (
  value: number | null | undefined
): string => {
  return value != null ? `${value}%` : "-";
};

/**
 * ランキング画面の表示状態と集計値を管理する。
 *
 * フィルター、ランキング一覧、最高スコア、パフォーマンス推移をまとめ、
 * RankingPage.vue 側を表示に集中させる。
 *
 * @param gameScoresStore 保存済みスコアを参照するstore
 * @returns ランキング画面で使用する状態と集計値
 */
export const useRankingPageState = (gameScoresStore: GameScoresReader) => {
  /** ランキング表の1ページあたりの表示件数 */
  const itemsPerPage = ref(Const.NUMBER_OF_ITEMS);

  /** ランキング表の表示件数の選択肢 */
  const pages = Const.DATA_TABLE_PAGES;

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

  /** タイムアタックのゲームルール値 */
  const timeAttackGameRule = Const.GAME_RULE.TIME_ATTACK;

  /** 難易度フィルターの選択肢 */
  const modeOptions = [
    { title: "すべて", value: null },
    ...Const.DIFFICULTY_LEVEL,
  ];

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

  /** 推移グラフ値の表示 */
  const getTrendValueLabel = (item: PerformanceTrendItem): string => {
    return `${item.metricValue}${selectedTrendMetricOption.value.unit}`;
  };

  /** リザルトランクの色を取得する。 */
  const getResultRankColor = (rank: string): string => {
    return Util.getResultRankColor(rank);
  };

  /** 難易度の色を取得する。 */
  const getModeColor = (mode: number): string => {
    return Util.getColor(mode);
  };

  /** 難易度の表示名を取得する。 */
  const getModeLabel = (mode: number): string => {
    return Util.getLevel(mode);
  };

  /** スコアに保存されたゲームルールを取得する。 */
  const getScoreGameRule = (score: GameScore): GameRule => {
    return Util.getGameRule(score);
  };

  /** スコアに保存されたゲームルールの表示名を取得する。 */
  const getScoreGameRuleLabel = (score: GameScore): string => {
    return Util.getScoreGameRuleLabel(score);
  };

  /** タイムアタック制限時間の表示名を取得する。 */
  const getTimeLimitLabel = (score: GameScore): string => {
    return Util.getTimeLimitLabel(score);
  };

  return {
    activeTimeLimitSeconds,
    bestScore,
    bestScoreSummary,
    gameRuleOptions,
    gameScores,
    formatAccuracyMetric,
    formatNullableMetric,
    getModeColor,
    getModeLabel,
    getResultRankColor,
    getScoreGameRule,
    getScoreGameRuleLabel,
    getTimeLimitLabel,
    getTrendValueLabel,
    headers: rankingHeaders,
    isTimeAttackSelected,
    itemsPerPage,
    modeOptions,
    normalBestScore,
    normalBestScoreSummary,
    pages,
    performanceTrendItems,
    rankingItems,
    selectedGameRule,
    selectedMode,
    selectedRankingTab,
    selectedTimeLimitSeconds,
    selectedTrendMetric,
    selectedTrendMetricOption,
    timeAttackBestScore,
    timeAttackBestScoreSummary,
    timeAttackGameRule,
    timeLimitOptions,
    trendMetricOptions,
    trendTitle,
  };
};
