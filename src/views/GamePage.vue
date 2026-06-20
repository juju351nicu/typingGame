<script setup lang="ts">
import TypingPanel from "@/components/TypingPanel.vue";
import AppAlerts from "@/components/AppAlerts.vue";
import ResultModal from "@/components/ResultModal.vue";
import GameTimer from "@/components/GameTimer.vue";
import VirtualKeyboard from "@/components/VirtualKeyboard.vue";
import { useTypingKeyboardFeedback } from "@/composables/useTypingKeyboardFeedback";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useGameScoresStore } from "@/stores/gameScores";
import { useConfigStore } from "@/stores/config";
import { useTimeAttackTimer } from "@/composables/useTimeAttackTimer";
import Util from "@/utils/gameUtils";
import Const from "@/constants/const";
import type { Alert, GameScore } from "@/types/interfaces";

interface TimerExpose {
  startTimer: () => void;
  stopTimer: () => void;
}

const router = useRouter();
/** ゲームスコアに関するストア情報 */
const gameScoresStore = useGameScoresStore();

/** ゲーム難易度に関するストア情報 */
const configStore = useConfigStore();
/** Timerコンポーネントに関する情報 */
const timerComponent = ref<TimerExpose | null>(null);

const {
  remainingSeconds,
  startTimeAttackTimer,
  resumeTimeAttackTimer,
  stopTimeAttackTimer,
  resetTimeAttackTimer,
} = useTimeAttackTimer();

/** ゲームスタートフラグ */
const isGameStarted = ref(false);

/** 経過時間 */
const accumTime = ref(0);

/** タイピングされている単語 */
const inputValue = ref("");

/** ゲームオーバー判定フラグ */
const isGameOver = ref(false);

/** ゲームスコア */
const gameScore = ref(0);

/** 入力した文字数 */
const typedCharacterCount = ref(0);

/** ミスした文字数 */
const missCount = ref(0);

/** 正しく入力した文字数 */
const correctCharacterCount = ref(0);

/** 入力中の文字が現在の単語と一致していないか */
const isInputMiss = ref(false);

/** 次に入力すべきキー */
const nextKey = ref("");

/** タイムアタックが選択されているか */
const isTimeAttackMode = computed((): boolean => {
  return configStore.getIsTimeAttackMode;
});

/** タイムアタックの残り時間表示 */
const remainingTimeLabel = computed((): string => {
  return `${remainingSeconds.value}秒`;
});

/** 風船が画面上部に到達したときにゲーム終了するか */
const shouldFinishOnWordReachedTop = computed((): boolean => {
  return !isTimeAttackMode.value;
});

const {
  pressedKey,
  missKey,
  updateKeyFeedback,
  clearKeyFeedbackTimers,
} = useTypingKeyboardFeedback();

/** 最後に取得したゲームスコア */
const lastScore = ref<GameScore>({
  score: 0,
  mode: 0,
  time: "",
  date: "",
});
/** ゲームの時間・スコア・モードを保存する */
const saveGameScores = (): void => {
  lastScore.value = {
    score: gameScore.value,
    mode: configStore.getGameMode,
    gameRule: configStore.getGameRule,
    timeLimitSeconds: isTimeAttackMode.value
      ? configStore.getTimeLimitSeconds
      : undefined,
    time: Util.getCountDownTime(accumTime.value),
    date: Util.getCurrentTime(),
    wpm: Util.calculateWpm(correctCharacterCount.value, accumTime.value),
    accuracy: Util.calculateAccuracy(typedCharacterCount.value, missCount.value),
    missCount: missCount.value,
    correctCharacterCount: correctCharacterCount.value,
  };
  gameScoresStore.saveGameScoreList(lastScore.value);
};

/** モーダルにてリセットボタン押下時、データをリセットする */
const restartGame = () => {
  // 現在のページをリロードする
  router.go(0);
};

/** ボタンをクリックするとゲームがスタートする  */
const startGame = () => {
  isGameStarted.value = true;

  if (isTimeAttackMode.value) {
    startTimeAttackTimer({
      timeLimitSeconds: configStore.getTimeLimitSeconds,
      onTimeUp: () => {
        isGameOver.value = true;
      },
    });
  } else {
    resetTimeAttackTimer();
  }
};

/** TypingPanelへリセットを通知するフラグ */
const isResetTimer = ref(false);

/** アラートに表示するメッセージ */
const alerts = ref<Alert[]>([]);
onMounted(() => {
  if (!Util.isLocalStorage()) {
    alerts.value.push({
      message: "ローカルストレージは使用不可能です。",
      type: Const.ALERT_TYPE.ERROR,
    });
  }
  if (!Util.checkBrowser()) {
    alerts.value.push({
      message: "Google Chromeをお使い下さい。",
      type: Const.ALERT_TYPE.ERROR,
    });
  }
});
/** ゲームオーバーフラグ */
watch(isGameOver, (newValue, _oldValue) => {
  if (newValue) {
    // ゲーム終了時はタイマーを止め、リザルト保存を確定する。
    timerComponent.value?.stopTimer?.();
    stopTimeAttackTimer();
    saveGameScores();
  }
});

/** Escapeキーでタイマーを停止する */
const stopTimerByKeyboard = () => {
  timerComponent.value?.stopTimer?.();
  if (isTimeAttackMode.value) {
    stopTimeAttackTimer();
  }
};

const handleEsc = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    stopTimerByKeyboard();
  }
};
const handleShift = (event: KeyboardEvent) => {
  if (event.key === "Shift" && isGameStarted.value && !isGameOver.value) {
    timerComponent.value?.startTimer?.();
    if (isTimeAttackMode.value) {
      resumeTimeAttackTimer();
    }
  }
};

