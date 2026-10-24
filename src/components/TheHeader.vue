<script setup lang="ts">
import AppSideMenu from "@/components/AppSideMenu.vue";
import Const from "@/constants/const";
import { useAuthStore } from "@/stores/auth";
import UButton from "@nuxt/ui/components/Button.vue";
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
  <header class="app-bar">
    <div class="app-bar__content">
      <UButton
        class="app-bar__nav-icon"
        data-side-menu-toggle
        color="neutral"
        variant="ghost"
        icon="i-lucide-menu"
        aria-label="メニューを開く"
        :aria-expanded="drawer"
        @click="drawer = !drawer"
      />
      <div class="app-title">{{ title }}</div>
      <div class="app-bar__actions">
        <UButton
          class="mr-10 header_list header-link--about"
          color="neutral"
          variant="ghost"
          active-class="header_list--active"
          :to="{ name: 'AboutUs' }"
        >
          当サイトについて
        </UButton>
        <UButton
          class="mr-10 header_list header-link--blog"
          color="neutral"
          variant="ghost"
          active-class="header_list--active"
          :to="{ name: 'BlogPostList' }"
        >
          ブログ
        </UButton>
        <UButton
          v-if="isBackendApiEnabled && !authStore.isLoggedIn"
          class="mr-10 header_list"
          color="neutral"
          variant="ghost"
          active-class="header_list--active"
          :to="{ name: 'LoginPage' }"
        >
          ログイン
        </UButton>
        <UButton
          v-else-if="isBackendApiEnabled"
          class="mr-10 header_list"
          color="neutral"
          variant="ghost"
          icon="i-lucide-log-out"
          @click="logout"
        >
          {{ loginEmail }}
        </UButton>
      </div>
    </div>
  </header>
  <AppSideMenu v-model:drawer="drawer" />
</template>
<style scoped>
.app-bar {
  background: #673ab7;
  box-shadow:
    0 2px 4px -1px rgba(0, 0, 0, 0.2),
    0 4px 5px 0 rgba(0, 0, 0, 0.14),
    0 1px 10px 0 rgba(0, 0, 0, 0.12);
  color: #ffffff;
  height: 64px;
  left: 0;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1004;
}

.app-bar__content {
  align-items: center;
  display: flex;
  height: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;
}

.app-bar__nav-icon {
  border-radius: 50%;
  flex-shrink: 0;
  height: 48px;
  justify-content: center;
  margin-inline-start: 4px;
  min-width: 0;
  padding: 0;
  width: 48px;
}

.app-bar__nav-icon :deep(svg) {
  height: 24px;
  margin: 0;
  width: 24px;
}

.app-title {
  flex: 1 1;
  font-size: 1.25rem;
  font-weight: 400;
  letter-spacing: 0;
  line-height: 1.75rem;
  margin-inline-start: 20px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-bar__actions {
  display: flex;
  justify-content: flex-end;
}

.header_list {
  font-size: medium;
}

/* 表示中ページのボタンは、従来のactive表示と同じく薄い白で塗る。 */
.header_list--active {
  background: rgba(255, 255, 255, 0.12);
}

@media (max-width: 600px) {
  .app-title {
    flex: 0 1 auto;
    font-size: 1.05rem;
    max-width: none;
    overflow: visible;
    text-overflow: clip;
  }

  .header_list {
    display: none;
  }

  .app-bar__content {
    gap: 2px;
    padding-right: 6px;
  }

  .mr-10 {
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
