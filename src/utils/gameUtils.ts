import dayjs from "dayjs";
import Const from "@/constants/const";
import type {
  GameRule,
  GameScore,
  PerformanceTrendItem,
  PerformanceTrendMetric,
  RankingScore,
  TimeLimitSeconds,
} from "@/types/interfaces";
/**
 * 値があるかどうか判定する。
 * リストの場合は空かどうかを判定する。
 * @param target 値
 * @returns 判定結果
 */
const isEmpty = (target: string | unknown[] | null | undefined): boolean => {
  if (target === null || target === undefined) {
    return true;
  }
  if (typeof target === "string" && target === "") {
    return true;
  }
  if (target instanceof Array && target.length <= 0) {
    return true;
  }
  return false;
};

/**
 * ブラウザがHTML5ローカルストレージをサポートしているかどうかを判断する
 */
const isLocalStorage = (): boolean => {
  try {
    if ("localStorage" in window && window["localStorage"] !== null) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

/**
 * 何のブラウザかをチェックする
 */
const checkBrowser = (): boolean => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  if (userAgent.indexOf("msie") != -1 || userAgent.indexOf("trident") != -1) {
    return false;
  } else if (userAgent.indexOf("edge") != -1) {
    return false;
  } else if (userAgent.indexOf("chrome") != -1) {
    return true;
  } else if (userAgent.indexOf("safari") != -1) {
    return false;
  } else if (userAgent.indexOf("firefox") != -1) {
    return false;
  } else if (userAgent.indexOf("opera") != -1) {
    return false;
  } else {
    return false;
  }
};

/**
 * 計測時間を返却する。
 * @param accumTime
 * @returns 計測時間
 */
const getCountDownTime = (accumTime: number): string => {
  // this.time is milliseconds
  const currentTime = accumTime;
  const milliseconds = currentTime % 1000;
  // 1秒 = 1000ミリ秒
  const seconds = Math.floor((currentTime / 1000) % 60);
  // 1分 = 60 * 1000ミリ秒
  const minutes = Math.floor((currentTime / (60 * 1000)) % 60);
  // 1時間 = 60 * 60 * 1000ミリ秒
  const hours = Math.floor(currentTime / (60 * 60 * 1000));

  const millisecondsMultiplyTen = Math.floor(milliseconds / 10);

  const millisecondsStr = ("0" + millisecondsMultiplyTen).slice(-2);
  const secondsStr = ("0" + seconds).slice(-2);
  const minutesStr = ("0" + minutes).slice(-2);
  const hoursStr = hours < 100 ? ("0" + hours).slice(-2) : hours;

  return `${hoursStr}:${minutesStr}:${secondsStr}.${millisecondsStr}`;
};

/**
 * WPMを計算する。
 * @param correctCharacterCount 正しく入力できた文字数
 * @param accumTime 計測時間(ms)
 * @returns WPM
 */
const calculateWpm = (
  correctCharacterCount: number,
  accumTime: number
): number => {
  if (correctCharacterCount <= 0 || accumTime <= 0) {
    return 0;
  }
  const minutes = accumTime / 1000 / 60;
  const words = correctCharacterCount / 5;
  return Math.round(words / minutes);
};

/**
 * 正確率を計算する。
 * @param typedCharacterCount 入力した文字数
 * @param missCount ミスした文字数
 * @returns 正確率
 */
const calculateAccuracy = (
  typedCharacterCount: number,
  missCount: number
): number => {
  if (typedCharacterCount <= 0) {
    return 100;
  }
  const correctCount = Math.max(typedCharacterCount - missCount, 0);
  return Math.round((correctCount / typedCharacterCount) * 100);
};

/**
 * スコアからリザルトランクを取得する。
 * @param score スコア
 * @returns リザルトランク
 */
const getResultRank = (score: number): string => {
  if (score >= 20) {
    return "S";
  }
  if (score >= 12) {
    return "A";
  }
  if (score >= 6) {
    return "B";
  }
  return "C";
};

/**
 * リザルトランクに対応する色を取得する。
 * @param rank リザルトランク
 * @returns 色コード
 */
const getResultRankColor = (rank: string): string => {
  switch (rank) {
    case "S":
      return "#ffd43b";
    case "A":
      return "#4dabf7";
    case "B":
      return "#51cf66";
    default:
      return "#868e96";
  }
};

/**
 * スコア一覧をランキング表示用に整形する。
 * @param scores スコア一覧
 * @param selectedMode 絞り込み対象の難易度
 * @param selectedGameRule 絞り込み対象のゲームルール
 * @param selectedTimeLimitSeconds 絞り込み対象のタイムアタック制限時間
 * @returns ランキング表示用スコア一覧
 */
const createRankingScores = (
  scores: GameScore[],
  selectedMode: number | null = null,
  selectedGameRule: GameRule | null = null,
  selectedTimeLimitSeconds: TimeLimitSeconds | null = null
): RankingScore[] => {
  return scores
    .filter((item) => selectedMode === null || item.mode === selectedMode)
    .filter(
      (item) =>
        selectedGameRule === null || getGameRule(item) === selectedGameRule
    )
    .filter(
      (item) =>
        selectedTimeLimitSeconds === null ||
        item.timeLimitSeconds === selectedTimeLimitSeconds
    )
    .slice()
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      if (a.time !== b.time) {
        return a.time.localeCompare(b.time);
      }
      return b.date.localeCompare(a.date);
    })
    .map((item, index) => ({
      ...item,
      rank: index + 1,
      resultRank: getResultRank(item.score),
    }));
};

