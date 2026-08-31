<script setup lang="ts">
import TypingPanel from "@/components/TypingPanel.vue";
import AppAlerts from "@/components/AppAlerts.vue";
import ResultModal from "@/components/ResultModal.vue";
import GameTimer from "@/components/GameTimer.vue";
import VirtualKeyboard from "@/components/VirtualKeyboard.vue";
import { useTypingKeyboardFeedback } from "@/composables/useTypingKeyboardFeedback";
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";
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
import { findPreviousComparableScore } from "@/composables/useGamePageScore";
import Util from "@/utils/gameUtils";
import type { Alert } from "@/types/interfaces";

/** ゲームスコアに関するストア情報 */
const gameScoresStore = useGameScoresStore();

/** ゲーム難易度に関するストア情報 */
const configStore = useConfigStore();
/** Timerコンポーネントに関する情報 */
const timerComponent = ref<GameTimerControl | null>(null);

interface FocusableInput {
  focus: () => void;
}

/** ゲーム開始後にフォーカスする入力欄 */
const typingInput = ref<FocusableInput | null>(null);

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

/** 開始画面に表示する現在の難易度 */
const gameModeLabel = computed((): string => {
  return Util.getLevel(configStore.getGameMode);
});

/** 開始画面に表示する現在のゲームルール */
const gameRuleLabel = computed((): string => {
  const ruleLabel = Util.getGameRuleLabel(configStore.getGameRule);
  return isTimeAttackMode.value
    ? `${ruleLabel} ${configStore.getTimeLimitSeconds}秒`
    : `${ruleLabel}モード`;
});

/** 今回と同じ条件で遊んだ直近のスコア */
const previousComparableScore = computed(() => {
  return findPreviousComparableScore(
    gameScoresStore.getGameScoreList,
    lastScore.value
  );
});

const { pressedKey, missKey, updateKeyFeedback, clearKeyFeedbackTimers } =
  useTypingKeyboardFeedback();

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

