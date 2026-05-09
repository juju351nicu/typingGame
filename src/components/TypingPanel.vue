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
]);

const emit = defineEmits([
  "update:isGameOver",
  "update:gameScore",
  "update:inputValue",
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
const balloonColorClasses = [
  "balloon-red",
  "balloon-blue",
  "balloon-green",
  "balloon-yellow",
  "balloon-purple",
];

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
};
/** ゲームを終了する */
const gameFinish = () => {
  isGameOverFlag.value = true;
  stopTimers();
};

/** 出題された単語と入力した単語の値を比較判定する */
const checkWordEquality = (word: string) => {
  const index = currentWords.value.findIndex(
    (item: currentWord) => item.characters.join("") == word
  );
  //一致した場合
  if (index != -1) {
    currentWords.value.splice(index, 1);
    typeBoxValue.value = "";
    gameScore.value++;
    checkGameCompleted();
  }
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
  let wordsBoardTop = wordsBoard.value?.offsetHeight;
  currentWords.value.forEach((_: currentWord, index: number) => {
    // 現在表示されている単語の縦幅を取得する。
    let wordPositionTop = getCurrentWordTop(index);
    // 現在表示されている単語と「typing-panel」要素の縦幅を比較する。
    if (wordsBoardTop !== undefined) {
      if (wordPositionTop > wordsBoardTop) {
        gameFinish();
      }
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
const increasePositionTop = (index: number) => {
  currentWords.value[index].style.top = `${getCurrentWordTop(index) + 1}px`;
};

/**
 * 現在表示している各単語の単語の垂直位置を増加させる。
 */
const wordsTopToBottom = () => {
  currentWords.value.forEach((_: currentWord, index: number) => {
    increasePositionTop(index);
  });
};

/** 現在表示されているの単語の索引 */
const currentWordIndex = ref(0);
const addWordTimerId = ref<ReturnType<typeof setInterval> | null>(null);
const moveWordTimerId = ref<ReturnType<typeof setInterval> | null>(null);
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
        top: "-30px",
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
watch(typeBoxValue, (newValue, _oldValue) => {
  if (isGameOverFlag.value) {
    return;
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
    shuffleWords();
  }
});
</script>
<template>
  <div class="words-board" ref="typing-panel">
    <template v-for="(word, wordIndex) in currentWords" :key="wordIndex">
      <div class="word" :class="word.balloonClass" :style="word.style">
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

.word span {
  font-size: 1.7rem;
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
  color: #00ff00;
}

.incorrect {
  color: #ff0000;
}
</style>
