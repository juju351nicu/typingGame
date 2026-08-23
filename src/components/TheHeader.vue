<script setup lang="ts">
import AppSideMenu from "@/components/AppSideMenu.vue";
import Const from "@/constants/const";
import { useAuthStore } from "@/stores/auth";
import { computed, ref } from "vue";

/** メニュータイトル */
const title = "Balloon Typing Game";
/** サイドメニューフラグ */
const drawer = ref(false);
/** 認証ストア */
const authStore = useAuthStore();
/** ログイン中ユーザーのメールアドレス */
const loginEmail = computed(() => authStore.currentUser?.loginEmail ?? "");
/** バックエンドAPIを使うか */
const isBackendApiEnabled = Const.BACKEND_API.ENABLED;

/**
 * ログアウトする。
 */
const logout = async (): Promise<void> => {
  await authStore.logout();
};
</script>
<template>
  <v-app-bar color="deep-purple" dark>
    <v-app-bar-nav-icon
      variant="text"
      @click="drawer = !drawer"
    ></v-app-bar-nav-icon>
    <v-toolbar-title class="app-title">{{ title }}</v-toolbar-title>
    <v-spacer />
    <div class="d-flex justify-end">
      <v-btn
        class="mr-10 header_list header-link--about"
        :to="{ name: 'AboutUs' }"
      >
        当サイトについて
      </v-btn>
      <v-btn
        class="mr-10 header_list header-link--blog"
        :to="{ name: 'BlogPostList' }"
      >
        ブログ
      </v-btn>
      <v-btn
        v-if="isBackendApiEnabled && !authStore.isLoggedIn"
        class="mr-10 header_list"
        :to="{ name: 'LoginPage' }"
      >
        ログイン
      </v-btn>
      <v-btn
        v-else-if="isBackendApiEnabled"
        class="mr-10 header_list"
        prepend-icon="mdi-logout"
        @click="logout"
      >
        {{ loginEmail }}
      </v-btn>
    </div>
  </v-app-bar>
  <AppSideMenu v-model:drawer="drawer" />
</template>
<style scoped>
.app-title {
  min-width: 0;
}

.header_list {
  font-size: medium;
}

@media (max-width: 600px) {
  .app-title {
    flex: 0 1 auto;
    font-size: 1.05rem;
    max-width: none;
  }

  .header_list {
    display: none;
  }

  :deep(.v-toolbar__content) {
    gap: 2px;
    padding-right: 6px;
  }

  :deep(.v-toolbar-title__placeholder) {
    overflow: visible;
    text-overflow: clip;
  }

  :deep(.v-btn.mr-10) {
    margin-right: 4px !important;
  }
}

@media (max-width: 420px) {
  .app-title {
    font-size: 0.98rem;
  }

  .header_list {
    font-size: 0.72rem;
    padding-left: 6px;
    padding-right: 6px;
  }
}
</style>
