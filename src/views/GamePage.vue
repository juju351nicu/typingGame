<script setup lang="ts">
import TypingPanel from "@/components/TypingPanel.vue";
import AppAlerts from "@/components/AppAlerts.vue";
import ResultModal from "@/components/ResultModal.vue";
import GameTimer from "@/components/GameTimer.vue";
import VirtualKeyboard from "@/components/VirtualKeyboard.vue";
import { useTypingKeyboardFeedback } from "@/composables/useTypingKeyboardFeedback";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useGameScoresStore } from "@/stores/gameScores";
import { useConfigStore } from "@/stores/config";
import { useTimeAttackTimer } from "@/composables/useTimeAttackTimer";
import { useGamePageState } from "@/composables/useGamePageState";
import {
  useGamePageKeyboardHandlers,
  type GameTimerControl,
} from "@/composables/useGamePageKeyboardHandlers";
import { createGamePageEnvironmentAlerts } from "@/composables/useGamePageEnvironmentAlerts";
import { useGamePageRestart } from "@/composables/useGamePageRestart";
import { useGamePageSession } from "@/composables/useGamePageSession";
import type { Alert } from "@/types/interfaces";

/** ゲームスコアに関するストア情報 */
const gameScoresStore = useGameScoresStore();

/** ゲーム難易度に関するストア情報 */
const configStore = useConfigStore();
/** Timerコンポーネントに関する情報 */
const timerComponent = ref<GameTimerControl | null>(null);

const {
  remainingSeconds,
  startTimeAttackTimer,
  resumeTimeAttackTimer,
  stopTimeAttackTimer,
  resetTimeAttackTimer,
} = useTimeAttackTimer();

const {
  accumTime,
  correctCharacterCount,
  gameScore,
  inputValue,
  isGameOver,
  isGameStarted,
  isInputMiss,
  lastScore,
  missCount,
  nextKey,
  resetGamePageState,
  typedCharacterCount,
} = useGamePageState();

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

const { startGame } = useGamePageSession({
  gameScoresStore,
  configStore,
  timerComponent,
  isTimeAttackMode,
  accumTime,
  correctCharacterCount,
  gameScore,
  isGameOver,
  isGameStarted,
  lastScore,
  missCount,
  typedCharacterCount,
  startTimeAttackTimer,
  stopTimeAttackTimer,
  resetTimeAttackTimer,
});

const { isResetTimer, restartGame } = useGamePageRestart({
  timerComponent,
  resetTimeAttackTimer,
  clearKeyFeedbackTimers,
  resetGamePageState,
});

/** アラートに表示するメッセージ */
const alerts = ref<Alert[]>([]);
onMounted(() => {
  alerts.value.push(...createGamePageEnvironmentAlerts());
});
const { handleKeydown } = useGamePageKeyboardHandlers({
  timerComponent,
  isGameStarted,
  isGameOver,
  isTimeAttackMode,
  nextKey,
  stopTimeAttackTimer,
  resumeTimeAttackTimer,
  updateKeyFeedback,
});

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
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
<style scoped>
.game-page {
  max-width: 1080px;
}

.game-board {
  background: var(--app-surface);
  border-radius: 8px;
  box-shadow: var(--app-shadow-strong);
  display: flex;
  flex-direction: column;
  height: min(78vh, 760px);
  margin: auto;
  overflow: hidden;
  width: min(100%, 920px);
}

.game-control-panel {
  align-items: stretch;
  background: var(--app-surface-muted);
  border-top: 1px solid var(--app-border);
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

.game-text-field-error :deep(.v-field) {
  background: var(--app-input-error-bg);
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
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 8px;
  min-width: 0;
  padding: 12px 14px;
}

.game-status-item label {
  color: var(--app-text-muted);
  display: block;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 6px;
}

.game-status-item span {
  color: var(--app-text);
  display: block;
  font-size: 1.9rem;
  font-weight: bold;
  line-height: 1.2;
  overflow-wrap: anywhere;
  white-space: nowrap;
}

.start-panel {
  align-items: center;
  background: var(--app-surface-muted);
  border-top: 1px solid var(--app-border);
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
