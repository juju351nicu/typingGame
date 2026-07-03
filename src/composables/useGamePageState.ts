import type { GameScore } from "@/types/interfaces";
import { ref } from "vue";

/**
 * 初期状態のゲームスコアを生成する。
 *
 * @returns 初期状態のゲームスコア
 */
export const createEmptyGameScore = (): GameScore => ({
  score: 0,
  mode: 0,
  time: "",
  date: "",
});

/**
 * ゲーム画面で保持するプレイ状態を管理する。
 *
 * GamePage.vueに散らばりやすいスコア、入力値、ミス状態などをまとめ、
 * リトライ時の初期化漏れをテストしやすい形にする。
 */
export const useGamePageState = () => {
  /** ゲームスタートフラグ */
  const isGameStarted = ref(false);
  /** 経過時間 */
  const accumTime = ref(0);
  /** タイピングされている単語 */
  const inputValue = ref("");
  /** ゲームオーバー判定フラグ */
  const isGameOver = ref(false);
  /** ゲームスコア */
  const gameScore = ref(0);
  /** 入力した文字数 */
  const typedCharacterCount = ref(0);
  /** ミスした文字数 */
  const missCount = ref(0);
  /** 正しく入力した文字数 */
  const correctCharacterCount = ref(0);
  /** 入力中の文字が現在の単語と一致していないか */
  const isInputMiss = ref(false);
  /** 次に入力すべきキー */
  const nextKey = ref("");
  /** 最後に取得したゲームスコア */
  const lastScore = ref<GameScore>(createEmptyGameScore());

  /** ゲーム画面で保持するプレイ状態を初期状態へ戻す。 */
  const resetGamePageState = (): void => {
    isGameStarted.value = false;
    accumTime.value = 0;
    inputValue.value = "";
    isGameOver.value = false;
    gameScore.value = 0;
    typedCharacterCount.value = 0;
    missCount.value = 0;
    correctCharacterCount.value = 0;
    isInputMiss.value = false;
    nextKey.value = "";
    lastScore.value = createEmptyGameScore();
  };

  return {
    accumTime,
    correctCharacterCount,
    gameScore,
    inputValue,
    isGameOver,
    isGameStarted,
    isInputMiss,
    lastScore,
    missCount,
    nextKey,
    resetGamePageState,
    typedCharacterCount,
  };
};
