<script setup lang="ts" generic="T extends string">
import { computed } from "vue";
import UTabs from "@nuxt/ui/components/Tabs.vue";

/** タブの項目 */
interface TabItem {
  label: string;
  value: T;
}

interface Props {
  /** 選択中のタブ */
  modelValue: T;
  /** タブ一覧 */
  items: readonly TabItem[];
  /** 選択中タブの文字色・下線色（CSSの色指定） */
  color?: string;
  /** タブを横幅いっぱいに広げるか */
  grow?: boolean;
  /** タブの高さ。default=48px、comfortable=44px */
  density?: "default" | "comfortable";
  /** 選択中タブの下線を表示するか */
  slider?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  color: "var(--ui-primary)",
  grow: false,
  density: "default",
  slider: true,
});

const emit = defineEmits<{
  "update:modelValue": [value: T];
}>();

/** UTabsと同期する選択中タブ */
const selectedTab = computed({
  get: (): T => props.modelValue,
  set: (value: string | number) => {
    const item = props.items.find((tab) => tab.value === String(value));
    if (item) {
      emit("update:modelValue", item.value);
    }
  },
});

/** UTabsへ渡すタブ一覧 */
const tabItems = computed(() => {
  return props.items.map((item) => ({ label: item.label, value: item.value }));
});
</script>
<template>
  <UTabs
    v-model="selectedTab"
    :items="tabItems"
    :content="false"
    variant="link"
    class="app-tabs"
    :class="[
      `app-tabs--density-${props.density}`,
      {
        'app-tabs--grow': props.grow,
        'app-tabs--no-slider': !props.slider,
      },
    ]"
    :style="{ '--app-tabs-color': props.color }"
    :ui="{
      list: 'app-tabs__list',
      indicator: 'app-tabs__slider',
      trigger: 'app-tabs__tab',
      label: 'app-tabs__label',
    }"
  />
</template>
<style>
/* Material Designのタブと同じ寸法・文字設定にそろえる。 */
.app-tabs {
  --app-tabs-height: 48px;
  gap: 0;
}

.app-tabs--density-comfortable {
  --app-tabs-height: 44px;
}

.app-tabs__list.app-tabs__list {
  border: 0;
  height: var(--app-tabs-height);
  margin: 0;
  overflow: hidden;
  padding: 0;
}

.app-tabs__tab.app-tabs__tab {
  border-radius: 0;
  color: inherit;
  flex: 0 0 auto;
  font-size: 0.875rem;
  font-weight: 500;
  height: var(--app-tabs-height);
  justify-content: center;
  letter-spacing: 0.0892857143em;
  min-width: 90px;
  text-indent: 0.0892857143em;
  padding: 0 16px;
  position: relative;
  text-transform: uppercase;
}

.app-tabs--grow .app-tabs__tab.app-tabs__tab {
  flex: 1 0 auto;
  max-width: none;
}

.app-tabs__tab.app-tabs__tab::after {
  background: currentColor;
  content: "";
  inset: 0;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  transition: opacity 0.2s ease-in-out;
}

.app-tabs__tab:hover::after {
  opacity: 0.04;
}

.app-tabs__tab:focus-visible::after {
  opacity: 0.12;
}

.app-tabs__tab[data-state="active"].app-tabs__tab {
  color: var(--app-tabs-color);
}

.app-tabs__label.app-tabs__label {
  overflow: visible;
}

.app-tabs__slider.app-tabs__slider {
  background: var(--app-tabs-color);
  bottom: 0;
  height: 2px;
}

.app-tabs--no-slider .app-tabs__slider {
  display: none;
}
</style>
