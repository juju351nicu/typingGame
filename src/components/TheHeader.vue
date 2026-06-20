<script setup lang="ts">
import AppSideMenu from "@/components/AppSideMenu.vue";
import { ref } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();
/** メニュータイトル */
const title = "Balloon Typing Game";
/**
 * 当サイトについてページへ遷移する
 */
const goAboutUs = () => {
  router.push({ name: "AboutUs" });
};
/**
 * ブログ記事一覧ページへ遷移する
 */
const goBlogList = () => {
  router.push({ name: "BlogPostList" });
};
/** サイドメニューフラグ */
const drawer = ref(false);
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
      <v-btn class="mr-10 header_list" @click="goAboutUs()"
        >当サイトについて</v-btn
      >
      <v-btn class="mr-10 header_list" @click="goBlogList()">ブログ</v-btn>
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
    max-width: 172px;
  }

  .header_list {
    font-size: 0.78rem;
    min-width: auto;
    padding-left: 8px;
    padding-right: 8px;
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
    max-width: 138px;
  }

  .header_list {
    font-size: 0.72rem;
    padding-left: 6px;
    padding-right: 6px;
  }
}
</style>
