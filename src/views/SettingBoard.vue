<script setup lang="js">
import VirtualKeyBoard from "@/components/VirtualKeyBoard.vue"
import { onMounted, ref } from 'vue'
import { useGameScoresStore } from "@/stores/gameScores.js";
import { useConfigStore } from "@/stores/config.js"
//インポートした関数を呼び出してストアをインスタンス化して変数に代入
const gameScoresStore = useGameScoresStore();
/** ゲームの設定情報に関するストア情報 */
const configStore = useConfigStore();

const insertSpeed = ref(configStore.getInsertionSpeed);

const animationSpeed = ref(configStore.getAnimationSpeed);
/** 仮想キーボードの表示有無 */
const isVirtualKeyBoard = ref(configStore.getIsVirtualKeyBoard);
/**
 * 仮想キーボードの表示有無を変更する。
 */
const changeVirtualKeyBoard = () => {
  configStore.saveIsVertualKeyBoard(isVirtualKeyBoard.value);
}
/** ゲームのデータを初期化する */
const resetModalData = (() => {
  // ローカルストレージのゲームのスコアを削除する 
  gameScoresStore.deleteGameScoreList();
  // OptionAPIの時は$reset()有効
  configStore.$reset();
});
onMounted(() => {
  console.log(configStore.getGameMode);
});
</script>
<template>
  <v-container>
    <v-slider v-model="insertSpeed" :max="6000" :min="1000" :step="100" thumb-label></v-slider>
    <br />
    <v-slider v-model="animationSpeed" :max="60" :min="1" :step="1" thumb-label></v-slider>
    <br />
    <v-switch v-model="isVirtualKeyBoard" @change="changeVirtualKeyBoard" color="primary" label="on"></v-switch>
    <v-btn color="primary" text @click="resetModalData()">
      スコアを初期化する
    </v-btn>
    <template v-if="isVirtualKeyBoard">
      <VirtualKeyBoard />
    </template>
  </v-container>
</template>