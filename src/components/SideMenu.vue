<template>
  <v-app-bar color="deep-purple" dark>
    <v-app-bar-nav-icon variant="text" @click="drawer = !drawer"></v-app-bar-nav-icon>
    <v-toolbar-title>メニュー</v-toolbar-title>
    <v-spacer></v-spacer>
  </v-app-bar>
  <v-navigation-drawer v-model="drawer" absolute>
    <v-list v-for="link in links" :key="link.title" color="primary" variant="plain">
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
    icon: 'fa view-dashboard',
  },
  {
    href: '/ScoreResults',
    title: 'スコア一覧',
    icon: 'fa fa-user',
  },
]);
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
