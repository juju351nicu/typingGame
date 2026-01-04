<script setup lang="js">
import { computed, ref } from 'vue'
import { useGameScoresStore } from "@/stores/gameScores";
//インポートした関数を呼び出してストアをインスタンス化して変数に代入
const gameScoresStore = useGameScoresStore();

const showMessages = ref(false)
const messages = computed(() => {
  return showMessages.value ? ['Message'] : undefined
})

/** ゲームのデータを初期化する */
const resetModalData = (() => {
  // ローカルストレージのゲームのスコアを削除する 
  gameScoresStore.deleteGameScoreList();
});
</script>
<template>
  <v-switch v-model="showMessages" label="Show messages" hide-details></v-switch>
  <v-input :messages="messages" hint="I am hint" persistent-hint>
    Input
  </v-input>
  <v-btn color="primary" text @click="resetModalData()">
    スコアを初期化する
  </v-btn>
</template>