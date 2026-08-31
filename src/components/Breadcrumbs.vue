<script setup lang="ts">
import { computed } from "vue";

interface BreadcrumbLink {
  title: string;
  disabled?: boolean;
  href?: string;
  to?: string | { name: string };
}

interface Props {
  /** パンくずリストに表示する項目 */
  items: BreadcrumbLink[];
}

const props = defineProps<Props>();

/** Vuetifyのパンくずリストに渡す表示項目 */
const items = computed((): BreadcrumbLink[] => {
  return props.items;
});
</script>
<template>
  <div>
    <v-breadcrumbs :items="items">
      <template #divider>
        <v-icon icon="mdi-chevron-right"></v-icon>
      </template>
    </v-breadcrumbs>
  </div>
</template>
