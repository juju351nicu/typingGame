import type { CurrentWord } from "@/types/interfaces";
import {
  getRandomWordLeft,
  getResponsiveBalloonWidth,
} from "@/composables/useTypingBoardLayout";
import type { Ref } from "vue";

interface TypingWordSpawnerOptions {
  /** 単語表示エリアの要素参照 */
  wordsBoard: Readonly<Ref<HTMLElement | null>>;
  /** PC幅で使用する風船幅 */
  defaultBalloonWidth: () => number;
  /** 表示中単語リストへ単語を追加する処理 */
  addTypingWord: (left: number, top: number) => CurrentWord | null;
  /** 次に打つキー表示を更新する処理 */
  updateNextKey: () => void;
}

/**
 * 単語表示エリアのサイズに合わせて、出題単語の追加位置を決める。
 *
 * DOMサイズの取得、レスポンシブな風船幅の見積もり、単語追加後の次キー更新を
 * まとめ、TypingPanel.vue 側には表示とライフサイクル接続だけを残す。
 *
 * @param options 単語追加に必要なDOM参照とコールバック
 */
export const useTypingWordSpawner = (options: TypingWordSpawnerOptions) => {
  /** 単語表示エリアの横幅を取得する。 */
  const getWordsBoardWidth = (): number | undefined => {
    return options.wordsBoard.value?.offsetWidth;
  };

  /** 単語表示エリアの縦幅を取得する。 */
  const getWordsBoardHeight = (): number | undefined => {
    return options.wordsBoard.value?.offsetHeight;
  };

  /** 画面幅に応じた風船の想定幅を取得する。 */
  const getBalloonWidth = (): number => {
    return getResponsiveBalloonWidth(
      getWordsBoardWidth(),
      options.defaultBalloonWidth()
    );
  };

  /** 表示するタイピング単語の横位置を生成する。 */
  const getRandomPosition = (): number => {
    return getRandomWordLeft(getWordsBoardWidth(), getBalloonWidth());
  };

  /** 表示するタイピング単語を追加する。 */
  const addWord = (): CurrentWord | null => {
    const addedWord = options.addTypingWord(
      getRandomPosition(),
      getWordsBoardHeight() ?? 0
    );
    if (addedWord !== null) {
      options.updateNextKey();
    }
    return addedWord;
  };

  return {
    getWordsBoardWidth,
    getWordsBoardHeight,
    getBalloonWidth,
    getRandomPosition,
    addWord,
  };
};
