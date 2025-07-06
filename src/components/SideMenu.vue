<template>
  <v-app-bar color="deep-purple" dark>
    <v-app-bar-nav-icon variant="text" @click="drawer = !drawer"></v-app-bar-nav-icon>
    <v-toolbar-title>メニュー</v-toolbar-title>
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
<script setup>
import { ref } from "vue";

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
    href: '/ScoreResults',
    title: 'スコア一覧',
    icon: 'mdi-account',
  },
  {
    href: '/SettingBoard',
    title: '設定画面',
    icon: 'mdi-cog-outline',
  },
]);
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
