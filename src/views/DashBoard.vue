<script setup lang="ts">
import TypingPanel from "@/components/TypingPanel.vue";
import Alerts from "@/components/Alerts.vue";
import Modal from "@/components/Modal.vue";
import Timer from "@/components/Timer.vue";
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useGameScoresStore } from "@/stores/gameScores";
import { useConfigStore } from "@/stores/config";
import Util from "@/utils/util";
import Const from "@/constants/const";
import { GameScore } from "@/types/interfaces";
const router = useRouter();
/** ゲームスコアに関するストア情報 */
const gameScoresStore = useGameScoresStore();

/** ゲーム難易度に関するストア情報 */
const configStore = useConfigStore();
/** Timerコンポーネントに関する情報 */
const timerComponent = ref();
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
    time: Util.getCountDownTime(accumTime.value),
    date: Util.getCurrentTime(),
  };
  gameScoresStore.saveGameScoreList(lastScore.value);
};

/** モーダルにてリセットボタン押下時、データをリセットする */
const restartGame = () => {
  // resetGameData();
  // setModalDisplay();
  // 現在のページをリロードする
  router.go(0);
};

/** モーダル表示フラグ */
const modalDisplayStatus = ref(false);

/**  モーダル表示有無を設定する */
const setModalDisplay = () => {
  modalDisplayStatus.value = !modalDisplayStatus.value;
};

/** ボタンをクリックするとゲームがスタートする  */
const startGame = () => {
  isGameStarted.value = true;
};

/** リセットタイマーのフラグ */
const isResetTimer = ref(false);

/** ゲームのデータをリセットする */
const resetGameData = () => {
  gameScore.value = 0;
  isResetTimer.value = true;
  isGameOver.value = false;
  isGameStarted.value = false;
  inputValue.value = "";
};
/** アラートに表示するメッセージ */
const alerts = ref<any>([]);
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
    // 子コンポーネントのメソッドを呼び出す
    timerComponent.value?.stopTimer?.();
    saveGameScores();
    setTimeout(() => {
      setModalDisplay();
    }, 500);
  }
});

const clickChildButton = () => {
  // 子コンポーネントのメソッドを呼び出す
  timerComponent.value?.stopTimer?.();
};
const handleEscape = () => {
  console.log("子コンポーネントのメソッドを呼び出す");
  clickChildButton();
};

const handleEsc = (event: any) => {
  if (event.key === "Escape") {
    handleEscape();
  }
};
const handleShift = (event: any) => {
  if (event.key === "Shift" && isGameStarted.value && !isGameOver.value) {
    timerComponent.value?.startTimer?.();
  }
};
onMounted(() => {
  window.addEventListener("keydown", handleEsc);
  window.addEventListener("keydown", handleShift);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleEsc);
  window.removeEventListener("keydown", handleShift);
});
</script>
<template>
  <v-container class="game-page">
    <Alerts :alerts="alerts" />
    <div class="game-board">
      <TypingPanel
        :isGameStarted="isGameStarted"
        :isResetTimer="isResetTimer"
        :gameScore="gameScore"
        @update:gameScore="($event) => (gameScore = $event)"
        :isGameOver="isGameOver"
        @update:isGameOver="($event) => (isGameOver = $event)"
        :inputValue="inputValue"
        @update:inputValue="($event) => (inputValue = $event)"
      />
      <template v-if="isGameStarted">
        <div class="game-control-panel">
          <div class="input-panel">
            <v-text-field
              class="game-text-field"
              v-model="inputValue"
              variant="outlined"
              density="comfortable"
              hide-details
              autofocus
            />
          </div>
          <div class="status-panel">
            <Timer ref="timerComponent" v-model:accumTime="accumTime" />
            <div class="game-status-item">
              <label>Score</label>
              <span>{{ gameScore }}</span>
            </div>
          </div>
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
  <Modal
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

.status-panel {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
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
  .game-board {
    height: calc(100vh - 150px);
    min-height: 560px;
  }

  .game-control-panel {
    grid-template-columns: 1fr;
  }

  .status-panel {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .status-panel {
    grid-template-columns: 1fr;
  }
}
</style>
