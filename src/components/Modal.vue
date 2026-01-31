<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useGameScoresStore } from "@/stores/gameScores";
import Util from "@/utils/util";
import { GameScore } from "@/types/interfaces";
//インポートした関数を呼び出してストアをインスタンス化して変数に代入
const gameScoresStore = useGameScoresStore();

const props = defineProps({
  isGameOver: Boolean,
});

const emit = defineEmits(["restart-game"]);

/** ダイアログの表示・非表示 */
const dialog = ref(false);

/** ゲームオーバーフラグ */
const isGameOverFlag = computed((): boolean => {
  return props.isGameOver;
});

/** ゲームを再スタートする */
const reStartGame = (() => {
  emit("restart-game");
  dialog.value = false;
});

/** ストアからゲームのスコアリストを取得する */
const gameScores = computed((): GameScore[] => {
  return gameScoresStore.getGameScoreList;
});

/** 最後に取得したゲームスコア */
let lastScore = reactive({
  score: 0,
  mode: 0,
  time: "",
  date: ""
});

/** ゲームが終了した際に表示するメッセージ */
const scoreMessage = computed((): string => {
  if (gameScores.value.length > 0) {
    let desc = `You completed ${lastScore.score} words in ${lastScore.time
      } time in ${Util.getLevel(lastScore.mode)} mode.`;
    return desc;
  }
  return "";
});

/** ゲームオーバーフラグをウォッチにて判定する */
watch(isGameOverFlag, (newValue, _oldValue) => {
  if (newValue) {
    dialog.value = true;
    // if (gameScores.value.length > 0) {
    lastScore = gameScores.value[gameScores.value.length - 1];
    // }
  }
});
</script>
<template>
  <div class="text-center">
    <v-dialog v-model="dialog" width="500" persistent>
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
          <v-btn color="success" @click="reStartGame">
            再スタート
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<style scoped></style>
