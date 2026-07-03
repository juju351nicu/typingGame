<script setup lang="ts">
import TheHeader from "@/components/TheHeader.vue";
import TheFooter from "@/components/TheFooter.vue";
import { useConfigStore } from "@/stores/config";
import { useTheme } from "vuetify";
import { useDisplayTheme } from "@/composables/useDisplayTheme";
/** ゲームの設定情報に関するストア情報 */
const configStore = useConfigStore();
const theme = useTheme();

const { isDarkMode } = useDisplayTheme(configStore, theme);
</script>
<template>
  <v-app class="app-shell" :class="{ 'app-shell--dark': isDarkMode }">
    <v-main class="main__board">
      <TheHeader />
      <router-view />
    </v-main>
    <TheFooter />
  </v-app>
</template>
<style>
.app-shell {
  --app-bg: #e0e0e0;
  --app-border: #e2e6ea;
  --app-code-bg: #f9f2f4;
  --app-input-error-bg: #fff5f5;
  --app-pre-bg: #f5f5f5;
  --app-row-alt-bg: #f9f9f9;
  --app-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  --app-shadow-strong: 0 4px 18px rgba(0, 0, 0, 0.18);
  --app-surface: #ffffff;
  --app-surface-muted: #f8f9fa;
  --app-text: #222222;
  --app-text-muted: #666666;
  --app-track-bg: #f1f3f5;
}

.app-shell--dark {
  --app-bg: #121212;
  --app-border: #3a3f47;
  --app-code-bg: #2c2027;
  --app-input-error-bg: #3a2020;
  --app-pre-bg: #17191d;
  --app-row-alt-bg: #24272c;
  --app-shadow: 0 2px 8px rgba(0, 0, 0, 0.28);
  --app-shadow-strong: 0 4px 18px rgba(0, 0, 0, 0.4);
  --app-surface: #1e1f24;
  --app-surface-muted: #252830;
  --app-text: #f2f2f2;
  --app-text-muted: #c4c7ce;
  --app-track-bg: #343942;
}

.main__board {
  background-color: var(--app-bg);
  color: var(--app-text);
}
</style>
