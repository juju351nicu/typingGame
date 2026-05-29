import type { currentWord } from "@/types/interfaces";

export const balloonColorClasses = [
  "balloon-red",
  "balloon-blue",
  "balloon-green",
  "balloon-yellow",
  "balloon-purple",
];

export const getRandomBalloonColorClass = (): string => {
  const index = Math.floor(Math.random() * balloonColorClasses.length);
  return balloonColorClasses[index];
};

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

export const findCompletedWordIndex = (
  currentWords: currentWord[],
  inputValue: string
): number => {
  return currentWords.findIndex(
    (word) => !word.isBursting && word.characters.join("") === inputValue
  );
};

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
