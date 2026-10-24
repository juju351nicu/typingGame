<script setup lang="ts">
import { computed } from "vue";
import UIcon from "@nuxt/ui/components/Icon.vue";

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

/** パンくずリストに表示する項目 */
const items = computed((): BreadcrumbLink[] => {
  return props.items;
});
</script>
<template>
  <div>
    <nav aria-label="パンくずリスト">
      <ul class="breadcrumbs">
        <template v-for="(item, index) in items" :key="item.title">
          <li v-if="index > 0" class="breadcrumbs__divider" aria-hidden="true">
            <UIcon name="i-lucide-chevron-right" class="breadcrumbs__icon" />
          </li>
          <li
            class="breadcrumbs__item"
            :class="{ 'breadcrumbs__item--disabled': item.disabled }"
          >
            <span v-if="item.disabled" aria-current="page">
              {{ item.title }}
            </span>
            <router-link
              v-else-if="item.to"
              :to="item.to"
              class="breadcrumbs__link"
            >
              {{ item.title }}
            </router-link>
            <a v-else :href="item.href" class="breadcrumbs__link">
              {{ item.title }}
            </a>
          </li>
        </template>
      </ul>
    </nav>
  </div>
</template>
<style scoped>
.breadcrumbs {
  align-items: center;
  display: flex;
  line-height: 1.6;
  list-style: none;
  padding: 16px 12px;
}

.breadcrumbs__item {
  align-items: center;
  color: inherit;
  display: inline-flex;
  padding: 0 4px;
  vertical-align: middle;
}

.breadcrumbs__item--disabled {
  opacity: 0.38;
  pointer-events: none;
}

.breadcrumbs__link {
  color: inherit;
  text-decoration: none;
}

.breadcrumbs__link:hover {
  text-decoration: underline;
}

.breadcrumbs__divider {
  display: inline-block;
  padding: 0 8px;
  vertical-align: middle;
}

.breadcrumbs__icon {
  height: 24px;
  vertical-align: middle;
  width: 24px;
}
</style>
