<template>
  <div class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title">Game Completed</h1>
      </div>
      <div class="modal-body">
        <p>{{ getLastScoreDesc }}</p>
        <div class="game-option">
          <select v-model="currentListMode">
            <option disabled value="">List By Game Mode</option>
            <option value="">All</option>
            <option v-for="(mode, index) in modes" :value="index">{{ mode }}</option>
          </select>
        </div>
        <template v-if="listGameScores.length > 0">
          <h2>All Game Scores</h2>
          <div class="game-scores-container">
            <table class="game-scores">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Game Mode</th>
                  <th>Time</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="gameScores" v-for="(score, index) in listGameScores">
                  <td>{{ index + 1 }}</td>
                  <td>{{ getGameMode(score.mode) }}</td>
                  <td>{{ score.time }}</td>
                  <td>{{ score.score }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
        <template v-else> There is no score information. </template>
      </div>
      <div class="modal-footer">
        <button class="btn" @click="restartGame">
          Play again <span class="btn-arrow">➔</span>
        </button>
        <button class="btn" @click="
          resetGameScoreFromStorage();
        resetModalData();
        ">
          Reset Scores<span class="btn-arrow">➔</span>
        </button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useGameScoresStore } from "../stores/gameScores";
import { computed, reactive, ref, watch } from "vue";

//インポートした関数を呼び出してストアをインスタンス化して変数に代入
const gameScoresStore = useGameScoresStore(); //setup() 内で useXxxxStore() を実行

const props = defineProps({
  isGameover: Boolean,
  modes: Array
})
/** ゲームモード */
const gemeMode = computed(() => {
  return props.modes;
});
/** ゲームオーバーフラグ */
const isGameOverFlag = computed(() => {
  return props.isGameover;
});
const emit = defineEmits(["restart-game"]);
/** ゲームをリセットする */
const restartGame = (() => {
  emit("restart-game");
});

/** ゲームのEasyモード等のモード情報を取得する */
const getGameMode = ((index) => {
  return gemeMode.value[Number(index)];
});

const gameScores = ref([]);

let lastScore = reactive({
  score: "",
  mode: "",
  time: "",
});
const getLastScoreDesc = computed(() => {
  if (gameScores.value.length > 0) {
    let desc = `You completed ${lastScore.score} words in ${lastScore.time
      } time in ${getGameMode(lastScore.mode)} mode.`;
    return desc;
  }
  return;
});

const currentListMode = ref("");
const listGameScores = computed(() => {
  if (typeof currentListMode.value == "number") {
    return gameScores.value.filter(
      (gameScore) => gameScore.mode == currentListMode.value
    );
  }
  return gameScores.value;
});

watch(isGameOverFlag, (newValue, _oldValue) => {
  if (newValue) {
    getGameScores();
    lastScore = gameScores.value[gameScores.value.length - 1];
    sortGameScores();
  } else {
    resetModalData();
  }
});

/** ローカルストレージからゲームのスコアを取得する */
const getGameScores = (() => {
  return gameScores.value = gameScoresStore.getGameScoreList();
});
/** スコアのスコアを昇順に取得する */
const sortGameScores = (() => {
  gameScores.value.sort(
    (a, b) => b.mode.toString().localeCompare(a.mode) || b.score - a.score
  );
});
/** ローカルストレージのゲームのスコアを削除する */
const resetGameScoreFromStorage = (() => {
  gameScoresStore.deleteGameScoreList();
});

/** ゲームのデータを初期化する */
const resetModalData = (() => {
  gameScores.value = [];
  lastScore = {
    score: "",
    mode: "",
    time: "",
  };
  currentListMode.value = "";
});
</script>
