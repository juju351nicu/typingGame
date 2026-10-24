<script setup lang="ts">
import { computed, ref } from "vue";

interface Props {
  /** 枠線上に表示するラベル。未指定の場合はラベルなし */
  label?: string;
  /** 値が入っているか。trueの場合はラベルを枠線上へ浮かせる */
  hasValue?: boolean;
  /** エラー表示にするか */
  error?: boolean;
  /** 入力欄の高さ。default=56px、comfortable=48px、compact=40px */
  density?: "default" | "comfortable" | "compact";
  /** 先頭アイコンを置くか。ラベルの初期位置をアイコン分ずらす */
  hasPrepend?: boolean;
  /** 複数行入力か。浮かせる前のラベルを1行目の位置に置く */
  multiline?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  label: "",
  hasValue: false,
  error: false,
  density: "default",
  hasPrepend: false,
  multiline: false,
});

/** 入力欄内の要素にフォーカスがあるか */
const isFocused = ref(false);

/** ラベルを枠線上に浮かせるか */
const isLabelFloating = computed((): boolean => {
  return props.hasValue || isFocused.value;
});
</script>
<template>
  <div
    class="app-field"
    :class="[
      `app-field--density-${props.density}`,
      {
        'app-field--focused': isFocused,
        'app-field--error': props.error,
        'app-field--floating': isLabelFloating,
        'app-field--prepend': props.hasPrepend,
        'app-field--labeled': !!props.label,
        'app-field--multiline': props.multiline,
      },
    ]"
    @focusin="isFocused = true"
    @focusout="isFocused = false"
  >
    <slot />
    <fieldset class="app-field__outline" aria-hidden="true">
      <legend v-if="props.label" class="app-field__notch">
        <span>{{ props.label }}</span>
      </legend>
    </fieldset>
    <span v-if="props.label" class="app-field__label" aria-hidden="true">
      {{ props.label }}
    </span>
  </div>
</template>
<style scoped>
/*
 * Material Designのoutlined入力欄と同じ見た目（枠線の切り欠きに浮くラベル）を再現する。
 * 入力部品自体はNuxt UIのUSelect / UInputをvariant="none"で中に置く。
 */
.app-field {
  --app-field-height: 56px;
  /* 文字色を基準に、枠線は38%、ラベルは60%の濃さで表示する。 */
  --app-field-border-color: color-mix(in srgb, currentColor 38%, transparent);
  --app-field-label-color: color-mix(in srgb, currentColor 60%, transparent);
  border-radius: 4px;
  color: inherit;
  display: flex;
  flex: 1 1 auto;
  font-size: 16px;
  letter-spacing: 0.009375em;
  min-height: var(--app-field-height);
  position: relative;
}

:root.dark .app-field {
  --app-field-label-color: color-mix(in srgb, currentColor 70%, transparent);
}

.app-field--density-comfortable {
  --app-field-height: 48px;
}

.app-field--density-compact {
  --app-field-height: 40px;
}

.app-field:hover {
  --app-field-border-color: color-mix(in srgb, currentColor 87%, transparent);
}

:root.dark .app-field:hover {
  --app-field-border-color: currentColor;
}

/* Material Designと同じく、色指定なしの入力欄はフォーカス時も文字色のまま枠線を太くする。 */
.app-field--focused {
  --app-field-border-color: currentColor;
  --app-field-label-color: currentColor;
}

.app-field--error {
  --app-field-border-color: var(--ui-error);
  --app-field-label-color: var(--ui-error);
}

.app-field__outline {
  border: 1px solid var(--app-field-border-color);
  border-radius: 4px;
  bottom: 0;
  left: 0;
  margin: 0;
  min-width: 0;
  padding: 0 8px;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: -6px;
  transition: border-color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.app-field--focused .app-field__outline {
  border-width: 2px;
  padding: 0 7px;
}

/* 枠線の切り欠き。ラベルが浮いたときだけ幅を持たせる。 */
.app-field__notch {
  font-size: 12px;
  height: 12px;
  line-height: 12px;
  max-width: 0.01px;
  padding: 0;
  visibility: hidden;
  white-space: nowrap;
}

.app-field__notch span {
  display: inline-block;
  padding: 0 4px;
}

.app-field--floating .app-field__notch {
  max-width: 100%;
}

.app-field__label {
  color: var(--app-field-label-color);
  left: 16px;
  letter-spacing: 0.009375em;
  line-height: 1.5;
  max-width: calc(100% - 32px);
  overflow: hidden;
  pointer-events: none;
  position: absolute;
  text-overflow: ellipsis;
  top: 50%;
  transform: translateY(-50%);
  transform-origin: left center;
  transition:
    top 0.15s cubic-bezier(0.4, 0, 0.2, 1),
    font-size 0.15s cubic-bezier(0.4, 0, 0.2, 1),
    left 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.app-field--prepend .app-field__label {
  left: 42px;
}

.app-field--multiline:not(.app-field--floating) .app-field__label {
  top: 28px;
}

.app-field--floating .app-field__label {
  font-size: 12px;
  left: 16px;
  top: 0;
}
</style>
