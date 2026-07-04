<script setup lang="ts">
import {
  onMounted,
  onUnmounted,
  useTemplateRef,
  watch,
} from "vue";
import { wordsData as WORD_DATAS } from "@/assets/words";
import {
  applyCharacterFeedback,
  getWordFeedbackClass as getTypingWordFeedbackClass,
} from "@/composables/useTypingWords";
import { moveWordsUp } from "@/composables/useTypingWordPositions";
import { getNextKey } from "@/composables/useTypingKeyboard";
import { handleTypingInputChange } from "@/composables/useTypingInputChange";
import { useTypingTimers } from "@/composables/useTypingTimers";
import { useTypingGameWords } from "@/composables/useTypingGameWords";
import { completeTypingWord } from "@/composables/useTypingWordCompletion";
import {
  finishTypingGame,
  finishTypingGameIfCompleted,
  finishTypingGameIfWordReachedTop,
  resetTypingGame,
  startTypingGame,
} from "@/composables/useTypingGameLifecycle";
import { useTypingWordSpawner } from "@/composables/useTypingWordSpawner";
import {
  useTypingPanelModels,
  type TypingPanelModelProps,
} from "@/composables/useTypingPanelModels";
import { useConfigStore } from "@/stores/config";
import type { CurrentWord } from "@/types/interfaces";

const props = defineProps<TypingPanelModelProps>();

const emit = defineEmits<{
  "update:isGameOver": [value: boolean];
  "update:gameScore": [value: number];
  "update:inputValue": [value: string];
  "update:typedCharacterCount": [value: number];
  "update:missCount": [value: number];
  "update:correctCharacterCount": [value: number];
  "update:isInputMiss": [value: boolean];
  "update:nextKey": [value: string];
}>();

/** ゲームの設定情報に関するストア情報 */
const configStore = useConfigStore();

const {
  correctCharacterCount,
  gameScore,
  isGameOverFlag,
  isGameStartedFlag,
  isInputMiss,
  isResetFlag,
  missCount,
  nextKey,
  shouldFinishOnWordReachedTop,
  typeBoxValue,
  typedCharacterCount,
} = useTypingPanelModels(props, emit);

const {
  currentWords,
  shuffleTypingWords,
  addWord: addTypingWord,
  removeWord,
  isGameCompleted,
  resetWords,
} = useTypingGameWords(WORD_DATAS);

/** 入力された単語があっていた場合、CSSのクラスを設定する */
const checkCharacter = (typeBox: string) => {
  currentWords.value = applyCharacterFeedback(currentWords.value, typeBox);
};

/** 次に入力すべきキーを更新する */
const updateNextKey = () => {
  nextKey.value = getNextKey(currentWords.value, typeBoxValue.value);
};

/** 単語ごとの入力状態を返す */
const getWordFeedbackClass = (word: CurrentWord): string => {
  return getTypingWordFeedbackClass(
    word,
    typeBoxValue.value,
    isInputMiss.value
  );
};
const BURST_ANIMATION_DURATION = 200;

const { startTimers, stopTimers, registerTimeout } = useTypingTimers();
/** ゲームを終了する */
const gameFinish = () => {
  finishTypingGame({
    setGameOver: () => {
      isGameOverFlag.value = true;
    },
    stopTimers,
  });
};

/** 出題された単語と入力した単語の値を比較判定する */
const checkWordEquality = (word: string) => {
  completeTypingWord({
    currentWords: currentWords.value,
    inputValue: word,
    burstAnimationDuration: BURST_ANIMATION_DURATION,
    clearInput: () => {
      typeBoxValue.value = "";
    },
    addGameScore: (delta) => {
      gameScore.value += delta;
    },
    addCorrectCharacterCount: (delta) => {
      correctCharacterCount.value += delta;
    },
    registerTimeout,
    removeWord,
    checkGameCompleted,
    updateNextKey,
  });
};

/** 単語を表示するテンプレート要素 */
const wordsBoard = useTemplateRef("typing-panel");

/**
 *  表示される単語のHTML要素の高さを比較判定する。
 *  現在表示されている単語と「typing-panel」要素の縦幅を比較する。
 * 「typing-panel」要素の縦幅を下回った場合、ゲームを終了する。
 */
const checkIsTopToBottom = () => {
  finishTypingGameIfWordReachedTop({
    currentWords: currentWords.value,
    shouldFinishOnWordReachedTop: shouldFinishOnWordReachedTop.value,
    setGameOver: () => {
      isGameOverFlag.value = true;
    },
    stopTimers,
  });
};

/**
 * 現在表示している各単語の単語の垂直位置を増加させる。
 */
const wordsTopToBottom = () => {
  moveWordsUp(currentWords.value);
};

/** ゲームが完了したかを判定する */
const checkGameCompleted = () => {
  finishTypingGameIfCompleted({
    isGameCompleted,
    setGameOver: () => {
      isGameOverFlag.value = true;
    },
    stopTimers,
  });
};

const { addWord } = useTypingWordSpawner({
  wordsBoard,
  defaultBalloonWidth: () => configStore.getWordStyleWidth,
  addTypingWord,
  updateNextKey,
});

onMounted(() => {
  shuffleTypingWords();
  configStore.saveGameMode(configStore.getGameMode);
});
onUnmounted(() => {
  stopTimers();
});
/**  ボタンをクリックするとゲームがスタートする */
watch(isGameStartedFlag, (newValue, _oldValue) => {
  if (newValue) {
    startTypingGame({
      stopTimers,
      saveGameMode: () => configStore.saveGameMode(configStore.getGameMode),
      startTimers,
      addWord,
      moveWords: wordsTopToBottom,
      checkGameOver: checkIsTopToBottom,
      addWordInterval: configStore.getInsertionSpeed,
      moveWordInterval: configStore.getAnimationSpeed,
    });
  } else {
    stopTimers();
  }
});

/** 入力された単語をウォッチする */
watch(typeBoxValue, (newValue, oldValue) => {
  handleTypingInputChange({
    currentWords: currentWords.value,
    newValue,
    oldValue,
    isGameOver: isGameOverFlag.value,
    addTypedCharacterCount: (delta) => {
      typedCharacterCount.value += delta;
    },
    addMissCount: (delta) => {
      missCount.value += delta;
    },
    setInputMiss: (value) => {
      isInputMiss.value = value;
    },
    checkWordEquality,
    checkCharacter,
    updateNextKey,
  });
});

/** リセットフラグをウォッチする */
watch(isResetFlag, (newValue, _oldValue) => {
  if (newValue) {
    resetTypingGame({
      stopTimers,
      resetWords,
      resetInputMiss: () => {
        isInputMiss.value = false;
      },
      updateNextKey,
    });
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
  flex: 1 1 auto;
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

@media (max-width: 760px) {
  .words-board {
    height: auto;
    min-height: 0;
  }

  .word {
    min-height: 104px;
    min-width: 82px;
    padding: 0.4rem 0.8rem;
  }

  .word::after {
    bottom: -62px;
    height: 66px;
  }

  .word span {
    font-size: 1.45rem;
  }
}

@media (max-width: 480px) {
  .word {
    min-height: 94px;
    min-width: 74px;
    padding: 0.35rem 0.7rem;
  }

  .word::after {
    bottom: -54px;
    height: 58px;
  }

  .word span {
    font-size: 1.3rem;
  }
}
</style>
