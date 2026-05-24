<script setup lang="ts">
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  useTemplateRef,
  watch,
} from "vue";
import { wordsData as WORD_DATAS } from "@/assets/words";
import { useConfigStore } from "@/stores/config";
import { currentWord } from "@/types/interfaces";
const props = defineProps([
  "isGameStarted",
  "isResetTimer",
  "gameScore",
  "isGameOver",
  "inputValue",
  "typedCharacterCount",
  "missCount",
  "correctCharacterCount",
  "isInputMiss",
]);

const emit = defineEmits([
  "update:isGameOver",
  "update:gameScore",
  "update:inputValue",
  "update:typedCharacterCount",
  "update:missCount",
  "update:correctCharacterCount",
  "update:isInputMiss",
]);

/** ゲームの設定情報に関するストア情報 */
const configStore = useConfigStore();

/** ゲームスタートフラグ */
const isGameStartedFlag = computed((): boolean => {
  return props.isGameStarted;
});

/** タイピング用単語リスト */
const typingWords = ref<string[]>(WORD_DATAS);

/** リセットフラグ */
const isResetFlag = computed((): boolean => {
  return props.isResetTimer;
});

/** ゲームスコア */
const gameScore = computed({
  get: (): number => props.gameScore,
  set: (value: number) => emit("update:gameScore", value),
});

/** ゲームオーバーフラグ */
const isGameOverFlag = computed({
  get: (): boolean => props.isGameOver,
  set: (value: boolean) => emit("update:isGameOver", value),
});

/** テキストボックスに入力された値 */
const typeBoxValue = computed({
  get: (): string => props.inputValue,
  set: (value: string) => emit("update:inputValue", value),
});

/** 入力した文字数 */
const typedCharacterCount = computed({
  get: (): number => props.typedCharacterCount,
  set: (value: number) => emit("update:typedCharacterCount", value),
});

/** ミスした文字数 */
const missCount = computed({
  get: (): number => props.missCount,
  set: (value: number) => emit("update:missCount", value),
});

/** 正しく入力した文字数 */
const correctCharacterCount = computed({
  get: (): number => props.correctCharacterCount,
  set: (value: number) => emit("update:correctCharacterCount", value),
});

/** 入力が現在の単語と一致していないか */
const isInputMiss = computed({
  get: (): boolean => props.isInputMiss,
  set: (value: boolean) => emit("update:isInputMiss", value),
});

/** 現在表示している単語リスト */
const currentWords = ref<currentWord[]>([]);

/** 入力された単語があっていた場合、CSSのクラスを設定する */
const checkCharacter = (typeBox: string) => {
  const charArray: string[] = typeBox.split("");
  currentWords.value.forEach((word: currentWord, wordIndex: number) => {
    word.characters.forEach((character: string, characherIndex: number) => {
      if (charArray[characherIndex] == null) {
        currentWords.value[wordIndex].classList[characherIndex] = "";
      } else if (character == charArray[characherIndex]) {
        currentWords.value[wordIndex].classList[characherIndex] = "correct";
      } else {
        currentWords.value[wordIndex].classList[characherIndex] = "incorrect";
      }
    });
  });
};

/** 単語ごとの入力状態を返す */
const getWordFeedbackClass = (word: currentWord): string => {
  if (typeBoxValue.value === "" || word.isBursting) {
    return "";
  }
  if (word.characters.join("").startsWith(typeBoxValue.value)) {
    return "word-active";
  }
  if (isInputMiss.value) {
    return "word-miss";
  }
  return "";
};
const balloonColorClasses = [
  "balloon-red",
  "balloon-blue",
  "balloon-green",
  "balloon-yellow",
  "balloon-purple",
];
const BURST_ANIMATION_DURATION = 200;

