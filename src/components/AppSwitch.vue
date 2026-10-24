<script setup lang="ts">
import { computed } from "vue";
import USwitch from "@nuxt/ui/components/Switch.vue";

interface Props {
  /** スイッチのオン・オフ */
  modelValue: boolean;
  /** スイッチ横に表示するラベル */
  label?: string;
}

const props = withDefaults(defineProps<Props>(), {
  label: "",
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

/** USwitchと同期するオン・オフ状態 */
const checked = computed({
  get: (): boolean => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value),
});
</script>
<template>
  <USwitch
    v-model="checked"
    :label="props.label"
    class="app-switch"
    :ui="{
      container: 'app-switch__container',
      base: 'app-switch__track',
      thumb: 'app-switch__thumb',
      wrapper: 'app-switch__wrapper',
      label: 'app-switch__label',
    }"
  />
</template>
<style>
/* Material Designのinsetスイッチと同じ寸法・色にそろえる。 */
.app-switch {
  align-items: center;
  flex: 0 1 auto;
  min-height: 56px;
}

.app-switch__container.app-switch__container {
  height: auto;
}

.app-switch__track.app-switch__track {
  background: transparent;
  border: 0;
  border-radius: 9999px;
  height: 32px;
  position: relative;
  width: 52px;
}

/* 背景だけを半透明にし、つまみは不透明のまま表示する。 */
.app-switch__track.app-switch__track::before {
  background-color: #424242;
  border-radius: inherit;
  content: "";
  inset: 0;
  opacity: 0.6;
  position: absolute;
  transition: 0.2s background-color cubic-bezier(0.4, 0, 0.2, 1);
}

:root.dark .app-switch__track.app-switch__track::before {
  background-color: #c8c8c8;
}

.app-switch__track[data-state="checked"]::before {
  background-color: var(--ui-primary);
}

:root.dark .app-switch__track[data-state="checked"]::before {
  background-color: var(--ui-primary);
}

.app-switch__thumb.app-switch__thumb {
  background-color: #ffffff;
  box-shadow: none;
  height: 24px;
  left: 4px;
  position: absolute;
  top: 4px;
  transform: scale(0.6666666667);
  transition: 0.15s 0.05s transform cubic-bezier(0, 0, 0.2, 1);
  width: 24px;
}

:root.dark .app-switch__thumb.app-switch__thumb {
  background-color: #ccbfd6;
}

.app-switch__thumb[data-state="checked"].app-switch__thumb {
  transform: translateX(20px);
}

.app-switch__wrapper.app-switch__wrapper {
  margin: 0;
  padding-inline-start: 10px;
}

.app-switch__label.app-switch__label {
  color: inherit;
  font-size: 1rem;
  font-weight: 400;
  letter-spacing: 0.009375em;
}
</style>
