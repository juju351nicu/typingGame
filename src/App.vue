<script setup lang="ts">
import TheHeader from "@/components/TheHeader.vue";
import TheFooter from "@/components/TheFooter.vue";
import { onMounted, ref } from 'vue'
import { useConfigStore } from "@/stores/config"
import { useTheme } from 'vuetify';
import Const from "@/constants/const";
/** ゲームの設定情報に関するストア情報 */
const configStore = useConfigStore();
/** テーマフラグ */
const isDarkMode = ref(configStore.getDisplayMode);
const theme = useTheme();
// ページ表示時に実行
onMounted(() => {
  // システムのdarkモード設定を確認 → darkモード指定時
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // darkモードとして画面表示する
    theme.global.name.value = Const.DISPLAY_THEME.DARK;
    // トグルスイッチをdarkモード有効化状態（ON）に切り替える
    isDarkMode.value = true;
    // lightモード / darkモードの選択状態をストアに記録
    configStore.saveDisplayMode(isDarkMode.value);
  }
  // ローカルストレージ上のdarkモード設定を確認
  const isDisTheme = configStore.getDisplayMode;
  // darkモードが指定されている場合
  if (isDisTheme) {
    // トグルスイッチをdarkモード有効化状態（ON）に切り替える
    isDarkMode.value = true;
    theme.global.name.value = Const.DISPLAY_THEME.DARK;
  } else {
    // リアクティブ変数: theme を 'light' に設定
    isDarkMode.value = false;
    theme.global.name.value = Const.DISPLAY_THEME.LIGHT;
  }
});
</script>
<template>
  <v-app>
    <v-main class="main__board">
      <TheHeader />
      <router-view />
    </v-main>
    <TheFooter />
  </v-app>
</template>
<style>
.main__board {
  background-color: #e0e0e0;
}
</style>