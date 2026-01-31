<script setup lang="ts">
import SideMenu from "@/components/SideMenu.vue";
import { ref, onMounted } from "vue";
import { useTheme } from 'vuetify';
import { useConfigStore } from "@/stores/config"
import Const from "@/constants/const";
/** ゲーム難易度に関するストア情報 */
const configStore = useConfigStore();
/** メニュータイトル */
const title = "タイピングゲーム";

/** サイドメニューフラグ */
const drawer = ref(false);

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
    <v-app-bar color="deep-purple" dark>
        <v-app-bar-nav-icon variant="text" @click="drawer = !drawer"></v-app-bar-nav-icon>
        <v-toolbar-title>{{ title }}</v-toolbar-title>
        <!-- dark theme switch -->
        <template v-slot:append>
            <v-switch v-model="isDarkMode" @change="changeTheme"
                :prepend-icon="isDarkMode ? 'mdi-weather-night' : 'mdi-weather-sunny'" hide-details inset
                class="mr-auto" />
        </template>
        <v-spacer></v-spacer>
    </v-app-bar>
    <SideMenu v-model:drawer="drawer" />
</template>