const getRandomBalloonColorClass = (): string => {
  const index = Math.floor(Math.random() * balloonColorClasses.length);
  return balloonColorClasses[index];
};
const stopTimers = () => {
  if (addWordTimerId.value !== null) {
    clearInterval(addWordTimerId.value);
    addWordTimerId.value = null;
  }

  if (moveWordTimerId.value !== null) {
    clearInterval(moveWordTimerId.value);
    moveWordTimerId.value = null;
  }

  burstTimerIds.value.forEach((timerId) => clearTimeout(timerId));
  burstTimerIds.value = [];
};
/** ゲームを終了する */
const gameFinish = () => {
  isGameOverFlag.value = true;
  stopTimers();
};

/** 出題された単語と入力した単語の値を比較判定する */
const checkWordEquality = (word: string) => {
  const index = currentWords.value.findIndex(
    (item: currentWord) => !item.isBursting && item.characters.join("") == word
  );
  //一致した場合
  if (index != -1) {
    const targetWord = currentWords.value[index];
    targetWord.isBursting = true;
    typeBoxValue.value = "";
    gameScore.value++;
    correctCharacterCount.value += targetWord.characters.length;
    const timerId = setTimeout(() => {
      const currentIndex = currentWords.value.findIndex(
        (item) => item === targetWord
      );
      if (currentIndex !== -1) {
        currentWords.value.splice(currentIndex, 1);
      }
      burstTimerIds.value = burstTimerIds.value.filter((id) => id !== timerId);
      checkGameCompleted();
    }, BURST_ANIMATION_DURATION);
    burstTimerIds.value.push(timerId);
  }
};

/** 入力値がいずれかの単語の先頭と一致するか判定する */
const hasMatchedPrefix = (word: string): boolean => {
  if (word === "") {
    return true;
  }
  return currentWords.value.some(
    (item: currentWord) =>
      !item.isBursting && item.characters.join("").startsWith(word)
  );
};

/** 単語をシャッフルする */
const shuffleWords = () => {
  for (let index = typingWords.value.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * index);
    const tempWord = typingWords.value[index];
    typingWords.value[index] = typingWords.value[randomIndex];
    typingWords.value[randomIndex] = tempWord;
  }
};

/** 単語を表示するテンプレート要素 */
const wordsBoard = useTemplateRef("typing-panel");

/**
 *  表示される単語のHTML要素の高さを比較判定する。
 *  現在表示されている単語と「typing-panel」要素の縦幅を比較する。
 * 「typing-panel」要素の縦幅を下回った場合、ゲームを終了する。
 */
const checkIsTopToBottom = () => {
  currentWords.value.forEach((_: currentWord, index: number) => {
    // 現在表示されている単語の縦幅を取得する。
    let wordPositionTop = getCurrentWordTop(index);
    // 現在表示されている単語と「typing-panel」要素の縦幅を比較する。
    if (wordPositionTop < -120) {
      gameFinish();
    }
  });
};

/**
 * 索引に該当する、現在表示されている単語の要素の上からの配置位置（距離）を取得する
 * @param index 索引
 */
const getCurrentWordTop = (index: number) => {
  return Number(currentWords.value[index].style.top.slice(0, -2));
};

/**
 * 索引に該当する、単語の垂直位置を増加させる。
 * @param index 索引
 */
const decreasePositionTop = (index: number) => {
  currentWords.value[index].style.top = `${getCurrentWordTop(index) - 1}px`;
};

/**
 * 現在表示している各単語の単語の垂直位置を増加させる。
 */
const wordsTopToBottom = () => {
  currentWords.value.forEach((_: currentWord, index: number) => {
    decreasePositionTop(index);
  });
};

/** 現在表示されているの単語の索引 */
const currentWordIndex = ref(0);
const addWordTimerId = ref<ReturnType<typeof setInterval> | null>(null);
const moveWordTimerId = ref<ReturnType<typeof setInterval> | null>(null);
const burstTimerIds = ref<ReturnType<typeof setTimeout>[]>([]);
/**  総単語数と入力完了した単語の数を比較判定する */
const isAddedAllWords = () => {
  return typingWords.value.length == currentWordIndex.value;
};

/** ゲームが完了したかを判定する */
const checkGameCompleted = () => {
  if (isAddedAllWords() && currentWords.value.length == 0) {
    gameFinish();
  }
};

