<script setup lang="ts">
import Alerts from "@/components/Alerts.vue";
import VirtualKeyBoard from "@/components/VirtualKeyBoard.vue"
import { onMounted, ref } from 'vue'
import { useGameScoresStore } from "@/stores/gameScores";
import { useConfigStore } from "@/stores/config"
import { useTheme } from 'vuetify';
import Const from "@/constants/const";

//インポートした関数を呼び出してストアをインスタンス化して変数に代入
const gameScoresStore = useGameScoresStore();
/** ゲームの設定情報に関するストア情報 */
const configStore = useConfigStore();

/** 選択されたゲームの難易度 */
const selectedOption = ref(configStore.getGameMode);

/** ゲーム難易度の選択項目 */
const options = ref<any>(Const.DIFFICULTY_LEVEL);

/** テーマフラグ */
const isDarkMode = ref(configStore.getDisplayMode);
const theme = useTheme();

/**
 * トグルボタン押下時にテーマを変更する。
 */
const changeTheme = (): void => {
  // darkModeのスイッチがON（True）の場合
  if (isDarkMode.value) {
    // リアクティブ変数：theme を 'dark' に設定
    theme.global.name.value = Const.DISPLAY_THEME.DARK;
  } else {
    // darkModeのスイッチがOFF（False）の場合、リアクティブ変数：theme を 'light' に設定
    theme.global.name.value = Const.DISPLAY_THEME.LIGHT;
  }
  // lightモード / darkモードの選択状態をストアに記録
  configStore.saveDisplayMode(isDarkMode.value);
}

/**
 * ゲームの難易度設定する
 * @param mode 難易度
 */
const setGameMode = ((mode: number) => {
  configStore.saveGameMode(mode);
});

/** 仮想キーボードの表示有無 */
const isVirtualKeyBoard = ref(configStore.getIsVirtualKeyBoard);
/**
 * 仮想キーボードの表示有無を変更する。
 */
const changeVirtualKeyBoard = () => {
  configStore.saveIsVertualKeyBoard(isVirtualKeyBoard.value);
}
/** アラートに表示するメッセージ */
const alerts = ref<any[]>([]);
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

</script>
<template>
  <v-container>
    <Alerts :alerts="alerts" />
    <v-row>
      <v-col  class="pa-2 ma-2">
        <!-- dark theme switch -->
        <span>ダークモード</span>
        <v-switch v-model="isDarkMode" @change="changeTheme"
          :prepend-icon="isDarkMode ? 'mdi-weather-night' : 'mdi-weather-sunny'" hide-details inset class="mr-auto" />
      </v-col>
      <v-col  class="pa-2 ma-2">
        <span>難易度</span>
        <v-select v-model="selectedOption" :items="options" :item-title="options.title" :item-value="options.value"
          label="Game Mode" @update:modelValue="setGameMode" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6" >
        <span>仮想キーボード</span>
        <v-switch v-model="isVirtualKeyBoard" @change="changeVirtualKeyBoard" color="primary" label="on"></v-switch>
      </v-col>
      <v-col cols="6">
        <v-btn color="primary" text @click="resetModalData()">
          スコアを初期化する
        </v-btn>
      </v-col>
    </v-row>
    <VirtualKeyBoard v-if="isVirtualKeyBoard" />
  </v-container>
</template>