const handleTypingKeydown = (event: KeyboardEvent) => {
  if (!isGameStarted.value || isGameOver.value) {
    return;
  }

  updateKeyFeedback(event.key, nextKey.value);
};

onMounted(() => {
  window.addEventListener("keydown", handleEsc);
  window.addEventListener("keydown", handleShift);
  window.addEventListener("keydown", handleTypingKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleEsc);
  window.removeEventListener("keydown", handleShift);
  window.removeEventListener("keydown", handleTypingKeydown);
  resetTimeAttackTimer();
  clearKeyFeedbackTimers();
});
</script>
<template>
  <v-container class="game-page">
    <AppAlerts :alerts="alerts" />
    <div class="game-board">
      <TypingPanel
        :isGameStarted="isGameStarted"
        :isResetTimer="isResetTimer"
        :shouldFinishOnWordReachedTop="shouldFinishOnWordReachedTop"
        :gameScore="gameScore"
        @update:gameScore="($event) => (gameScore = $event)"
        :isGameOver="isGameOver"
        @update:isGameOver="($event) => (isGameOver = $event)"
        :inputValue="inputValue"
        @update:inputValue="($event) => (inputValue = $event)"
        :typedCharacterCount="typedCharacterCount"
        @update:typedCharacterCount="($event) => (typedCharacterCount = $event)"
        :missCount="missCount"
        @update:missCount="($event) => (missCount = $event)"
        :correctCharacterCount="correctCharacterCount"
        @update:correctCharacterCount="
          ($event) => (correctCharacterCount = $event)
        "
        :isInputMiss="isInputMiss"
        @update:isInputMiss="($event) => (isInputMiss = $event)"
        :nextKey="nextKey"
        @update:nextKey="($event) => (nextKey = $event)"
      />
      <template v-if="isGameStarted">
        <div class="game-control-panel">
          <div class="input-panel">
            <v-text-field
              class="game-text-field"
              :class="{ 'game-text-field-error': isInputMiss }"
              v-model="inputValue"
              variant="outlined"
              density="comfortable"
              hide-details
              :error="isInputMiss"
              autofocus
            />
          </div>
          <div class="status-panel">
            <GameTimer ref="timerComponent" v-model:accumTime="accumTime" />
            <div v-if="isTimeAttackMode" class="game-status-item">
              <label>残り時間</label>
              <span>{{ remainingTimeLabel }}</span>
            </div>
            <div class="game-status-item">
              <label>Score</label>
              <span>{{ gameScore }}</span>
            </div>
          </div>
          <VirtualKeyboard
            v-if="configStore.getIsVirtualKeyBoard"
            class="keyboard-panel"
            :nextKey="nextKey"
            :pressedKey="pressedKey"
            :missKey="missKey"
          />
        </div>
      </template>
      <template v-else>
        <div class="start-panel">
          <v-btn color="success" @click="startGame" size="large" min-width="220">
            Play
          </v-btn>
        </div>
      </template>
    </div>
  </v-container>
  <ResultModal
    :lastScore="lastScore"
    :isGameOver="isGameOver"
    @restart-game="restartGame"
  />
</template>
<style>
html {
  font-size: 10px;
}

.game-page {
  max-width: 1080px;
}

.game-board {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  height: min(78vh, 760px);
  margin: auto;
  overflow: hidden;
  width: min(100%, 920px);
}

.game-control-panel {
  align-items: stretch;
  background: #f8f9fa;
  border-top: 1px solid #d9dee2;
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(260px, 1fr) minmax(360px, 380px);
  padding: 18px;
}

.input-panel {
  align-items: center;
  display: flex;
}

.game-text-field {
  width: 100%;
}

.game-text-field-error {
  animation: inputMissShake 160ms ease;
}

.game-text-field-error .v-field {
  background: #fff5f5;
}

@keyframes inputMissShake {
  0% {
    transform: translateX(0);
  }

  35% {
    transform: translateX(-4px);
  }

  70% {
    transform: translateX(4px);
  }

  100% {
    transform: translateX(0);
  }
}

.status-panel {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.keyboard-panel {
  grid-column: 1 / -1;
}

.game-status-item {
  background: #ffffff;
  border: 1px solid #e2e6ea;
  border-radius: 8px;
  min-width: 0;
  padding: 12px 14px;
}

.game-status-item label {
  color: #666666;
  display: block;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 6px;
}

.game-status-item span {
  color: #222222;
  display: block;
  font-size: 1.9rem;
  font-weight: bold;
  line-height: 1.2;
  overflow-wrap: anywhere;
  white-space: nowrap;
}

.start-panel {
  align-items: center;
  background: #f8f9fa;
  border-top: 1px solid #d9dee2;
  display: flex;
  justify-content: center;
  min-height: 112px;
  padding: 24px;
}

@media (max-width: 760px) {
  .game-page {
    padding-left: 8px;
    padding-right: 8px;
  }

  .game-board {
    border-radius: 8px;
    height: calc(100dvh - 132px);
    min-height: 0;
  }

  .game-control-panel {
    gap: 10px;
    grid-template-columns: 1fr;
    padding: 12px;
  }

  .status-panel {
    grid-template-columns: 1fr 1fr;
  }

  .game-status-item {
    padding: 10px 12px;
  }

  .game-status-item span {
    font-size: 1.7rem;
  }
}

@media (max-width: 480px) {
  .game-board {
    height: calc(100dvh - 116px);
  }

  .start-panel {
    min-height: 92px;
    padding: 18px;
  }

  .game-control-panel {
    padding: 10px;
  }

  .game-status-item label {
    font-size: 1.1rem;
  }

  .game-status-item span {
    font-size: 1.55rem;
  }
}
</style>
