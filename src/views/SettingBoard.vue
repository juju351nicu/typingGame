<script setup lang="js">
import Alerts from "@/components/Alerts.vue";
import VirtualKeyBoard from "@/components/VirtualKeyBoard.vue"
import { onMounted, ref } from 'vue'
import { useGameScoresStore } from "@/stores/gameScores.ts";
import { useConfigStore } from "@/stores/config.ts"
import Const from "@/constants/const.ts";
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
/** アラートに表示するメッセージ */
const alerts = ref([]);
const isAlert = ref(false);
/** ゲームのデータを初期化する */
const resetModalData = (() => {
  // ローカルストレージのゲームのスコアを削除する 
  gameScoresStore.$reset();
  // OptionAPIの時は$reset()有効
  configStore.$reset();
  alerts.value.push({ message: "初期化しました。", type: Const.ALERT_TYPE.SUCCESS });
  isAlert.value = true;
});
onMounted(() => {
  console.log(configStore.getGameMode);
});
</script>
<template>
  <v-container>
    <Alerts :alerts="alerts" />
    <v-slider v-model="insertSpeed" :max="6000" :min="1000" :step="100" thumb-label></v-slider>
    <br />
    <v-slider v-model="animationSpeed" :max="60" :min="1" :step="1" thumb-label></v-slider>
    <br />
    <v-switch v-model="isVirtualKeyBoard" @change="changeVirtualKeyBoard" color="primary" label="on"></v-switch>
    <v-btn color="primary" text @click="resetModalData()">
      スコアを初期化する
    </v-btn>
    <VirtualKeyBoard v-if="isVirtualKeyBoard" />
  </v-container>
</template>