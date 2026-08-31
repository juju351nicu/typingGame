<script setup lang="ts">
import { computed, ref } from "vue";

interface SideMenuProps {
  /** サイドメニューを開いているか */
  drawer: boolean;
}

interface MenuLink {
  to: {
    name: string;
  };
  title: string;
  icon: string;
}

const props = defineProps<SideMenuProps>();

const emit = defineEmits<{
  "update:drawer": [value: boolean];
}>();

/** 親コンポーネントと同期するサイドメニューの開閉状態 */
const drawer = computed({
  get: (): boolean => props.drawer,
  set: (value: boolean) => emit("update:drawer", value),
});

/** サイドメニューに表示するページリンク */
const links = ref<MenuLink[]>([
  {
    to: { name: "GamePage" },
    title: "ゲーム",
    icon: "mdi-home",
  },
  {
    to: { name: "RankingPage" },
    title: "ランキング",
    icon: "mdi-trophy-outline",
  },
  {
    to: { name: "SettingsPage" },
    title: "設定",
    icon: "mdi-cog-outline",
  },
  {
    to: { name: "BlogPostList" },
    title: "開発ブログ",
    icon: "mdi-post-outline",
  },
  {
    to: { name: "AboutUs" },
    title: "このサイトについて",
    icon: "mdi-information-outline",
  },
]);
</script>
<template>
  <v-navigation-drawer v-model="drawer" temporary>
    <v-list v-for="link in links" :key="link.title" variant="plain">
      <v-list-item :to="link.to">
        <template #prepend>
          <v-icon>{{ link.icon }}</v-icon>
        </template>
        <v-list-item-title>{{ link.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>
