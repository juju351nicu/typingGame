<script setup lang="ts">
import { computed } from "vue";
import TheHeader from "@/components/TheHeader.vue";
import TheFooter from "@/components/TheFooter.vue";
import AppAlerts from "@/components/AppAlerts.vue";
import { useConfigStore } from "@/stores/config";
import { useAuthStore } from "@/stores/auth";
import UApp from "@nuxt/ui/components/App.vue";
import { ja } from "@nuxt/ui/locale";
import { useDisplayTheme } from "@/composables/useDisplayTheme";
import type { Alert } from "@/types/interfaces";
/** ゲームの設定情報に関するストア情報 */
const configStore = useConfigStore();
/** 認証状態に関するストア情報 */
const authStore = useAuthStore();

// ページ再読み込み後も、sessionStorageのJWTを使ってログインユーザーを復元する。
void authStore.restoreSession();

const { isDarkMode } = useDisplayTheme(configStore);

/** アプリ全体で表示する認証通知 */
const authAlerts = computed((): Alert[] => {
  return authStore.authNotice ? [authStore.authNotice] : [];
});
</script>
<template>
  <!--
    モーダル表示中もスクロールバー分の余白を足さない（従来どおりレイアウトを動かさない）。
    裏のページのスクロールは useOverlayScrollBlock で止める。
  -->
  <UApp :locale="ja" :scroll-body="false">
    <div class="app-shell" :class="{ 'app-shell--dark': isDarkMode }">
      <TheHeader />
      <main class="main__board">
        <AppAlerts :alerts="authAlerts" />
        <router-view />
      </main>
      <TheFooter />
    </div>
  </UApp>
</template>
<style>
/*
 * モーダルなどbody直下へ描画される要素からも参照できるよう、
 * 画面共通の色はルート要素に定義する。ダークモードは <html class="dark"> で切り替える。
 */
:root {
  --app-bg: #e0e0e0;
  --app-card-bg: #ffffff;
  --app-card-text: rgba(0, 0, 0, 0.87);
  --app-border: #e2e6ea;
  --app-code-bg: #f9f2f4;
  --app-input-error-bg: #fff5f5;
  --app-pre-bg: #f5f5f5;
  --app-row-alt-bg: #f9f9f9;
  --app-scrim: #000000;
  --app-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  --app-shadow-strong: 0 4px 18px rgba(0, 0, 0, 0.18);
  --app-surface: #ffffff;
  --app-surface-muted: #f8f9fa;
  --app-text: #222222;
  --app-text-muted: #666666;
  --app-track-bg: #f1f3f5;
}

:root.dark {
  --app-bg: #121212;
  --app-card-bg: #212121;
  --app-card-text: #ffffff;
  --app-border: #3a3f47;
  --app-code-bg: #2c2027;
  --app-input-error-bg: #3a2020;
  --app-pre-bg: #17191d;
  --app-row-alt-bg: #24272c;
  --app-scrim: #ffffff;
  --app-shadow: 0 2px 8px rgba(0, 0, 0, 0.28);
  --app-shadow-strong: 0 4px 18px rgba(0, 0, 0, 0.4);
  --app-surface: #1e1f24;
  --app-surface-muted: #252830;
  --app-text: #f2f2f2;
  --app-text-muted: #c4c7ce;
  --app-track-bg: #343942;
}

.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main__board {
  background-color: var(--app-bg);
  color: var(--app-text);
  flex: 1 0 auto;
  max-width: 100%;
  /* 固定表示のヘッダー分だけ本文を下げる。 */
  padding-top: 64px;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
