import type { ChartData, ChartOptions } from "chart.js";
import type { PerformanceTrendItem, RankingScore } from "@/types/interfaces";

/** リザルトランクの表示順（高い順） */
export const RESULT_RANK_ORDER = ["S", "A", "B", "C"] as const;

/** リザルトランクごとの件数 */
export interface ResultRankCount {
  rank: (typeof RESULT_RANK_ORDER)[number];
  count: number;
}

/** グラフの配色。canvasはCSS変数を読めないため、テーマごとに色を決めて渡す */
export interface ChartTheme {
  /** 系列（線・棒）の色 */
  series: string;
  /** 軸ラベルの文字色 */
  text: string;
  /** 目盛り線の色 */
  grid: string;
  /** グラフ背景の色。マーカーの縁取りに使い、線と重なっても点を見分けられるようにする */
  surface: string;
}

/**
 * 画面テーマに合わせたグラフの配色を取得する。
 *
 * 系列色はアプリのアクセントカラー（紫）を使い、ダークモードでは
 * 背景とのコントラストが取れるよう明るい紫に切り替える。
 * 文字・背景はApp.vueの --app-text-muted / --app-surface と同じ値。
 *
 * @param isDarkMode ダークモードの場合 true
 * @returns グラフの配色
 */
export const getChartTheme = (isDarkMode: boolean): ChartTheme => {
  if (isDarkMode) {
    return {
      series: "#9c7cf0",
      text: "#c4c7ce",
      grid: "rgba(255, 255, 255, 0.08)",
      surface: "#1e1f24",
    };
  }
  return {
    series: "#673ab7",
    text: "#666666",
    grid: "rgba(0, 0, 0, 0.06)",
    surface: "#ffffff",
  };
};

/**
 * ランキング用スコアをリザルトランクごとに数える。
 *
 * 件数が0のランクも含め、常にS・A・B・Cの順で返す。
 *
 * @param items ランキング用スコア一覧
 * @returns リザルトランクごとの件数
 */
export const createResultRankDistribution = (
  items: RankingScore[]
): ResultRankCount[] => {
  return RESULT_RANK_ORDER.map((rank) => ({
    rank,
    count: items.filter((item) => item.resultRank === rank).length,
  }));
};

/**
 * パフォーマンス推移の折れ線グラフ用データを作成する。
 *
 * @param items 推移グラフ表示用データ（古い順）
 * @param label 系列名（ツールチップに表示する指標名）
 * @param theme グラフの配色
 * @returns Chart.jsの折れ線グラフ用データ
 */
export const createTrendLineChartData = (
  items: PerformanceTrendItem[],
  label: string,
  theme: ChartTheme
): ChartData<"line"> => {
  return {
    labels: items.map((item) => `${item.playNumber}回目`),
    datasets: [
      {
        label,
        data: items.map((item) => item.metricValue),
        borderColor: theme.series,
        backgroundColor: theme.series,
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBorderColor: theme.surface,
        pointBorderWidth: 2,
        tension: 0,
      },
    ],
  };
};

/**
 * リザルトランク分布の棒グラフ用データを作成する。
 *
 * @param distribution リザルトランクごとの件数
 * @param theme グラフの配色
 * @returns Chart.jsの棒グラフ用データ
 */
export const createRankDistributionChartData = (
  distribution: ResultRankCount[],
  theme: ChartTheme
): ChartData<"bar"> => {
  return {
    labels: distribution.map((item) => `${item.rank}ランク`),
    datasets: [
      {
        label: "プレイ回数",
        data: distribution.map((item) => item.count),
        backgroundColor: theme.series,
        borderRadius: { topLeft: 4, topRight: 4 },
        borderSkipped: "bottom",
        maxBarThickness: 48,
      },
    ],
  };
};

/**
 * 推移グラフのY軸の最大値を取得する。
 *
 * 正確率は0〜100%の割合のため、値に関わらず100%を上限に固定する。
 *
 * @param unit 指標の単位
 * @returns Y軸の最大値。自動で決める場合はundefined
 */
export const getTrendAxisMax = (unit: string): number | undefined => {
  return unit === "%" ? 100 : undefined;
};

/**
 * 折れ線・棒グラフで共通の軸設定を作成する。
 *
 * @param theme グラフの配色
 * @returns 軸設定
 */
const createAxisOptions = (theme: ChartTheme) => {
  return {
    x: {
      grid: { display: false },
      border: { color: theme.grid },
      ticks: { color: theme.text },
    },
    y: {
      beginAtZero: true,
      grid: { color: theme.grid },
      border: { display: false },
      ticks: { color: theme.text, precision: 0 },
    },
  };
};

/**
 * パフォーマンス推移の折れ線グラフ設定を作成する。
 *
 * 系列は1つのため凡例は出さず、見出しで指標名を示す。
 * 点の上でなくても、横位置が近いプレイの値をツールチップで表示する。
 *
 * @param theme グラフの配色
 * @param unit 指標の単位
 * @returns Chart.jsの折れ線グラフ設定
 */
export const createTrendLineChartOptions = (
  theme: ChartTheme,
  unit: string
): ChartOptions<"line"> => {
  const axes = createAxisOptions(theme);
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${context.parsed.y}${unit}`,
        },
      },
    },
    scales: {
      ...axes,
      y: { ...axes.y, max: getTrendAxisMax(unit) },
    },
  };
};

/**
 * リザルトランク分布の棒グラフ設定を作成する。
 *
 * @param theme グラフの配色
 * @returns Chart.jsの棒グラフ設定
 */
export const createRankDistributionChartOptions = (
  theme: ChartTheme
): ChartOptions<"bar"> => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.parsed.y}回`,
        },
      },
    },
    scales: createAxisOptions(theme),
  };
};
