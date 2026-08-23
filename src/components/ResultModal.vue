<script setup lang="ts">
import { computed } from "vue";
import { useResultModalDialog } from "@/composables/useResultModalDialog";
import { useResultModalState } from "@/composables/useResultModalState";
import type { GameScore } from "@/types/interfaces";

/** リザルトモーダルの表示に必要な情報 */
interface Props {
  isGameOver: boolean;
  lastScore: GameScore;
  previousScore?: GameScore | null;
}

const props = withDefaults(defineProps<Props>(), {
  previousScore: null,
});

const emit = defineEmits<{
  "restart-game": [];
}>();

/** ゲームオーバーフラグ */
const isGameOverFlag = computed((): boolean => {
  return props.isGameOver;
});

/** 最終ゲームスコア */
const lastScore = computed((): GameScore => {
  return props.lastScore;
});

/** 同じ条件で遊んだ前回からのスコア差 */
const scoreDifference = computed((): number | null => {
  if (!props.previousScore) {
    return null;
  }
  return props.lastScore.score - props.previousScore.score;
});

/** 前回比の表示値 */
const scoreDifferenceLabel = computed((): string => {
  if (scoreDifference.value === null) {
    return "";
  }
  if (scoreDifference.value > 0) {
    return `+${scoreDifference.value}`;
  }
  if (scoreDifference.value === 0) {
    return "±0";
  }
  return String(scoreDifference.value);
});

const { closeDialog, dialog } = useResultModalDialog(isGameOverFlag);

/** ゲームを再スタートする */
const restartGame = () => {
  emit("restart-game");
  closeDialog();
};

const {
  accuracyLabel,
  correctCharacterCountLabel,
  gameModeLabel,
  gameRuleLabel,
  isTimeAttackResult,
  missCountLabel,
  rankColor,
  resultRank,
  timeLimitLabel,
  wpmLabel,
} = useResultModalState(lastScore);
</script>
<template>
  <div class="text-center">
    <v-dialog v-model="dialog" width="680" persistent class="result-dialog">
      <v-card class="result-card">
        <v-card-title class="result-header">
          <span>Result</span>
          <span class="rank-badge" :style="{ backgroundColor: rankColor }">
            {{ resultRank }}
          </span>
        </v-card-title>

        <v-card-text class="result-body">
          <div class="score-summary">
            <div>
              <span class="score-label">SCORE</span>
              <span class="score-value">{{ lastScore.score }}</span>
            </div>
            <span
              v-if="scoreDifference !== null"
              class="score-difference"
              :class="{
                'score-difference--up': scoreDifference > 0,
                'score-difference--down': scoreDifference < 0,
              }"
            >
              前回比 {{ scoreDifferenceLabel }}
            </span>
          </div>

          <div class="result-grid result-grid--performance">
            <div class="result-item result-item--performance">
              <span class="item-label">WPM</span>
              <span class="item-value">{{ wpmLabel }}</span>
            </div>
            <div class="result-item result-item--performance">
              <span class="item-label">正確率</span>
              <span class="item-value">{{ accuracyLabel }}%</span>
            </div>
            <div class="result-item result-item--performance">
              <span class="item-label">ミス数</span>
              <span class="item-value">{{ missCountLabel }}</span>
            </div>
          </div>

          <div class="result-grid result-grid--details">
            <div class="result-item">
              <span class="item-label">プレイ時間</span>
              <span class="item-value">{{ lastScore.time }}</span>
            </div>
            <div class="result-item">
              <span class="item-label">難易度</span>
              <span class="item-value">{{ gameModeLabel }}</span>
            </div>
            <div class="result-item">
              <span class="item-label">ゲームルール</span>
              <span class="item-value">{{ gameRuleLabel }}</span>
            </div>
            <div v-if="isTimeAttackResult" class="result-item">
              <span class="item-label">制限時間</span>
              <span class="item-value">{{ timeLimitLabel }}</span>
            </div>
            <div class="result-item">
              <span class="item-label">正タイプ数</span>
              <span class="item-value">{{ correctCharacterCountLabel }}</span>
            </div>
            <div class="result-item">
              <span class="item-label">プレイ日時</span>
              <span class="item-value">{{ lastScore.date }}</span>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="result-actions">
          <v-btn color="success" size="large" @click="restartGame">
            もう一度プレイ
          </v-btn>
          <v-btn
            :to="{ name: 'RankingPage' }"
            color="deep-purple"
            size="large"
            variant="outlined"
          >
            ランキングを見る
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<style scoped>
.result-card {
  border-radius: 8px;
  max-height: calc(100dvh - 48px);
  overflow-y: auto;
}