/** 「typing-panel」要素の横幅を取得する */
const getWordsBoardWidth = () => {
  return wordsBoard.value?.offsetWidth;
};
const getWordsBoardHeight = () => {
  return wordsBoard.value?.offsetHeight;
};
/** 表示するタイピング単語の横位置を生成する */
const getRandomPosition = () => {
  const boardWidth = getWordsBoardWidth();
  if (boardWidth !== undefined) {
    return Math.floor(
      Math.random() * (boardWidth - configStore.getWordStyleWidth)
    );
  }
};

/** 表示するタイピングの単語を追加する */
const addWord = () => {
  if (!isAddedAllWords()) {
    currentWords.value.push({
      characters: typingWords.value[currentWordIndex.value].split(""),
      classList: [],
      balloonClass: getRandomBalloonColorClass(),
      style: {
        left: `${getRandomPosition()}px`,
        top: `${getWordsBoardHeight() ?? 0}px`,
      },
    });
    currentWordIndex.value++;
  }
};

onMounted(() => {
  shuffleWords();

  if (
    configStore.getInsertionSpeed <= 0 ||
    configStore.getAnimationSpeed <= 0
  ) {
    configStore.saveGameMode(configStore.getGameMode);
  }
});
onUnmounted(() => {
  stopTimers();
});
/**  ボタンをクリックするとゲームがスタートする */
watch(isGameStartedFlag, (newValue, _oldValue) => {
  if (newValue) {
    stopTimers();

    // 難易度が未設定なら、デフォルトでEASYを設定
    if (
      configStore.getInsertionSpeed <= 0 ||
      configStore.getAnimationSpeed <= 0
    ) {
      configStore.saveGameMode(configStore.getGameMode);
    }

    addWord();

    addWordTimerId.value = setInterval(() => {
      addWord();
    }, configStore.getInsertionSpeed);

    moveWordTimerId.value = setInterval(() => {
      wordsTopToBottom();
      checkIsTopToBottom();
    }, configStore.getAnimationSpeed);
  } else {
    stopTimers();
  }
});

/** 入力された単語をウォッチする */
watch(typeBoxValue, (newValue, oldValue) => {
  if (isGameOverFlag.value) {
    return;
  }
  if (newValue.length > oldValue.length) {
    typedCharacterCount.value += newValue.length - oldValue.length;
    const isMiss = !hasMatchedPrefix(newValue);
    isInputMiss.value = isMiss;
    if (isMiss) {
      missCount.value++;
    }
  } else {
    isInputMiss.value = !hasMatchedPrefix(newValue);
  }
  checkWordEquality(newValue);
  checkCharacter(newValue);
});

/** リセットフラグをウォッチする */
watch(isResetFlag, (newValue, _oldValue) => {
  if (newValue) {
    stopTimers();
    currentWords.value = [];
    currentWordIndex.value = 0;
    isInputMiss.value = false;
    shuffleWords();
  }
});
</script>
<template>
  <div class="words-board" ref="typing-panel">
    <template v-for="(word, wordIndex) in currentWords" :key="wordIndex">
      <div
        class="word"
        :class="[
          word.balloonClass,
          getWordFeedbackClass(word),
          { 'word-burst': word.isBursting },
        ]"
        :style="word.style"
      >
        <template v-for="(character, index) in word.characters">
          <span :class="word.classList[index]">{{ character }} </span>
        </template>
      </div>
    </template>
  </div>
</template>
<style>
.words-board {
  background-color: #88bdcc;
  color: #000000;
  height: 75%;
  padding: 0.5rem;
  font-size: 2.4rem;
  position: relative;
  overflow: hidden;
}

.word {
  position: absolute;
  animation: balloonFloat 2s ease-in-out infinite;
  min-width: 95px;
  min-height: 120px;
  padding: 0.5rem 1rem;
  background: #ff3b5c;
  color: #ffffff;
  border-radius: 50% 50% 48% 48%;
  box-shadow: inset -8px -10px 0 rgba(0, 0, 0, 0.15),
    0 8px 14px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  transition:
    box-shadow 120ms ease,
    filter 120ms ease,
    transform 120ms ease;
}

