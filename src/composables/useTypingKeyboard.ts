import type { currentWord } from "@/types/interfaces";

/**
 * キー入力値を小文字アルファベット1文字に正規化する。
 *
 * @param key KeyboardEvent.key などのキー入力値
 * @returns a-z の1文字。対象外のキーは空文字
 */
export const normalizeAlphabetKey = (key: string): string => {
  const normalizedKey = key.toLowerCase();
  return /^[a-z]$/.test(normalizedKey) ? normalizedKey : "";
};

/**
 * 現在の入力値から、次に入力すべきアルファベットキーを取得する。
 *
 * 入力中の単語が見つかる場合はその続きの文字を返し、見つからない場合は
 * 表示中の先頭単語を対象にする。破裂中の単語は判定から除外する。
 *
 * @param currentWords 現在表示している単語リスト
 * @param inputValue 入力欄の現在値
 * @returns 次に入力すべき小文字アルファベット。対象がない場合は空文字
 */
export const getNextKey = (
  currentWords: currentWord[],
  inputValue: string
): string => {
  const visibleWords = currentWords.filter((word) => !word.isBursting);
  const targetWord = visibleWords.find((word) => {
    return !word.isBursting && word.characters.join("").startsWith(inputValue);
  }) ?? visibleWords[0];

  if (targetWord == null) {
    return "";
  }

  const nextIndex = targetWord.characters
    .slice(0, inputValue.length)
    .findIndex((character, index) => character !== inputValue[index]);

  return normalizeAlphabetKey(
    targetWord.characters[nextIndex === -1 ? inputValue.length : nextIndex] ??
      ""
  );
};

/**
 * 押されたキーが次に入力すべきキーと異なるか判定する。
 *
 * @param pressedKey 実際に押されたキー
 * @param nextKey 次に入力すべきキー
 * @returns どちらもアルファベットで、かつ一致しない場合はtrue
 */
export const isMissKey = (pressedKey: string, nextKey: string): boolean => {
  const normalizedPressedKey = normalizeAlphabetKey(pressedKey);
  const normalizedNextKey = normalizeAlphabetKey(nextKey);

  return (
    normalizedPressedKey !== "" &&
    normalizedNextKey !== "" &&
    normalizedPressedKey !== normalizedNextKey
  );
};
