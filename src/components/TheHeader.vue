<script setup lang="ts">
import SideMenu from "@/components/SideMenu.vue";
import { ref } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();
/** メニュータイトル */
const title = "Balloon Typing Game";
/**
 * ブログ記事一覧ページに戻る
 */
const goAboutUs = () => {
  router.push({ name: "AboutUs" });
};
/**
 * ブログ記事一覧ページに戻る
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
    <v-toolbar-title>{{ title }}</v-toolbar-title>
    <v-spacer />
    <div class="d-flex justify-end">
      <v-btn class="mr-10 header_list" @click="goAboutUs()"
        >当サイトについて</v-btn
      >
      <v-btn class="mr-10 header_list" @click="goBlogList()">ブログ</v-btn>
    </div>
  </v-app-bar>
  <SideMenu v-model:drawer="drawer" />
</template>
<style scoped>
.header_list {
  font-size: medium;
}
</style>