/** ユーザー操作でゲームを開始し、描画後に入力欄へフォーカスする。 */
const startGameAndFocusInput = async (): Promise<void> => {
  startGame();
  await nextTick();
  typingInput.value?.focus();
};

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
        :is-game-started="isGameStarted"
        :is-reset-timer="isResetTimer"
        :should-finish-on-word-reached-top="shouldFinishOnWordReachedTop"
        :game-score="gameScore"
        :is-game-over="isGameOver"
        :input-value="inputValue"
        :typed-character-count="typedCharacterCount"
        :miss-count="missCount"
        :correct-character-count="correctCharacterCount"
        :is-input-miss="isInputMiss"
        :next-key="nextKey"
        @update:game-score="($event) => (gameScore = $event)"
        @update:is-game-over="($event) => (isGameOver = $event)"
        @update:input-value="($event) => (inputValue = $event)"
        @update:typed-character-count="
          ($event) => (typedCharacterCount = $event)
        "
        @update:miss-count="($event) => (missCount = $event)"
        @update:correct-character-count="
          ($event) => (correctCharacterCount = $event)
        "
        @update:is-input-miss="($event) => (isInputMiss = $event)"
        @update:next-key="($event) => (nextKey = $event)"
      />
      <template v-if="isGameStarted">
        <div class="game-control-panel">
          <div class="input-panel">
            <div class="input-label">
              <v-icon size="small" aria-hidden="true"
                >mdi-keyboard-outline</v-icon
              >
              好きな風船の単語を入力
            </div>
            <v-text-field
              id="typing-input"
              ref="typingInput"
              v-model="inputValue"
              class="game-text-field"
              :class="{ 'game-text-field-error': isInputMiss }"
              variant="outlined"
              density="comfortable"
              hide-details
              :error="isInputMiss"
              placeholder="例: balloon"
              autocomplete="off"
              spellcheck="false"
              aria-label="好きな風船の単語を入力"
            />
          </div>
          <div
            class="status-panel"
            :class="{ 'status-panel--time-attack': isTimeAttackMode }"
          >
            <GameTimer ref="timerComponent" v-model:accum-time="accumTime" />
            <div v-if="isTimeAttackMode" class="game-status-item">
              <span class="game-status-label">残り時間</span>
              <span role="timer" aria-label="残り時間">{{
                remainingTimeLabel
              }}</span>
            </div>
            <div class="game-status-item">
              <span class="game-status-label">スコア</span>
              <span aria-live="polite" aria-label="スコア">{{
                gameScore
              }}</span>
            </div>
            <div class="game-status-item game-status-item--miss">
              <span class="game-status-label">ミス</span>
              <span aria-live="polite" aria-label="ミス数">{{
                missCount
              }}</span>
            </div>
          </div>
          <VirtualKeyboard
            v-if="configStore.getIsVirtualKeyBoard"
            class="keyboard-panel"
            :next-key="nextKey"
            :pressed-key="pressedKey"
            :miss-key="missKey"
          />
        </div>
      </template>
      <template v-else>
        <section class="game-intro" aria-labelledby="game-intro-title">
          <div class="intro-balloon intro-balloon--left" aria-hidden="true" />
          <div class="intro-balloon intro-balloon--right" aria-hidden="true" />

          <div class="intro-content">
            <p class="intro-eyebrow">BALLOON TYPING GAME</p>
            <h1 id="game-intro-title">
              風船を割って、<span>タイピング力を測ろう。</span>
            </h1>
            <p class="intro-lead">
              画面に浮かぶ英単語を入力してスコアを競うタイピングゲームです。
              WPM・正確率・ミス数を自動で記録します。
            </p>

            <div class="intro-metrics" aria-label="記録できる指標">
              <div>
                <strong>WPM</strong>
                <span>入力の速さ</span>
              </div>
              <div>
                <strong>正確率</strong>
                <span>入力の丁寧さ</span>
              </div>
              <div>
                <strong>ミス数</strong>
                <span>次の改善点</span>
              </div>
            </div>

            <div class="intro-guide">
              <strong>遊び方</strong>
              <ol>
                <li><span>1</span>ゲームを開始</li>
                <li><span>2</span>風船の単語を入力</li>
                <li><span>3</span>結果を振り返る</li>
              </ol>
            </div>

            <div class="intro-actions">
              <v-btn
                color="deep-purple"
                size="x-large"
                min-width="230"
                prepend-icon="mdi-play"
                @click="startGameAndFocusInput"
              >
                ゲームをはじめる
              </v-btn>
              <v-btn
                :to="{ name: 'SettingsPage' }"
                variant="outlined"
                size="large"
                prepend-icon="mdi-tune-variant"
              >
                設定を変更
              </v-btn>
            </div>
            <p class="intro-current-setting">
              現在の設定：難易度 {{ gameModeLabel }} ／ {{ gameRuleLabel }}
            </p>
          </div>
        </section>
      </template>
    </div>
  </v-container>
  <ResultModal
    :last-score="lastScore"
    :previous-score="previousComparableScore"
    :is-game-over="isGameOver"
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
  position: relative;
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
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.input-label {
  align-items: center;
  color: var(--app-text);
  display: flex;
  font-size: 1.05rem;
  font-weight: 700;
  gap: 6px;
  margin-bottom: 7px;
}