.result-header {
  align-items: center;
  background: #673ab7;
  color: #ffffff;
  display: flex;
  font-size: 2.4rem;
  font-weight: bold;
  justify-content: space-between;
  padding: 20px 24px;
}

.rank-badge {
  align-items: center;
  border-radius: 50%;
  color: #ffffff;
  display: inline-flex;
  font-size: 2.4rem;
  height: 56px;
  justify-content: center;
  width: 56px;
}

.result-body {
  padding: 20px 24px;
}

.score-summary {
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-bottom: 18px;
}

.score-label {
  color: var(--app-text-muted);
  display: block;
  font-size: 1.6rem;
  letter-spacing: 0.12em;
  margin-bottom: 5px;
  text-align: center;
}

.score-value {
  color: var(--app-text);
  font-size: 4.5rem;
  font-weight: bold;
  line-height: 1;
}

.score-difference {
  background: var(--app-surface-muted);
  border-radius: 999px;
  color: var(--app-text-muted);
  font-size: 0.85rem;
  font-weight: 700;
  margin-top: 10px;
  padding: 5px 10px;
}

.score-difference--up {
  background: rgba(46, 160, 67, 0.12);
  color: #2b8a3e;
}

.score-difference--down {
  background: rgba(217, 72, 95, 0.12);
  color: #d9485f;
}

.result-grid {
  display: grid;
  gap: 12px;
}

.result-grid--performance {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-bottom: 16px;
}

.result-grid--details {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.result-item {
  background: var(--app-surface-muted);
  border-radius: 8px;
  padding: 11px 13px;
  text-align: left;
}

.result-item--performance {
  border: 1px solid rgba(103, 58, 183, 0.22);
  text-align: center;
}

.result-item--performance .item-value {
  color: #6741d9;
  font-size: 2rem;
}

.item-label {
  color: var(--app-text-muted);
  display: block;
  font-size: 1rem;
  margin-bottom: 6px;
}

.item-value {
  color: var(--app-text);
  display: block;
  font-size: 1.35rem;
  font-weight: bold;
  overflow-wrap: anywhere;
}

.result-actions {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  padding: 0 24px 24px;
}

@media (max-width: 600px) {
  .result-dialog :deep(.v-overlay__content) {
    margin: 12px;
    max-height: calc(100dvh - 24px);
    width: calc(100vw - 24px) !important;
  }

  .result-card {
    max-height: calc(100dvh - 24px);
  }

  .result-header {
    position: sticky;
    top: 0;
    z-index: 1;
    font-size: 1.8rem;
    padding: 12px 16px;
  }

  .rank-badge {
    font-size: 1.7rem;
    height: 40px;
    width: 40px;
  }

  .result-body {
    padding: 14px 16px;
  }

  .score-summary {
    margin-bottom: 12px;
  }

  .score-label {
    font-size: 1.3rem;
    margin-right: 10px;
  }

  .score-value {
    font-size: 3.6rem;
  }

  .score-difference {
    margin-top: 7px;
  }

  .result-grid {
    gap: 8px;
  }

  .result-grid--performance {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin-bottom: 8px;
  }

  .result-grid--details {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .result-item {
    padding: 9px 10px;
  }

  .item-label {
    font-size: 1.05rem;
    margin-bottom: 4px;
  }

  .item-value {
    font-size: 1.35rem;
  }

  .result-item--performance .item-value {
    font-size: 1.55rem;
  }

  .result-actions {
    padding: 0 16px 14px;
  }
}

@media (max-width: 360px) {
  .result-grid--details,
  .result-actions {
    grid-template-columns: 1fr;
  }
}
</style>
