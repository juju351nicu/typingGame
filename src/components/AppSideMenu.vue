<script setup lang="ts">
import { computed, ref } from "vue";

interface SideMenuProps {
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
/** サイドメニューフラグ */
const drawer = computed({
  get: (): boolean => props.drawer,
  set: (value: boolean) => emit("update:drawer", value),
});

/** サイドメニュー */
const links = ref<MenuLink[]>([
  {
    to: { name: "GamePage" },
    title: "ダッシュボード",
    icon: "mdi-home",
  },
  {
    to: { name: "RankingPage" },
    title: "スコア一覧",
    icon: "mdi-account",
  },
  {
    to: { name: "SettingsPage" },
    title: "設定画面",
    icon: "mdi-cog-outline",
  },
]);
</script>
<template>
  <v-navigation-drawer v-model="drawer" temporary>
    <v-list v-for="link in links" :key="link.title" variant="plain">
      <v-list-item :to="link.to">
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