.word-active {
  box-shadow:
    0 0 0 4px rgba(255, 255, 255, 0.75),
    0 0 0 8px rgba(81, 207, 102, 0.45),
    inset -8px -10px 0 rgba(0, 0, 0, 0.15),
    0 8px 14px rgba(0, 0, 0, 0.2);
  filter: brightness(1.08);
}

.word-miss {
  animation:
    balloonFloat 2s ease-in-out infinite,
    missShake 160ms ease;
  box-shadow:
    0 0 0 5px rgba(255, 107, 107, 0.55),
    inset -8px -10px 0 rgba(0, 0, 0, 0.15),
    0 8px 14px rgba(0, 0, 0, 0.2);
}

.word::after {
  content: "";
  position: absolute;
  bottom: -75px;
  left: 50%;
  transform: translateX(-50%) rotate(4deg);
  width: 3px;
  height: 80px;
  background: rgba(120, 120, 120, 0.8);
}

.word::before {
  content: "";
  position: absolute;
  bottom: -7px;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 10px;
  background: #ff4f8b;
  clip-path: polygon(50% 0, 0 100%, 100% 100%);
}

@keyframes balloonFloat {
  0% {
    transform: translateY(0px) rotate(0deg);
  }

  50% {
    transform: translateY(-4px) rotate(1deg);
  }

  100% {
    transform: translateY(0px) rotate(0deg);
  }
}

@keyframes missShake {
  0% {
    margin-left: 0;
  }

  35% {
    margin-left: -5px;
  }

  70% {
    margin-left: 5px;
  }

  100% {
    margin-left: 0;
  }
}

@keyframes balloonBurst {
  0% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
    filter: brightness(1);
  }

  55% {
    opacity: 1;
    transform: scale(1.22) rotate(-2deg);
    filter: brightness(1.35);
  }

  100% {
    opacity: 0;
    transform: scale(0.2) rotate(10deg);
    filter: brightness(1.5);
  }
}

.word-burst {
  animation: balloonBurst 200ms ease-out forwards;
}

.word-burst span {
  opacity: 0;
}

.word-burst::before,
.word-burst::after {
  content: "";
  position: absolute;
  inset: 50% auto auto 50%;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background:
    radial-gradient(circle, rgba(255, 255, 255, 0.95) 0 3px, transparent 4px)
      10px 18px / 42px 42px,
    radial-gradient(circle, rgba(255, 255, 255, 0.8) 0 2px, transparent 3px)
      22px 4px / 36px 36px;
  transform: translate(-50%, -50%) scale(0.7);
  animation: burstParticles 200ms ease-out forwards;
}

.word-burst::after {
  background:
    radial-gradient(circle, rgba(255, 255, 255, 0.9) 0 2px, transparent 3px)
      0 8px / 34px 34px,
    radial-gradient(circle, rgba(255, 255, 255, 0.7) 0 2px, transparent 3px)
      18px 18px / 46px 46px;
  animation-delay: 40ms;
}

@keyframes burstParticles {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.4) rotate(0deg);
  }

  35% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.5) rotate(30deg);
  }
}

.word span {
  border-radius: 6px;
  font-size: 1.7rem;
  padding: 0 1px;
}

.balloon-red {
  background: #ff3b5c;
}

.balloon-blue {
  background: #4dabf7;
}

.balloon-green {
  background: #2ee889;
}

.balloon-yellow {
  background: #ffd43b;
}

.balloon-purple {
  background: #b197fc;
}

.correct {
  background: rgba(255, 255, 255, 0.28);
  color: #eaffd0;
  text-shadow: 0 0 8px rgba(47, 158, 68, 0.85);
}

.incorrect {
  background: rgba(255, 255, 255, 0.85);
  color: #d6336c;
  text-shadow: none;
}
</style>
