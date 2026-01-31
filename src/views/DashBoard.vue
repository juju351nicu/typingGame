<script setup lang="ts">
import TypingPanel from "@/components/TypingPanel.vue"
import Alerts from "@/components/Alerts.vue";
import Modal from "@/components/Modal.vue";
import Timer from "@/components/Timer.vue";
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useGameScoresStore } from "@/stores/gameScores";
import { useConfigStore } from "@/stores/config"
import dayjs from 'dayjs';
import Util from "@/utils/util";
import Const from "@/constants/const";
const router = useRouter();
/** ゲームスコアに関するストア情報 */
const gameScoresStore = useGameScoresStore();

/** ゲーム難易度に関するストア情報 */
const configStore = useConfigStore();

/** ゲームスタートフラグ */
const isGameStarted = ref(false);

/** 選択されたゲームの難易度 */
const selectedOption = ref(configStore.getGameMode);

/** ゲーム難易度の選択項目 */
const options = ref<any>(Const.DIFFICULTY_LEVEL);

/** 経過時間 */
const accumTime = ref(0);

/** タイピングされている単語 */
const inputValue = ref("");

/** ゲームオーバー判定フラグ */
const isGameOver = ref(false);

/** ゲームスコア */
const gameScore = ref(0);

/** ゲームの時間・スコア・モードを保存する */
const saveGameScores = (() => {
  // 現在の日時を取得
  const now = dayjs();
  const data = {
    time: Util.getCountDownTime(accumTime.value),
    score: gameScore.value,
    mode: selectedOption.value,
    date: now.format(Const.DATE_FORMAT.STANDARD_DATE_TIME),
  }
  gameScoresStore.saveGameScoreList(data);
});

/** モーダルにてリセットボタン押下時、データをリセットする */
const restartGame = (() => {
  // resetGameData();
  // setModalDisplay();
  // 現在のページをリロードする
  router.go(0);
});

/** ゲームの難易度設定する */
const setGameMode = ((mode : number) => {
  configStore.saveGameMode(mode);
});

/** モーダル表示フラグ */
const modalDisplayStatus = ref(false);

/**  モーダル表示有無を設定する */
const setModalDisplay = (() => {
  modalDisplayStatus.value = !modalDisplayStatus.value;
});

/** ボタンをクリックするとゲームがスタートする  */
const startGame = (() => {
  isGameStarted.value = true;
});

/** リセットタイマーのフラグ */
const isRestTimer = ref(false);

/** ゲームのデータをリセットする */
const resetGameData = (() => {
  gameScore.value = 0;
  isRestTimer.value = true;
  isGameOver.value = false;
  isGameStarted.value = false;
  inputValue.value = "";
});
/** アラートに表示するメッセージ */
const alerts = ref<any>([]);
onMounted(() => {
  if (!Util.isLocalStorage()) {
    alerts.value.push({ message: "ローカルストレージは使用不可能です。", type: Const.ALERT_TYPE.ERROR });
  }
  if (!Util.checkBrowser()) {
    alerts.value.push({ message: "Google Chromeをお使い下さい。", type: Const.ALERT_TYPE.ERROR });
  }
});
/** ゲームオーバーフラグ */
watch(isGameOver, (newValue, _oldValue) => {
  if (newValue) {
    saveGameScores();
    setTimeout(() => {
      setModalDisplay();
    }, 500);
  }
});
</script>
<template>
  <v-container>
    <Alerts :alerts="alerts" />
    <div class="game-board">
      <TypingPanel :isGameStarted="isGameStarted" :isRestTimer="isRestTimer" :gameScore="gameScore"
        @update:gameScore="$event => (gameScore = $event)" :isGameOver="isGameOver"
        @update:isGameOver="$event => (isGameOver = $event)" :inputValue="inputValue"
        @update:inputValue="$event => (inputValue = $event)" />
      <template v-if="isGameStarted">
        <v-row>
          <v-col cols="12" sm="6" md="4">
            <v-text-field class="game_text" v-model="inputValue" variant="outlined" />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6" sm="6" md="4">
            <Timer v-model:accumTime="accumTime" :isGameStarted="isGameStarted" :isGameOver="isGameOver"
              :isRestTimer="isRestTimer" />
          </v-col>
          <v-col cols="6" sm="6" md="4">
            <div style="display: flex;">
              <label>Score</label>
              <span>{{ gameScore }}</span>
            </div>
          </v-col>
        </v-row>
      </template>
      <template v-else>
        <v-row>
          <v-col cols="4" sm="6" md="4">
            <v-select v-model="selectedOption" :items="options" :item-title="options.title" :item-value="options.value"
              label="Game Mode" @update:modelValue="setGameMode" />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="4" sm="6" md="4">
            <v-btn class="mt-2" color="success" @click="startGame" size="large" width="200px">
              Play➔
            </v-btn>
          </v-col>
        </v-row>
      </template>
    </div>
  </v-container>
  <Modal :class="modalDisplayStatus ? 'open' : ''" :isGameOver="isGameOver" @restart-game="restartGame" />
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
  -webkit-box-shadow: 1px 1px 5px 1px rgba(0, 0, 0, 0.75);
  -moz-box-shadow: 1px 1px 5px 1px rgba(0, 0, 0, 0.75);
  box-shadow: 1px 1px 5px 1px rgba(0, 0, 0, 0.75);
}

.game-board label {
  background-color: mediumpurple;
  font-weight: bold;
  font-size: 2.4rem;
  margin-bottom: .5rem;
  color: #ffffff;
}

.game-board span {
  font-size: 2rem;
}

.game_text {
  width: 800px;
}

::-webkit-scrollbar {
  width: .8rem;
}

::-webkit-scrollbar-track {
  background: #dddddd;
}

::-webkit-scrollbar-thumb {
  background: #888888;
}

::-webkit-scrollbar-thumb:hover {
  background: #555555;
}
</style>