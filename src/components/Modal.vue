<script setup lang="ts">
import { computed, ref, watch } from "vue";
import Util from "@/utils/util";
import { GameScore } from "@/types/interfaces";
/** Propsインタフェース定義 */
interface Props {
  isGameOver: boolean;
  lastScore: GameScore;
}

/** Propsオブジェクトの設定 */
const props = defineProps<Props>();
const emit = defineEmits(["restart-game"]);

/** ゲームオーバーフラグ */
const isGameOverFlag = computed((): boolean => {
  return props.isGameOver;
});

/** 最終ゲームスコア */
const lastScore = computed((): GameScore => {
  return props.lastScore;
});

/** ダイアログの表示・非表示 */
const dialog = ref(false);

/** ゲームを再スタートする */
const reStartGame = () => {
  emit("restart-game");
  dialog.value = false;
};

/** ランク */
const resultRank = computed((): string => {
  return Util.getResultRank(lastScore.value.score);
});

/** ランク色 */
const rankColor = computed((): string => {
  return Util.getResultRankColor(resultRank.value);
});

/** 難易度 */
const gameModeLabel = computed((): string => {
  return Util.getLevel(lastScore.value.mode);
});

/** ゲームオーバーフラグをウォッチにて判定する */
watch(isGameOverFlag, (newValue, _oldValue) => {
  if (newValue) {
    dialog.value = true;
  }
});
</script>
<template>
  <div class="text-center">
    <v-dialog v-model="dialog" width="560" persistent class="result-dialog">
      <v-card class="result-card">
        <v-card-title class="result-header">
          <span>Result</span>
          <span class="rank-badge" :style="{ backgroundColor: rankColor }">
            {{ resultRank }}
          </span>
        </v-card-title>

        <v-card-text class="result-body">
          <div class="score-summary">
            <span class="score-label">Score</span>
            <span class="score-value">{{ lastScore.score }}</span>
          </div>

          <div class="result-grid">
            <div class="result-item">
              <span class="item-label">プレイ時間</span>
              <span class="item-value">{{ lastScore.time }}</span>
            </div>
            <div class="result-item">
              <span class="item-label">難易度</span>
              <span class="item-value">{{ gameModeLabel }}</span>
            </div>
            <div class="result-item">
              <span class="item-label">WPM</span>
              <span class="item-value">{{ lastScore.wpm ?? 0 }}</span>
            </div>
            <div class="result-item">
              <span class="item-label">正確率</span>
              <span class="item-value">{{ lastScore.accuracy ?? 100 }}%</span>
            </div>
            <div class="result-item">
              <span class="item-label">ミス数</span>
              <span class="item-value">{{ lastScore.missCount ?? 0 }}</span>
            </div>
            <div class="result-item">
              <span class="item-label">プレイ日時</span>
              <span class="item-value">{{ lastScore.date }}</span>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="result-actions">
          <v-btn color="success" size="large" block @click="reStartGame">
            リトライ
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
  padding: 24px;
}

.score-summary {
  align-items: baseline;
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.score-label {
  color: #666666;
  font-size: 1.6rem;
  margin-right: 16px;
}

.score-value {
  color: #2f2f2f;
  font-size: 5.2rem;
  font-weight: bold;
  line-height: 1;
}

.result-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.result-item {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 14px 16px;
  text-align: left;
}

.item-label {
  color: #666666;
  display: block;
  font-size: 1.3rem;
  margin-bottom: 6px;
}

.item-value {
  color: #222222;
  display: block;
  font-size: 1.8rem;
  font-weight: bold;
  overflow-wrap: anywhere;
}

.result-actions {
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

  .result-grid {
    gap: 8px;
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

  .result-actions {
    padding: 0 16px 14px;
  }
}

@media (max-width: 360px) {
  .result-grid {
    grid-template-columns: 1fr;
  }
}
</style>
