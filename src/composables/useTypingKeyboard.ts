import type { CurrentWord } from "@/types/interfaces";
import Util from "@/utils/gameUtils";

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
  currentWords: CurrentWord[],
  inputValue: string
): string => {
  // 破裂中の単語は、次キー候補から外す。
  const visibleWords = currentWords.filter((word) => !word.isBursting);

  // 入力中の単語があればそれを優先し、なければ先頭の表示単語を案内する。
  const targetWord =
    visibleWords.find((word) => {
      return (
        !word.isBursting && word.characters.join("").startsWith(inputValue)
      );
    }) ?? visibleWords[0];

  if (targetWord == null) {
    return "";
  }

  const nextIndex = targetWord.characters
    .slice(0, inputValue.length)
    .findIndex((character, index) => character !== inputValue[index]);

  // 入力途中で食い違った場合は、食い違った位置の正しいキーを返す。
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
  // Shift や記号など、対象外キーはミス扱いにしない。
  const normalizedPressedKey = normalizeAlphabetKey(pressedKey);
  const normalizedNextKey = normalizeAlphabetKey(nextKey);

  return (
    !Util.isEmpty(normalizedPressedKey, { trimString: false }) &&
    !Util.isEmpty(normalizedNextKey, { trimString: false }) &&
    normalizedPressedKey !== normalizedNextKey
  );
};
