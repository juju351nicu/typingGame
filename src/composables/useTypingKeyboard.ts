import type { currentWord } from "@/types/interfaces";

export const normalizeAlphabetKey = (key: string): string => {
  const normalizedKey = key.toLowerCase();
  return /^[a-z]$/.test(normalizedKey) ? normalizedKey : "";
};

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

export const isMissKey = (pressedKey: string, nextKey: string): boolean => {
  const normalizedPressedKey = normalizeAlphabetKey(pressedKey);
  const normalizedNextKey = normalizeAlphabetKey(nextKey);

  return (
    normalizedPressedKey !== "" &&
    normalizedNextKey !== "" &&
    normalizedPressedKey !== normalizedNextKey
  );
};
