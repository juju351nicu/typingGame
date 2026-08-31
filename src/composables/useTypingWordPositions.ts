import type { CurrentWord } from "@/types/interfaces";

const DEFAULT_TOP_REACHED_THRESHOLD = -120;

/**
 * 単語の現在の縦位置を数値で取得する。
 *
 * @param word 位置を取得する単語
 * @returns CSSのtop値からpxを除いた数値
 */
export const getWordTop = (word: CurrentWord): number => {
  // style.top は "100px" の形式なので、px を外して数値化する。
  return Number(word.style.top.slice(0, -2));
};

/**
 * 単語を指定距離だけ上方向へ移動する。
 *
 * @param word 移動する単語
 * @param distance 上方向へ移動する距離
 */
export const moveWordUp = (word: CurrentWord, distance = 1): void => {
  word.style.top = `${getWordTop(word) - distance}px`;
};

/**
 * 表示中の単語をまとめて上方向へ移動する。
 *
 * @param words 移動する単語リスト
 * @param distance 上方向へ移動する距離
 */
export const moveWordsUp = (words: CurrentWord[], distance = 1): void => {
  words.forEach((word) => {
    moveWordUp(word, distance);
  });
};

/**
 * 単語がゲームオーバー判定位置に到達したか判定する。
 *
 * @param word 判定対象の単語
 * @param threshold 到達判定に使う縦位置
 * @returns 破裂中ではない単語が判定位置を超えた場合はtrue
 */
export const hasReachedTop = (
  word: CurrentWord,
  threshold = DEFAULT_TOP_REACHED_THRESHOLD
): boolean => {
  // 破裂中の単語はゲームオーバー判定の対象外にする。
  return !word.isBursting && getWordTop(word) < threshold;
};

/**
 * 表示中のいずれかの単語がゲームオーバー判定位置に到達したか判定する。
 *
 * @param words 判定対象の単語リスト
 * @param threshold 到達判定に使う縦位置
 * @returns 到達済みの単語が1つでもある場合はtrue
 */
export const hasAnyWordReachedTop = (
  words: CurrentWord[],
  threshold = DEFAULT_TOP_REACHED_THRESHOLD
): boolean => {
  return words.some((word) => hasReachedTop(word, threshold));
};

/**
 * 風船の上部到達によってゲーム終了するか判定する。
 *
 * 通常モードでは上部到達をゲーム終了条件にし、
 * タイムアタックでは制限時間を優先するため上部到達では終了しない。
 *
 * @param words 判定対象の単語リスト
 * @param shouldFinishOnWordReachedTop 上部到達を終了条件にするか
 * @param threshold 到達判定に使う縦位置
 * @returns ゲーム終了する場合はtrue
 */
export const shouldFinishByWordReachedTop = (
  words: CurrentWord[],
  shouldFinishOnWordReachedTop: boolean,
  threshold = DEFAULT_TOP_REACHED_THRESHOLD
): boolean => {
  return shouldFinishOnWordReachedTop && hasAnyWordReachedTop(words, threshold);
};
