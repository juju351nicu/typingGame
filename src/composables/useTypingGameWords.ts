import { ref, toRaw } from "vue";
import type { currentWord } from "@/types/interfaces";
import { createCurrentWord, shuffleWords } from "@/composables/useTypingWords";

/**
 * 表示中の単語リストと出題済みインデックスを管理する。
 *
 * 単語の追加・削除・リセットをまとめ、TypingPanel側が単語リストの
 * 内部状態を直接組み立てすぎないようにする。
 *
 * @param initialWords 出題対象の単語リスト
 */
export const useTypingGameWords = (initialWords: string[]) => {
  /** タイピング用単語リスト */
  const typingWords = ref<string[]>([...initialWords]);
  /** 現在表示している単語リスト */
  const currentWords = ref<currentWord[]>([]);
  /** 次に追加する単語の索引 */
  const currentWordIndex = ref(0);

  /** 単語リストをシャッフルする。 */
  const shuffleTypingWords = (): void => {
    // 元の単語順に偏らないよう、出題前に表示順を入れ替える。
    typingWords.value = shuffleWords(typingWords.value);
  };

  /**
   * すべての単語を画面へ追加済みか判定する。
   *
   * @returns 追加済みならtrue
   */
  const isAddedAllWords = (): boolean => {
    return typingWords.value.length === currentWordIndex.value;
  };

  /**
   * 指定位置に次の単語を追加する。
   *
   * @param left 表示開始位置の横座標
   * @param top 表示開始位置の縦座標
   * @returns 追加した単語。追加対象がない場合はnull
   */
  const addWord = (left: number, top: number): currentWord | null => {
    if (isAddedAllWords()) {
      return null;
    }

    // currentWordIndex が指す次の単語を、画面表示用の形へ変換する。
    const word = createCurrentWord(
      typingWords.value[currentWordIndex.value],
      left,
      top
    );
    currentWords.value.push(word);
    currentWordIndex.value++;
    return word;
  };

  /**
   * 指定した単語を表示中リストから削除する。
   *
   * @param targetWord 削除対象の単語
   */
  const removeWord = (targetWord: currentWord): void => {
    // Vue の Proxy と元オブジェクトのどちらで渡されても削除できるようにする。
    const currentIndex = currentWords.value.findIndex(
      (item) => item === targetWord || toRaw(item) === targetWord
    );
    if (currentIndex !== -1) {
      currentWords.value.splice(currentIndex, 1);
    }
  };

  /**
   * すべての単語を追加し、表示中の単語もなくなったか判定する。
   *
   * @returns ゲーム完了状態ならtrue
   */
  const isGameCompleted = (): boolean => {
    return isAddedAllWords() && currentWords.value.length === 0;
  };

  /** 表示中単語と出題インデックスを初期化し、単語リストをシャッフルする。 */
  const resetWords = (): void => {
    // リトライ時に前回の表示中単語や出題位置を持ち越さないよう初期化する。
    currentWords.value = [];
    currentWordIndex.value = 0;
    shuffleTypingWords();
  };

  return {
    typingWords,
    currentWords,
    currentWordIndex,
    shuffleTypingWords,
    isAddedAllWords,
    addWord,
    removeWord,
    isGameCompleted,
    resetWords,
  };
};
