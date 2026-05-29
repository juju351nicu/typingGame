<script setup lang="ts">
import TheHeader from "@/components/TheHeader.vue";
import TheFooter from "@/components/TheFooter.vue";
import { onMounted } from "vue";
import { useConfigStore } from "@/stores/config";
import { useTheme } from "vuetify";
import Const from "@/constants/const";
/** ゲームの設定情報に関するストア情報 */
const configStore = useConfigStore();
const theme = useTheme();
// ページ表示時に実行
onMounted(() => {
  theme.global.name.value = Const.DISPLAY_THEME.LIGHT;
  configStore.saveDisplayMode(false);
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
