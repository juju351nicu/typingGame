import { watch, type Ref } from "vue";
import { handleTypingInputChange } from "@/composables/useTypingInputChange";
import {
  resetTypingGame,
  startTypingGame,
} from "@/composables/useTypingGameLifecycle";
import type { CurrentWord } from "@/types/interfaces";

interface TypingPanelWatchersOptions {
  /** ゲームスタートフラグ */
  isGameStartedFlag: Ref<boolean>;
  /** リセットフラグ */
  isResetFlag: Ref<boolean>;
  /** 入力欄の値 */
  typeBoxValue: Ref<string>;
  /** 現在表示している単語リスト */
  currentWords: Ref<CurrentWord[]>;
  /** ゲームオーバーフラグ */
  isGameOverFlag: Ref<boolean>;
  /** 入力した文字数 */
  typedCharacterCount: Ref<number>;
  /** ミスした文字数 */
  missCount: Ref<number>;
  /** 入力ミス状態 */
  isInputMiss: Ref<boolean>;
  /** 既存のゲーム用タイマーを停止する処理 */
  stopTimers: () => void;
  /** 開始時点のゲーム設定を保存する処理 */
  saveGameMode: () => void;
  /** 単語追加・単語移動タイマーを開始する処理 */
  startTimers: Parameters<typeof startTypingGame>[0]["startTimers"];
  /** 表示するタイピング単語を追加する処理 */
  addWord: () => void;
  /** 表示中単語を移動する処理 */
  moveWords: () => void;
  /** ゲームオーバー判定を実行する処理 */
  checkGameOver: () => void;
  /** 単語追加間隔を取得する処理 */
  getAddWordInterval: () => number;
  /** 単語移動間隔を取得する処理 */
  getMoveWordInterval: () => number;
  /** 表示中単語と出題順を初期化する処理 */
  resetWords: () => void;
  /** 次に打つキー表示を更新する処理 */
  updateNextKey: () => void;
  /** 完了単語の判定とスコア加算を行う処理 */
  checkWordEquality: (word: string) => void;
  /** 単語ごとの入力フィードバックを更新する処理 */
  checkCharacter: (typeBox: string) => void;
}

/**
 * TypingPanel.vue の状態変化に応じた副作用を登録する。
 *
 * ゲーム開始・入力変更・リセットの watch をまとめ、TypingPanel.vue 側を
 * 表示部品とゲーム処理の接続に集中させる。
 *
 * @param options watchに必要な状態とコールバック
 */
export const useTypingPanelWatchers = (
  options: TypingPanelWatchersOptions
): void => {
  watch(options.isGameStartedFlag, (newValue) => {
    if (newValue) {
      startTypingGame({
        stopTimers: options.stopTimers,
        saveGameMode: options.saveGameMode,
        startTimers: options.startTimers,
        addWord: options.addWord,
        moveWords: options.moveWords,
        checkGameOver: options.checkGameOver,
        addWordInterval: options.getAddWordInterval(),
        moveWordInterval: options.getMoveWordInterval(),
      });
    } else {
      options.stopTimers();
    }
  });

  watch(options.typeBoxValue, (newValue, oldValue) => {
    handleTypingInputChange({
      currentWords: options.currentWords.value,
      newValue,
      oldValue,
      isGameOver: options.isGameOverFlag.value,
      addTypedCharacterCount: (delta) => {
        options.typedCharacterCount.value += delta;
      },
      addMissCount: (delta) => {
        options.missCount.value += delta;
      },
      setInputMiss: (value) => {
        options.isInputMiss.value = value;
      },
      checkWordEquality: options.checkWordEquality,
      checkCharacter: options.checkCharacter,
      updateNextKey: options.updateNextKey,
    });
  });

  watch(options.isResetFlag, (newValue) => {
    if (newValue) {
      resetTypingGame({
        stopTimers: options.stopTimers,
        resetWords: options.resetWords,
        resetInputMiss: () => {
          options.isInputMiss.value = false;
        },
        updateNextKey: options.updateNextKey,
      });
    }
  });
};
