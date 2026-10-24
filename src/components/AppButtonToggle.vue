<script setup lang="ts" generic="T extends string">
import UButton from "@nuxt/ui/components/Button.vue";

/** 切り替えボタンの項目 */
interface ToggleOption {
  title: string;
  value: T;
}

interface Props {
  /** 選択中の値 */
  modelValue: T;
  /** 選択肢一覧 */
  items: readonly ToggleOption[];
  /** 見た目。elevated=選択中を塗りつぶす、outlined=選択中を淡く塗る */
  variant?: "elevated" | "outlined";
  /** グループの読み上げ名 */
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "elevated",
  ariaLabel: undefined,
});

const emit = defineEmits<{
  "update:modelValue": [value: T];
}>();
</script>
<template>
  <div
    class="app-btn-toggle"
    :class="`app-btn-toggle--${props.variant}`"
    role="group"
    :aria-label="props.ariaLabel"
  >
    <UButton
      v-for="option in props.items"
      :key="option.value"
      class="app-btn-toggle__button"
      :class="{
        'app-btn-toggle__button--active': option.value === props.modelValue,
      }"
      color="neutral"
      variant="ghost"
      :aria-pressed="option.value === props.modelValue"
      @click="emit('update:modelValue', option.value)"
    >
      {{ option.title }}
    </UButton>
  </div>
</template>
<style scoped>
/* Material Designの切り替えボタン群と同じ見た目にする。 */
.app-btn-toggle {
  border-radius: 4px;
  display: inline-flex;
  flex-wrap: nowrap;
  height: 40px;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  vertical-align: middle;
}

.app-btn-toggle__button {
  border-radius: 0;
  height: auto;
  justify-content: center;
  position: relative;
}

.app-btn-toggle__button::after {
  background: currentColor;
  content: "";
  inset: 0;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  transition: opacity 0.2s ease-in-out;
}

.app-btn-toggle__button:hover::after {
  opacity: 0.04;
}

.app-btn-toggle__button:hover {
  background: inherit;
}

/* elevated: 未選択はカード色、選択中はprimaryで塗り、白を24%重ねる */
.app-btn-toggle--elevated .app-btn-toggle__button {
  background: var(--app-card-bg);
  color: var(--app-card-text);
}

.app-btn-toggle--elevated .app-btn-toggle__button--active {
  background: var(--ui-primary);
  color: #ffffff;
}

.app-btn-toggle--elevated .app-btn-toggle__button--active::after {
  opacity: 0.24;
}

/* outlined: 枠線で区切り、選択中はprimaryの文字色と12%の背景 */
.app-btn-toggle--outlined .app-btn-toggle__button {
  background: transparent;
  border: thin solid var(--app-btn-toggle-border);
  border-inline-end-width: 0;
  color: inherit;
}

.app-btn-toggle--outlined .app-btn-toggle__button:first-child {
  border-end-start-radius: 4px;
  border-start-start-radius: 4px;
}

.app-btn-toggle--outlined .app-btn-toggle__button:last-child {
  border-end-end-radius: 4px;
  border-inline-end-width: thin;
  border-start-end-radius: 4px;
}

.app-btn-toggle--outlined {
  --app-btn-toggle-border: rgba(0, 0, 0, 0.12);
}

:root.dark .app-btn-toggle--outlined {
  --app-btn-toggle-border: rgba(255, 255, 255, 0.12);
}

.app-btn-toggle--outlined .app-btn-toggle__button--active {
  color: var(--ui-primary);
}

.app-btn-toggle--outlined .app-btn-toggle__button--active::after {
  opacity: 0.12;
}
</style>
