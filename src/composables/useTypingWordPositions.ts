import type { currentWord } from "@/types/interfaces";

const DEFAULT_TOP_REACHED_THRESHOLD = -120;

export const getWordTop = (word: currentWord): number => {
  return Number(word.style.top.slice(0, -2));
};

export const moveWordUp = (word: currentWord, distance = 1): void => {
  word.style.top = `${getWordTop(word) - distance}px`;
};

export const moveWordsUp = (words: currentWord[], distance = 1): void => {
  words.forEach((word) => {
    moveWordUp(word, distance);
  });
};

export const hasReachedTop = (
  word: currentWord,
  threshold = DEFAULT_TOP_REACHED_THRESHOLD
): boolean => {
  return !word.isBursting && getWordTop(word) < threshold;
};

export const hasAnyWordReachedTop = (
  words: currentWord[],
  threshold = DEFAULT_TOP_REACHED_THRESHOLD
): boolean => {
  return words.some((word) => hasReachedTop(word, threshold));
};
