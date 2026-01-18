<script setup lang="js">
import { onMounted, ref } from 'vue'
import { useGameScoresStore } from "@/stores/gameScores.js";
import { useConfigStore } from "@/stores/config.js"
//インポートした関数を呼び出してストアをインスタンス化して変数に代入
const gameScoresStore = useGameScoresStore();
/** ゲームの設定情報に関するストア情報 */
const configStore = useConfigStore();

const insertSpeed = ref(configStore.getInsertionSpeed);

const animationSpeed = ref(configStore.getAnimationSpeed);
/** ゲームのデータを初期化する */
const resetModalData = (() => {
  // ローカルストレージのゲームのスコアを削除する 
  gameScoresStore.deleteGameScoreList();
});
onMounted(() => {
    console.log(configStore.getGameMode);
});
</script>
<template>
  <v-container>
    <v-slider v-model="insertSpeed" :max="60" :min="1" :step="1" thumb-label></v-slider>
    <br />
    <v-slider v-model="animationSpeed" :max="60" :min="1" :step="1" thumb-label></v-slider>
    <br />
    <v-btn color="primary" text @click="resetModalData()">
      スコアを初期化する
    </v-btn>
  </v-container>
</template>