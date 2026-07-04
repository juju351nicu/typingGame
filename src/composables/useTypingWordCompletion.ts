import { handleCompletedWord } from "@/composables/useCompletedWordHandler";
import type { CurrentWord } from "@/types/interfaces";

interface TypingWordCompletionOptions {
  /** 現在表示している単語リスト */
  currentWords: CurrentWord[];
  /** 入力欄の現在値 */
  inputValue: string;
  /** 破裂アニメーションが終わるまでの待機時間 */
  burstAnimationDuration: number;
  /** 入力欄を空に戻す処理 */
  clearInput: () => void;
  /** スコアを加算する処理 */
  addGameScore: (delta: number) => void;
  /** 正タイプ数を加算する処理 */
  addCorrectCharacterCount: (delta: number) => void;
  /** 遅延実行する処理をタイマー管理へ登録する処理 */
  registerTimeout: (callback: () => void, duration: number) => void;
  /** 表示中リストから単語を削除する処理 */
  removeWord: (word: CurrentWord) => void;
  /** すべての単語を処理し終えたか確認する処理 */
  checkGameCompleted: () => void;
  /** 次に入力すべきキーを更新する処理 */
  updateNextKey: () => void;
}

/**
 * 入力完了した単語がある場合に、TypingPanelの状態更新へ反映する。
 *
 * handleCompletedWord のスコア加算結果を、ゲームスコアと正タイプ数それぞれの
 * 更新処理へ振り分ける。
 *
 * @param options 完了単語処理と状態更新に必要な値
 * @returns 完了単語を処理した場合はtrue
 */
export const completeTypingWord = (
  options: TypingWordCompletionOptions
): boolean => {
  return handleCompletedWord({
    currentWords: options.currentWords,
    inputValue: options.inputValue,
    burstAnimationDuration: options.burstAnimationDuration,
    clearInput: options.clearInput,
    addScore: (scoreDelta, correctCharacterDelta) => {
      options.addGameScore(scoreDelta);
      options.addCorrectCharacterCount(correctCharacterDelta);
    },
    registerTimeout: options.registerTimeout,
    removeWord: options.removeWord,
    checkGameCompleted: options.checkGameCompleted,
    updateNextKey: options.updateNextKey,
  });
};