.game-text-field {
  flex: 0 0 auto;
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
  gap: 10px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.status-panel--time-attack {
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

.game-status-label {
  color: var(--app-text-muted);
  display: block;
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 6px;
}

.game-status-item span {
  color: var(--app-text);
  display: block;
  font-size: 1.65rem;
  font-weight: bold;
  line-height: 1.2;
  overflow-wrap: anywhere;
  white-space: nowrap;
}

.game-status-item--miss span {
  color: #d9485f;
}

.game-intro {
  align-items: center;
  background:
    radial-gradient(
      circle at 18% 20%,
      rgba(126, 214, 255, 0.32),
      transparent 30%
    ),
    radial-gradient(
      circle at 86% 78%,
      rgba(177, 151, 252, 0.25),
      transparent 32%
    ),
    linear-gradient(145deg, #fbfdff 0%, #eff8ff 52%, #f7f2ff 100%);
  display: flex;
  justify-content: center;
  inset: 0;
  overflow-y: auto;
  padding: 40px 56px;
  position: absolute;
  z-index: 2;
}

.intro-content {
  max-width: 720px;
  position: relative;
  text-align: center;
  width: 100%;
  z-index: 1;
}

.intro-eyebrow {
  color: #6741d9;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  margin: 0 0 12px;
}

.intro-content h1 {
  color: #1f2533;
  font-size: clamp(2.25rem, 5vw, 3.8rem);
  font-weight: 900;
  letter-spacing: -0.035em;
  line-height: 1.15;
  margin: 0;
}

.intro-content h1 span {
  color: #6741d9;
}

.intro-lead {
  color: #4b5565;
  font-size: 1.05rem;
  line-height: 1.8;
  margin: 20px auto 24px;
  max-width: 640px;
}

.intro-metrics {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 0 auto 22px;
  max-width: 620px;
}

.intro-metrics div {
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(103, 65, 217, 0.16);
  border-radius: 12px;
  box-shadow: 0 8px 22px rgba(69, 60, 120, 0.08);
  padding: 12px 10px;
}

.intro-metrics strong,
.intro-metrics span {
  display: block;
}

.intro-metrics strong {
  color: #352875;
  font-size: 1.05rem;
}

.intro-metrics span {
  color: #697386;
  font-size: 0.8rem;
  margin-top: 3px;
}

.intro-guide {
  align-items: center;
  color: #394150;
  display: flex;
  gap: 18px;
  justify-content: center;
  margin-bottom: 24px;
}

.intro-guide > strong {
  white-space: nowrap;
}

.intro-guide ol {
  display: flex;
  gap: 16px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.intro-guide li {
  align-items: center;
  display: flex;
  font-size: 0.9rem;
  gap: 6px;
}

.intro-guide li span {
  align-items: center;
  background: #6741d9;
  border-radius: 50%;
  color: #ffffff;
  display: inline-flex;
  font-size: 0.72rem;
  font-weight: 800;
  height: 22px;
  justify-content: center;
  width: 22px;
}

.intro-actions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.intro-current-setting {
  color: #697386;
  font-size: 0.82rem;
  margin: 12px 0 0;
}

.intro-balloon {
  border-radius: 50% 50% 48% 48%;
  opacity: 0.7;
  position: absolute;
}

.intro-balloon::after {
  background: rgba(86, 94, 109, 0.45);
  content: "";
  height: 96px;
  left: 50%;
  position: absolute;
  top: calc(100% - 2px);
  transform: rotate(5deg);
  width: 2px;
}

.intro-balloon--left {
  background: #ff5d73;
  height: 92px;
  left: 5%;
  top: 12%;
  transform: rotate(-9deg);
  width: 72px;
}

.intro-balloon--right {
  background: #ffd43b;
  bottom: 16%;
  height: 108px;
  right: 5%;
  transform: rotate(8deg);
  width: 84px;
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

  .game-status-item {
    padding: 10px 12px;
  }

  .game-status-item span {
    font-size: 1.45rem;
  }

  .game-intro {
    align-items: flex-start;
    padding: 32px 24px;
  }

  .intro-content h1 {
    font-size: 2.4rem;
  }

  .intro-lead {
    font-size: 0.98rem;
  }

  .intro-guide {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }

  .intro-guide ol {
    justify-content: center;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .game-board {
    height: calc(100dvh - 116px);
  }

  .game-control-panel {
    padding: 10px;
  }

  .status-panel {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .game-status-label {
    font-size: 1.1rem;
  }

  .game-status-item span {
    font-size: 1.25rem;
  }

  .game-intro {
    padding: 26px 18px;
  }

  .intro-content h1 {
    font-size: 2rem;
  }

  .intro-lead {
    line-height: 1.65;
    margin: 14px auto 18px;
  }

  .intro-metrics {
    gap: 7px;
    margin-bottom: 18px;
  }

  .intro-metrics div {
    padding: 10px 5px;
  }

  .intro-metrics strong {
    font-size: 0.92rem;
  }

  .intro-metrics span {
    font-size: 0.68rem;
  }

  .intro-guide ol {
    flex-direction: column;
    gap: 8px;
  }

  .intro-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .intro-actions :deep(.v-btn) {
    width: 100%;
  }

  .intro-balloon {
    display: none;
  }
}

:global(.app-shell--dark) .game-intro {
  background:
    radial-gradient(
      circle at 18% 20%,
      rgba(54, 162, 208, 0.2),
      transparent 30%
    ),
    radial-gradient(
      circle at 86% 78%,
      rgba(126, 87, 194, 0.22),
      transparent 32%
    ),
    linear-gradient(145deg, #1d222b 0%, #182832 52%, #241d31 100%);
}

:global(.app-shell--dark) .intro-content h1 {
  color: #f7f8fb;
}

:global(.app-shell--dark) .intro-eyebrow,
:global(.app-shell--dark) .intro-content h1 span {
  color: #b9a2ff;
}

:global(.app-shell--dark) .intro-lead,
:global(.app-shell--dark) .intro-guide,
:global(.app-shell--dark) .intro-current-setting {
  color: #c9ced8;
}

:global(.app-shell--dark) .intro-metrics div {
  background: rgba(30, 31, 36, 0.82);
  border-color: rgba(185, 162, 255, 0.22);
}

:global(.app-shell--dark) .intro-metrics strong {
  color: #ded5ff;
}

:global(.app-shell--dark) .intro-metrics span {
  color: #aeb6c4;
}
</style>
