<script setup lang="js">
import { ref, onMounted } from "vue";
import { useTheme } from 'vuetify';
import { useGameModeStore } from "@/stores/gameMode.js"
import Const from "@/constants/const.js";
/** サイドメニューフラグ */
const drawer = ref(false);

/** サイドメニュー */
const links = ref([
  {
    href: '/',
    title: 'ダッシュボード',
    icon: 'mdi-home',
  },
  {
    href: '/ScoresBoard',
    title: 'スコア一覧',
    icon: 'mdi-account',
  },
  {
    href: '/SettingBoard',
    title: '設定画面',
    icon: 'mdi-cog-outline',
  },
]);
/** テーマフラグ */
const isDarkMode = ref(false);
const theme = useTheme();
/** ゲーム難易度に関するストア情報 */
const gameModeStore = useGameModeStore();
/**
 * トグルボタン押下時にテーマを変更する。
 */
const changeTheme = () => {
  // darkModeのスイッチがON（True）の場合
  if (isDarkMode.value) {
    // リアクティブ変数：theme を 'dark' に設定
    theme.global.name.value = Const.DISPLAY_THEME.DARK;
  } else {
    // darkModeのスイッチがOFF（False）の場合、リアクティブ変数：theme を 'light' に設定
    theme.global.name.value = Const.DISPLAY_THEME.LIGHT;
  }
  // lightモード / darkモードの選択状態をストアに記録
  gameModeStore.saveDisplayMode(theme.global.name.value);
}
// ページ表示時に実行
onMounted(() => {
  // システムのdarkモード設定を確認 → darkモード指定時
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // darkモードとして画面表示する
    theme.global.name.value = Const.DISPLAY_THEME.DARK;
    // トグルスイッチをdarkモード有効化状態（ON）に切り替える
    isDarkMode.value = true;
  }
  // ローカルストレージ上のdarkモード設定を確認
  const disTheme = gameModeStore.getDisplayMode;
  // darkモードが指定されている場合
  if (disTheme === Const.DISPLAY_THEME.DARK) {
    // トグルスイッチをdarkモード有効化状態（ON）に切り替える
    isDarkMode.value = true;
    theme.global.name.value = disTheme;
  } else {
    // リアクティブ変数: theme を 'light' に設定
    isDarkMode.value = false;
    theme.global.name.value = disTheme;
  }
});
</script>
<template>
  <v-app-bar color="deep-purple" dark>
    <v-app-bar-nav-icon variant="text" @click="drawer = !drawer"></v-app-bar-nav-icon>
    <v-toolbar-title>メニュー</v-toolbar-title>
    <!-- dark theme switch -->
    <template v-slot:append>
      <v-switch v-model="isDarkMode" @change="changeTheme"
        :prepend-icon="isDarkMode ? 'mdi-weather-night' : 'mdi-weather-sunny'" hide-details inset class="mr-auto" />
    </template>
    <v-spacer></v-spacer>
  </v-app-bar>
  <v-navigation-drawer v-model="drawer" absolute>
    <v-list v-for="link in links" :key="link.title" variant="plain">
      <v-list-item :href="link.href">
        <template v-slot:prepend>
          <v-icon>{{ link.icon }}</v-icon>
        </template>
        <v-list-item-title>{{ link.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
