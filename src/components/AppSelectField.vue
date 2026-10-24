<script
  setup
  lang="ts"
  generic="T extends string | number | boolean | null | undefined"
>
import { computed } from "vue";
import USelect from "@nuxt/ui/components/Select.vue";
import AppOutlinedField from "@/components/AppOutlinedField.vue";

/** 選択肢 */
interface SelectOption {
  title: string;
  value: T;
}

interface Props {
  /** 選択中の値 */
  modelValue: T;
  /** 選択肢一覧 */
  items: readonly SelectOption[];
  /** 枠線上に表示するラベル */
  label?: string;
  /** ラベルを表示しない場合の読み上げ名 */
  ariaLabel?: string;
  /** 入力欄の高さ */
  density?: "default" | "comfortable" | "compact";
}

const props = withDefaults(defineProps<Props>(), {
  label: "",
  ariaLabel: undefined,
  density: "comfortable",
});

const emit = defineEmits<{
  "update:modelValue": [value: T];
}>();

/**
 * USelectへ渡す選択肢。
 *
 * Reka UIのSelectは空文字やnullを値に使えないため、
 * 選択肢の位置（文字列）を内部の値として扱い、元の値はemit時に戻す。
 */
const selectItems = computed(() => {
  return props.items.map((item, index) => ({
    label: item.title,
    value: String(index),
  }));
});

/** USelectと同期する選択位置 */
const selectedIndex = computed({
  get: (): string | undefined => {
    const index = props.items.findIndex(
      (item) => item.value === props.modelValue
    );
    return index >= 0 ? String(index) : undefined;
  },
  set: (value: string | undefined) => {
    const item = props.items[Number(value)];
    if (item) {
      emit("update:modelValue", item.value);
    }
  },
});
</script>
<template>
  <AppOutlinedField
    :label="props.label"
    :density="props.density"
    has-value
    class="app-select-field"
  >
    <USelect
      v-model="selectedIndex"
      :items="selectItems"
      :aria-label="props.label || props.ariaLabel"
      variant="none"
      :content="{ sideOffset: 0 }"
      class="app-select-field__control"
      :ui="{
        base: 'app-select-field__trigger',
        value: 'app-select-field__value',
        trailing: 'app-select-field__trailing',
        content: 'app-select-field__menu',
        viewport: 'app-select-field__viewport',
        group: 'app-select-field__group',
        item: 'app-select-field__item',
        itemTrailingIcon: 'app-select-field__check',
      }"
    >
      <template #trailing>
        <span class="app-select-field__arrow" aria-hidden="true" />
      </template>
    </USelect>
  </AppOutlinedField>
</template>
<style>
/* Material Designのoutlined選択欄と同じ寸法・色にそろえる。 */
.app-select-field__control.app-select-field__trigger {
  /* 入力欄が縦に伸びた場合も、従来と同じく選択値は上寄せで表示する。 */
  align-items: flex-start;
  border-radius: 4px;
  color: inherit;
  display: flex;
  font-size: 16px;
  height: 100%;
  letter-spacing: 0.009375em;
  min-height: inherit;
  padding: calc((var(--app-field-height) - 24px) / 2) 48px 0 16px;
  text-align: left;
  width: 100%;
}

.app-select-field__value {
  color: inherit;
  line-height: 1.5;
}

.app-select-field__trailing.app-select-field__trailing {
  padding-inline-end: 16px;
}

/* 塗りつぶしの下向き三角（従来の選択欄と同じ） */
.app-select-field__arrow {
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid currentColor;
  display: inline-block;
  height: 0;
  margin: 0 7px;
  opacity: 0.6;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  width: 0;
}

[data-state="open"] .app-select-field__arrow {
  transform: rotate(180deg);
}

.app-select-field__menu.app-select-field__menu {
  background: var(--app-card-bg);
  border-radius: 4px;
  box-shadow:
    0 5px 5px -3px rgba(0, 0, 0, 0.2),
    0 8px 10px 1px rgba(0, 0, 0, 0.14),
    0 3px 14px 2px rgba(0, 0, 0, 0.12);
  color: var(--app-card-text);
  --tw-ring-shadow: 0 0 #0000;
}

.app-select-field__group.app-select-field__group {
  padding: 8px 0;
}

.app-select-field__item.app-select-field__item {
  align-items: center;
  color: inherit;
  cursor: pointer;
  font-size: 1rem;
  letter-spacing: 0.009375em;
  min-height: 48px;
  padding: 4px 16px;
}

.app-select-field__item.app-select-field__item::before {
  border-radius: 0;
  inset: 0;
}

.app-select-field__item[data-highlighted]::before {
  background: currentColor;
  opacity: 0.04;
}

.app-select-field__item[data-state="checked"]::before {
  background: currentColor;
  opacity: 0.12;
}

.app-select-field__check {
  display: none;
}
</style>
