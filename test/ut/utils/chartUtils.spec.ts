import {
  createRankDistributionChartData,
  createRankDistributionChartOptions,
  createResultRankDistribution,
  createTrendLineChartData,
  createTrendLineChartOptions,
  getChartTheme,
  getTrendAxisMax,
} from "@/utils/chartUtils";
import type { PerformanceTrendItem, RankingScore } from "@/types/interfaces";
import { describe, expect, it } from "vitest";

const createRankingScore = (resultRank: string): RankingScore => ({
  score: 10,
  mode: 1,
  time: "00:00:30.00",
  date: "2026-05-24 12:00:00",
  rank: 1,
  resultRank,
});

const trendItems: PerformanceTrendItem[] = [
  {
    score: 8,
    mode: 1,
    time: "00:00:30.00",
    date: "2026-05-24 12:00:00",
    playNumber: 1,
    metricValue: 8,
    barRatio: 67,
  },
  {
    score: 12,
    mode: 1,
    time: "00:00:28.00",
    date: "2026-05-24 12:10:00",
    playNumber: 2,
    metricValue: 12,
    barRatio: 100,
  },
];

describe("getChartTheme", () => {
  it("ライトモードではアクセントカラーの紫と白背景を使う", () => {
    expect(getChartTheme(false)).toEqual({
      series: "#673ab7",
      text: "#666666",
      grid: "rgba(0, 0, 0, 0.06)",
      surface: "#ffffff",
    });
  });

  it("ダークモードでは背景とのコントラストが取れる明るい紫を使う", () => {
    expect(getChartTheme(true)).toEqual({
      series: "#9c7cf0",
      text: "#c4c7ce",
      grid: "rgba(255, 255, 255, 0.08)",
      surface: "#1e1f24",
    });
  });
});

describe("createResultRankDistribution", () => {
  it("ランクごとの件数をS・A・B・Cの順で数える", () => {
    const items = ["A", "S", "A", "C"].map(createRankingScore);

    expect(createResultRankDistribution(items)).toEqual([
      { rank: "S", count: 1 },
      { rank: "A", count: 2 },
      { rank: "B", count: 0 },
      { rank: "C", count: 1 },
    ]);
  });

  it("スコアがない場合もすべてのランクを0件で返す", () => {
    expect(createResultRankDistribution([])).toEqual([
      { rank: "S", count: 0 },
      { rank: "A", count: 0 },
      { rank: "B", count: 0 },
      { rank: "C", count: 0 },
    ]);
  });
});

describe("createTrendLineChartData", () => {
  it("プレイ順のラベルと指標値で1系列の折れ線を作る", () => {
    const theme = getChartTheme(false);
    const result = createTrendLineChartData(trendItems, "スコア", theme);

    expect(result.labels).toEqual(["1回目", "2回目"]);
    expect(result.datasets).toHaveLength(1);
    expect(result.datasets[0]).toMatchObject({
      label: "スコア",
      data: [8, 12],
      borderColor: "#673ab7",
      borderWidth: 2,
      pointRadius: 4,
      pointBorderColor: "#ffffff",
    });
  });
});

describe("createRankDistributionChartData", () => {
  it("ランク名のラベルと件数で棒グラフを作る", () => {
    const theme = getChartTheme(true);
    const result = createRankDistributionChartData(
      [
        { rank: "S", count: 2 },
        { rank: "A", count: 0 },
      ],
      theme
    );

    expect(result.labels).toEqual(["Sランク", "Aランク"]);
    expect(result.datasets[0]).toMatchObject({
      label: "プレイ回数",
      data: [2, 0],
      backgroundColor: "#9c7cf0",
    });
  });
});

describe("getTrendAxisMax", () => {
  it("正確率は100%を上限にする", () => {
    expect(getTrendAxisMax("%")).toBe(100);
  });

  it("単位のない指標は上限を自動で決める", () => {
    expect(getTrendAxisMax("")).toBeUndefined();
  });
});

describe("createTrendLineChartOptions", () => {
  it("凡例を出さず、横位置の近い点のツールチップに単位付きで表示する", () => {
    const options = createTrendLineChartOptions(getChartTheme(false), "%");
    const label = options.plugins?.tooltip?.callbacks?.label as (
      context: unknown
    ) => string;

    expect(options.plugins?.legend?.display).toBe(false);
    expect(options.interaction).toEqual({ mode: "index", intersect: false });
    expect(options.scales?.y?.max).toBe(100);
    expect(label({ dataset: { label: "正確率" }, parsed: { y: 96 } })).toBe(
      "正確率: 96%"
    );
  });

  it("単位のない指標は上限を固定しない", () => {
    const options = createTrendLineChartOptions(getChartTheme(false), "");

    const yScale = options.scales?.y as { beginAtZero?: boolean };

    expect(options.scales?.y?.max).toBeUndefined();
    expect(yScale.beginAtZero).toBe(true);
  });
});

describe("グラフの表示設定", () => {
  it("親要素の大きさに合わせて描画し、アニメーションしない", () => {
    const theme = getChartTheme(false);

    for (const options of [
      createTrendLineChartOptions(theme, ""),
      createRankDistributionChartOptions(theme),
    ]) {
      expect(options.responsive).toBe(true);
      expect(options.maintainAspectRatio).toBe(false);
      expect(options.animation).toBe(false);
    }
  });

  it("目盛り線は横線だけを薄く引き、軸の文字はテーマの文字色にする", () => {
    const theme = getChartTheme(true);

    expect(createRankDistributionChartOptions(theme).scales).toEqual({
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
    });
  });

  it("棒は上端だけを角丸にし、太さの上限を設ける", () => {
    const result = createRankDistributionChartData(
      [{ rank: "S", count: 1 }],
      getChartTheme(false)
    );

    expect(result.datasets[0]).toMatchObject({
      borderRadius: { topLeft: 4, topRight: 4 },
      borderSkipped: "bottom",
      maxBarThickness: 48,
    });
  });
});

describe("createRankDistributionChartOptions", () => {
  it("ツールチップに回数を表示し、目盛りは整数にする", () => {
    const options = createRankDistributionChartOptions(getChartTheme(false));
    const label = options.plugins?.tooltip?.callbacks?.label as (
      context: unknown
    ) => string;
    const yScale = options.scales?.y as { ticks?: { precision?: number } };

    expect(options.plugins?.legend?.display).toBe(false);
    expect(yScale.ticks?.precision).toBe(0);
    expect(label({ parsed: { y: 3 } })).toBe("3回");
  });
});
