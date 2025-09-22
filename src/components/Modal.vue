<template>
  <div class="text-center">
    <v-dialog v-model="dialog" width="500">
      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          モーダルタイトル
        </v-card-title>

        <v-card-text>
          {{ scoreMessage }}
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="dialog = false">
            閉じる
          </v-btn>
          <v-btn color="success" @click="reStartGame">
            再スタート
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup>
import { useGameScoresStore } from "@/stores/gameScores";
import { computed, reactive, ref, watch } from "vue";

//インポートした関数を呼び出してストアをインスタンス化して変数に代入
const gameScoresStore = useGameScoresStore();

const props = defineProps({
  isGameOver: Boolean,
});

/** ダイアログの表示・非表示 */
const dialog = ref(false);

/** ゲームモード */
const gemeModeList = computed(() => {
  return ["Easy", "Normal", "Hard"];
});

/** ゲームオーバーフラグ */
const isGameOverFlag = computed(() => {
  const propValue = props.isGameOver;
  dialog.value = propValue
  return propValue;
});

const emit = defineEmits(["restart-game"]);

/** ゲームを再スタートする */
const reStartGame = (() => {
  emit("restart-game");
});

/** ゲームのEasyモード等のモード情報を取得する */
const getGameMode = ((index) => {
  return gemeModeList.value[Number(index)];
});

/** ゲームスコア */
const gameScores = ref([]);

/** 最後に取得したゲームスコア */
let lastScore = reactive({
  score: "",
  mode: "",
  time: "",
});

/** ゲームが終了した際に表示するメッセージ */
const scoreMessage = computed(() => {
  if (gameScores.value.length > 0) {
    let desc = `You completed ${lastScore.score} words in ${lastScore.time
      } time in ${getGameMode(lastScore.mode)} mode.`;
    return desc;
  }
  return "";
});

/** 現在のゲーム難易度 */
const currentListMode = ref("");

/** 現在のゲーム難易度に該当するゲームスコアリストを取得する */
const listGameScores = computed(() => {
  if (typeof currentListMode.value == "number") {
    return gameScores.value.filter(
      (gameScore) => gameScore.mode == currentListMode.value
    );
  }
  return gameScores.value;
});

/** ゲームオーバーフラグをウォッチにて判定する */
watch(isGameOverFlag, (newValue, _oldValue) => {
  if (newValue) {
    getGameScores();
    lastScore = gameScores.value[gameScores.value.length - 1];
    sortGameScores();
  } else {
    initGameData();
  }
});

/** ローカルストレージからゲームのスコアを取得する */
const getGameScores = (() => {
  return gameScores.value = gameScoresStore.getGameScoreList || [];
});

/** スコアのスコアを昇順に取得する */
const sortGameScores = (() => {
  return gameScores.value.sort(
    (a, b) => b.mode.toString().localeCompare(a.mode) || b.score - a.score
  );
});

/** ゲームのデータを初期化する */
const initGameData = (() => {
  gameScores.value = [];
  lastScore = {
    score: "",
    mode: "",
    time: "",
  };
  currentListMode.value = "";
});

</script>
<style scoped></style>
