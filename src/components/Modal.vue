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
  return gameScores.value = gameScoresStore.getGameScoreList;
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
<style scoped>
/* Modal */

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--black);
  background-color: rgba(0, 0, 0, .5);
  opacity: 0;
  visibility: hidden;
  transition: all .3s ease-out;
  color: var(--white);
}

.modal.open {
  visibility: visible;
  opacity: 1
}

.modal.open .modal-content {
  transform: translateY(0)
}

.modal-content {
  width: 80%;
  max-width: 100rem;
  max-height: 55rem;
  margin: 2.5rem auto 0;
  border-radius: .6rem;
  background-color: var(--main-bg-color);
  border: .6rem solid var(--white);
  box-shadow: 0 8px 24px rgba(0, 0, 0, .75);
  transition: all .3s ease-out;
  transform: translateY(-100rem);
  overflow-y: auto;
}

.modal-header {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center
}

.modal-title {
  font-size: 2rem;
  font-weight: 500
}

.modal-body {
  padding: 2rem 1rem;
  border-top: 1px solid var(--color-alto);
  border-bottom: 1px solid var(--color-alto);
  font-size: 2rem;
  text-align: center
}

.modal-body p {
  padding: 0 5rem 2rem;
}

.modal-footer {
  padding: 1rem;
  display: flex;
  justify-content: center;
  grid-gap: 2.5rem
}

.game-scores-container {
  width: 100%;
  max-width: 60rem;
  max-height: 24rem;
  overflow-y: auto;
  box-shadow: var(--bs-lg);
  margin: 1rem auto 0;
  box-shadow: 0 1px 6px rgba(0, 0, 0, .75);
}

.game-scores {
  width: 100%;
  border-collapse: collapse;
  font-size: 1.8rem;
}

.game-scores td,
.game-scores th {
  text-align: left;
  padding: 1rem;
}

.game-scores tr:not(:last-child) td,
th {
  border-bottom: 1px solid var(--color-alto);
}

.modal .game-option {
  justify-content: flex-end;
  align-items: center;
  max-width: 20rem;
  margin-left: auto;
  font-size: 1.5rem;
}

.modal .game-option select {
  min-width: 15rem;
  font-size: 1.5rem;
}
</style>
