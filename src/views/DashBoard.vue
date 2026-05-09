<script setup lang="ts">
import TypingPanel from "@/components/TypingPanel.vue";
import Alerts from "@/components/Alerts.vue";
import Modal from "@/components/Modal.vue";
import Timer from "@/components/Timer.vue";
import { onMounted, onUnmounted, reactive, ref, watch } from "vue";
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
let lastScore = reactive<GameScore>({
  score: 0,
  mode: 0,
  time: "",
  date: "",
});
/** ゲームの時間・スコア・モードを保存する */
const saveGameScores = (): void => {
  lastScore = {
    score: gameScore.value,
    mode: configStore.getGameMode,
    time: Util.getCountDownTime(accumTime.value),
    date: Util.getCurrentTime(),
  };
  gameScoresStore.saveGameScoreList(lastScore);
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
    saveGameScores();
    // 子コンポーネントのメソッドを呼び出す
    timerComponent.value.stopTimer();
    setTimeout(() => {
      setModalDisplay();
    }, 500);
  }
});

const clickChildButton = () => {
  // 子コンポーネントのメソッドを呼び出す
  timerComponent.value.stopTimer();
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
  if (event.key === "Shift") {
    timerComponent.value.startTimer();
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
  <v-container>
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
        <v-row>
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              class="game_text"
              v-model="inputValue"
              variant="outlined"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6" sm="6" md="4">
            <Timer ref="timerComponent" v-model:accumTime="accumTime" />
          </v-col>
          <v-col cols="6" sm="6" md="4">
            <div style="display: flex">
              <label>Score</label>
              <span>{{ gameScore }}</span>
            </div>
          </v-col>
        </v-row>
      </template>
      <template v-else>
        <v-btn
          class="mt-2"
          color="success"
          @click="startGame"
          size="large"
          width="200px"
        >
          Play➔
        </v-btn>
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

.game-board {
  width: 100vmin;
  height: 80vmin;
  display: flex;
  flex-direction: column;
  margin: auto;
  box-shadow: 1px 1px 5px 1px rgba(0, 0, 0, 0.75);
}

.game-board label {
  background-color: mediumpurple;
  font-weight: bold;
  font-size: 2.4rem;
  margin-bottom: 0.5rem;
  color: #ffffff;
}

.game-board span {
  font-size: 2rem;
}

.game_text {
  width: 800px;
}
</style>
