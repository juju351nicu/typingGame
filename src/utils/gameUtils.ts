import dayjs from "dayjs";
import Const from "@/constants/const";
import type { GameScore, RankingScore } from "@/types/interfaces";
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
 * @returns ランキング表示用スコア一覧
 */
const createRankingScores = (
  scores: GameScore[],
  selectedMode: number | null = null
): RankingScore[] => {
  return scores
    .filter((item) => selectedMode === null || item.mode === selectedMode)
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
  getColor,
  getLevel,
  getCurrentTime,
  // assertNever
};
