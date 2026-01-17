<script setup lang="js">
import { ref } from 'vue'
import { useGameScoresStore } from "@/stores/gameScores.js";
//インポートした関数を呼び出してストアをインスタンス化して変数に代入
const gameScoresStore = useGameScoresStore();

const sliderValue = ref(0)
/** ゲームのデータを初期化する */
const resetModalData = (() => {
  // ローカルストレージのゲームのスコアを削除する 
  gameScoresStore.deleteGameScoreList();
});
</script>
<template>
  <v-container>
    <v-slider v-model="sliderValue" :max="60" :min="1" :step="1" thumb-label></v-slider>
    <br />
    <v-btn color="primary" text @click="resetModalData()">
      スコアを初期化する
    </v-btn>
  </v-container>
</template>