/**
 * スコアに保存されたゲームルールを取得する。
 *
 * 既存の保存済みスコアには gameRule が無いため、通常モードとして扱う。
 *
 * @param score スコア情報
 * @returns ゲームルール
 */
const getGameRule = (score: GameScore): GameRule => {
  return score.gameRule ?? Const.GAME_RULE.NORMAL;
};

/**
 * ゲームルールの表示名を取得する。
 * @param gameRule ゲームルール
 * @returns 表示名
 */
const getGameRuleLabel = (gameRule: GameRule): string => {
  return gameRule === Const.GAME_RULE.TIME_ATTACK ? "タイムアタック" : "通常";
};

/**
 * スコア情報からゲームルールの表示名を取得する。
 * @param score スコア情報
 * @returns 表示名
 */
const getScoreGameRuleLabel = (score: GameScore): string => {
  return getGameRuleLabel(getGameRule(score));
};

/**
 * タイムアタックの制限時間を表示用に整形する。
 * @param score スコア情報
 * @returns 制限時間表示
 */
const getTimeLimitLabel = (score: GameScore): string => {
  if (getGameRule(score) !== Const.GAME_RULE.TIME_ATTACK) {
    return "-";
  }

  return score.timeLimitSeconds ? `${score.timeLimitSeconds}秒` : "-";
};

/**
 * ランキングサマリー用にスコアの補足情報を整形する。
 * @param score ランキング表示用スコア
 * @param options ゲームルールを表示するかどうか
 * @returns ランク、難易度、必要に応じたルール、タイムをまとめた表示文字列
 */
const getRankingScoreSummary = (
  score: RankingScore,
  options: { withGameRule?: boolean } = {}
): string => {
  const items = [
    `${score.resultRank}ランク`,
    getLevel(score.mode),
  ];

  if (options.withGameRule) {
    const ruleLabel = getScoreGameRuleLabel(score);
    const ruleSummary =
      getGameRule(score) === Const.GAME_RULE.TIME_ATTACK
        ? `${ruleLabel} ${getTimeLimitLabel(score)}`
        : ruleLabel;

    items.push(ruleSummary);
  } else if (getGameRule(score) === Const.GAME_RULE.TIME_ATTACK) {
    items.push(getTimeLimitLabel(score));
  }

  items.push(score.time);
  return items.join(" / ");
};

/**
 * 直近プレイのパフォーマンス推移グラフ用データを作成する。
 *
 * ランキング順位ではなく、プレイ日時の新しいものから指定件数を取り出し、
 * 画面では古い順に左から表示できるように並べ直す。
 *
 * @param scores スコア一覧
 * @param metric 表示する指標
 * @param limit 表示する件数
 * @returns パフォーマンス推移グラフ用データ
 */
const createPerformanceTrendItems = (
  scores: GameScore[],
  metric: PerformanceTrendMetric = "score",
  limit = 5
): PerformanceTrendItem[] => {
  const recentScores = scores
    .filter((item) => item[metric] != null)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit)
    .reverse();

  const maxValue = Math.max(
    ...recentScores.map((item) => item[metric] ?? 0),
    0
  );

  return recentScores.map((item, index) => ({
    ...item,
    playNumber: index + 1,
    metricValue: item[metric] ?? 0,
    barRatio:
      maxValue > 0 ? Math.round(((item[metric] ?? 0) / maxValue) * 100) : 0,
  }));
};

/**
 * 直近プレイのスコア推移グラフ用データを作成する。
 * @param scores スコア一覧
 * @param limit 表示する件数
 * @returns スコア推移グラフ用データ
 */
const createScoreTrendItems = (
  scores: GameScore[],
  limit = 5
): PerformanceTrendItem[] => {
  return createPerformanceTrendItems(scores, "score", limit);
};

/**
 * 現在の時刻を取得する
 * @returns 現在の時刻
 */
const getCurrentTime = (): string => {
  // 現在の日時を取得
  const now = dayjs();
  return now.format(Const.DATE_FORMAT.STANDARD_DATE_TIME);
};

/**
 * チップに表示する該当の色コードを取得する
 * @param target ゲームのモード値（難易度）
 * @returns 色コード
 */
const getColor = (target: number): string => {
  switch (target) {
    case 0:
      return "#000080";
    case 1:
      return "#ff00ff";
    case 2:
      return "#ff0000";
    default:
      throw new Error(`不明なステータスです: ${target}`);
  }
};

/**
 * 該当する易〜難の値を取得する
 * @param target ゲームのモード値（難易度）
 * @returns 易〜難の値を取得する
 */
const getLevel = (target: number): string => {
  switch (target) {
    case 0:
      return "易";
    case 1:
      return "普";
    case 2:
      return "難";
    default:
      throw new Error(`不明なステータスです: ${target}`);
  }
};
// const assertNever = (x: never) => {
//   throw new Error("This code should not be called");
// };

export default {
  isEmpty,
  isLocalStorage,
  checkBrowser,
  getCountDownTime,
  calculateWpm,
  calculateAccuracy,
  getResultRank,
  getResultRankColor,
  createRankingScores,
  getGameRule,
  getGameRuleLabel,
  getScoreGameRuleLabel,
  getTimeLimitLabel,
  getRankingScoreSummary,
  createPerformanceTrendItems,
  createScoreTrendItems,
  getColor,
  getLevel,
  getCurrentTime,
  // assertNever
};
