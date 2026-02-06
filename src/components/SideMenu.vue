<script setup lang="ts">
import { computed, ref } from "vue";

const props = defineProps(["drawer"]);

const emit = defineEmits(["update:drawer"]);
/** サイドメニューフラグ */
const drawer = computed({
  get: (): boolean => props.drawer,
  set: (value: boolean) => emit("update:drawer", value)
});

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
</script>
<template>
  <v-navigation-drawer v-model="drawer" temporary>
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
