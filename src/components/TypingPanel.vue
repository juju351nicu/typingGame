<script setup lang="ts">
import {
  onMounted,
  onUnmounted,
  useTemplateRef,
} from "vue";
import TypingWordsBoard from "@/components/TypingWordsBoard.vue";
import { wordsData as WORD_DATAS } from "@/assets/words";
import {
  applyCharacterFeedback,
  getWordFeedbackClass as getTypingWordFeedbackClass,
} from "@/composables/useTypingWords";
import { moveWordsUp } from "@/composables/useTypingWordPositions";
import { getNextKey } from "@/composables/useTypingKeyboard";
import { useTypingTimers } from "@/composables/useTypingTimers";
import { useTypingGameWords } from "@/composables/useTypingGameWords";
import { completeTypingWord } from "@/composables/useTypingWordCompletion";
import {
  finishTypingGameIfCompleted,
  finishTypingGameIfWordReachedTop,
} from "@/composables/useTypingGameLifecycle";
import { useTypingWordSpawner } from "@/composables/useTypingWordSpawner";
import { useTypingPanelWatchers } from "@/composables/useTypingPanelWatchers";
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

/** 単語が上端到達した場合にゲームを終了する。 */
const checkWordReachedTop = () => {
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

useTypingPanelWatchers({
  isGameStartedFlag,
  isResetFlag,
  typeBoxValue,
  currentWords,
  isGameOverFlag,
  typedCharacterCount,
  missCount,
  isInputMiss,
  stopTimers,
  saveGameMode: () => configStore.saveGameMode(configStore.getGameMode),
  startTimers,
  addWord,
  moveWords: wordsTopToBottom,
  checkGameOver: checkWordReachedTop,
  getAddWordInterval: () => configStore.getInsertionSpeed,
  getMoveWordInterval: () => configStore.getAnimationSpeed,
  resetWords,
  updateNextKey,
  checkWordEquality,
  checkCharacter,
});
</script>
<template>
  <TypingWordsBoard
    ref="typing-panel"
    :current-words="currentWords"
    :get-word-feedback-class="getWordFeedbackClass"
  />
</template>
