import type { currentWord } from "@/types/interfaces";

/** 風船に割り当てるCSSクラス一覧 */
export const balloonColorClasses = [
  "balloon-red",
  "balloon-blue",
  "balloon-green",
  "balloon-yellow",
  "balloon-purple",
];

/**
 * 風船色のCSSクラスをランダムに1つ返す。
 *
 * @returns 風船色を表すCSSクラス名
 */
export const getRandomBalloonColorClass = (): string => {
  const index = Math.floor(Math.random() * balloonColorClasses.length);
  return balloonColorClasses[index];
};

/**
 * 単語リストを元配列を変更せずにシャッフルする。
 *
 * @param words シャッフル対象の単語リスト
 * @returns シャッフル後の新しい単語リスト
 */
export const shuffleWords = (words: string[]): string[] => {
  const shuffledWords = [...words];
  for (let index = shuffledWords.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const tempWord = shuffledWords[index];
    shuffledWords[index] = shuffledWords[randomIndex];
    shuffledWords[randomIndex] = tempWord;
  }
  return shuffledWords;
};

/**
 * 画面に表示するタイピング単語オブジェクトを生成する。
 *
 * @param word 表示する単語
 * @param left 表示開始位置の横座標
 * @param top 表示開始位置の縦座標
 * @returns 表示用の単語情報
 */
export const createCurrentWord = (
  word: string,
  left: number,
  top: number
): currentWord => ({
  characters: word.split(""),
  classList: [],
  balloonClass: getRandomBalloonColorClass(),
  style: {
    left: `${left}px`,
    top: `${top}px`,
  },
});

/**
 * 入力値に応じて、各文字へ correct / incorrect の表示クラスを付与する。
 *
 * @param currentWords 現在表示している単語リスト
 * @param inputValue 入力欄の現在値
 * @returns 文字ごとの表示クラスを反映した単語リスト
 */
export const applyCharacterFeedback = (
  currentWords: currentWord[],
  inputValue: string
): currentWord[] => {
  const inputCharacters = inputValue.split("");
  currentWords.forEach((word) => {
    word.classList = word.characters.map((character, index) => {
      if (inputCharacters[index] == null) {
        return "";
      }
      return character === inputCharacters[index] ? "correct" : "incorrect";
    });
  });
  return currentWords;
};

/**
 * 入力値が表示中のいずれかの単語の先頭と一致しているか判定する。
 *
 * @param currentWords 現在表示している単語リスト
 * @param inputValue 入力欄の現在値
 * @returns 入力値が空、またはいずれかの単語の先頭と一致している場合はtrue
 */
export const hasMatchedPrefix = (
  currentWords: currentWord[],
  inputValue: string
): boolean => {
  if (inputValue === "") {
    return true;
  }
  return currentWords.some(
    (word) =>
      !word.isBursting && word.characters.join("").startsWith(inputValue)
  );
};

/**
 * 入力が完了した単語の位置を取得する。
 *
 * @param currentWords 現在表示している単語リスト
 * @param inputValue 入力欄の現在値
 * @returns 完全一致した単語のインデックス。一致しない場合は -1
 */
export const findCompletedWordIndex = (
  currentWords: currentWord[],
  inputValue: string
): number => {
  return currentWords.findIndex(
    (word) => !word.isBursting && word.characters.join("") === inputValue
  );
};

/**
 * 単語全体に付与する入力状態のCSSクラスを返す。
 *
 * @param word 判定対象の単語
 * @param inputValue 入力欄の現在値
 * @param isInputMiss 現在の入力がミス状態か
 * @returns active / miss を表すCSSクラス名。対象外の場合は空文字
 */
export const getWordFeedbackClass = (
  word: currentWord,
  inputValue: string,
  isInputMiss: boolean
): string => {
  if (inputValue === "" || word.isBursting) {
    return "";
  }
  if (word.characters.join("").startsWith(inputValue)) {
    return "word-active";
  }
  if (isInputMiss) {
    return "word-miss";
  }
  return "";
};
