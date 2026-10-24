<script setup lang="ts">
import { computed, ref, useAttrs, useId } from "vue";
import UInput from "@nuxt/ui/components/Input.vue";
import UTextarea from "@nuxt/ui/components/Textarea.vue";
import UIcon from "@nuxt/ui/components/Icon.vue";
import AppOutlinedField from "@/components/AppOutlinedField.vue";

defineOptions({ inheritAttrs: false });

interface Props {
  /** 入力値 */
  modelValue: string;
  /** 枠線上に表示するラベル */
  label?: string;
  /** inputのtype属性 */
  type?: string;
  /** inputのname属性 */
  name?: string;
  /** inputのautocomplete属性 */
  autocomplete?: string;
  /** 未入力時に表示する文字 */
  placeholder?: string;
  /** 入力欄の先頭に表示するアイコン */
  prependIcon?: string;
  /** 入力欄の末尾に表示するアイコン */
  appendIcon?: string;
  /** 末尾アイコンの読み上げ名。指定するとボタンとして操作できる */
  appendLabel?: string;
  /** エラー表示にするか */
  error?: boolean;
  /** 入力欄の高さ */
  density?: "default" | "comfortable" | "compact";
  /** 入力欄の下に補足表示用の余白を確保しないか */
  hideDetails?: boolean;
  /** 入力欄の下に表示するエラーメッセージ。指定するとエラー表示になる */
  errorMessage?: string;
  /** 入力欄の下に表示する補足説明 */
  hint?: string;
  /** 文字数カウンターの上限。指定すると「入力文字数/上限」を表示する */
  counter?: number;
  /** 複数行入力にするか */
  multiline?: boolean;
  /** 複数行入力の初期行数 */
  rows?: number;
}

const props = withDefaults(defineProps<Props>(), {
  label: "",
  type: "text",
  name: undefined,
  autocomplete: undefined,
  placeholder: undefined,
  prependIcon: undefined,
  appendIcon: undefined,
  appendLabel: undefined,
  error: false,
  density: "default",
  hideDetails: false,
  errorMessage: "",
  hint: "",
  counter: undefined,
  multiline: false,
  rows: 4,
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
  "click:append": [];
}>();

/** 呼び出し元の属性。classは外枠へ、それ以外（idやspellcheck等）はinputへ渡す */
const attrs = useAttrs();

/** inputへ渡す属性 */
const inputAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

/** 補足表示（エラー・説明）の要素ID。入力欄のaria-describedbyに使う */
const detailsId = useId();

/** エラー表示にするか */
const hasError = computed((): boolean => {
  return props.error || props.errorMessage.length > 0;
});

/** 入力欄の下に表示する文言 */
const detailsMessage = computed((): string => {
  return props.errorMessage || props.hint;
});

/** UInputと同期する入力値 */
const inputValue = computed({
  get: (): string => props.modelValue,
  set: (value: string) => emit("update:modelValue", value),
});

/** 入力欄のコンポーネント参照 */
const inputRef = ref<{ inputRef?: HTMLInputElement | null } | null>(null);

/**
 * 入力欄へフォーカスする。
 *
 * ゲーム開始直後など、親コンポーネントから入力を始めさせるために公開する。
 */
const focus = (): void => {
  inputRef.value?.inputRef?.focus();
};

defineExpose({ focus });
</script>
<template>
  <div class="app-text-field" :class="attrs.class" :style="attrs.style">
    <AppOutlinedField
      :label="props.label"
      :has-value="props.modelValue.length > 0"
      :error="hasError"
      :density="props.density"
      :has-prepend="!!props.prependIcon"
      :multiline="props.multiline"
    >
      <span
        v-if="props.prependIcon"
        class="app-text-field__prepend"
        aria-hidden="true"
      >
        <UIcon :name="props.prependIcon" class="app-text-field__icon" />
      </span>
      <UTextarea
        v-if="props.multiline"
        v-model="inputValue"
        v-bind="inputAttrs"
        :name="props.name"
        :placeholder="props.placeholder"
        :rows="props.rows"
        :aria-label="props.label || undefined"
        :aria-invalid="hasError || undefined"
        :aria-describedby="detailsMessage ? detailsId : undefined"
        variant="none"
        class="app-text-field__control app-text-field__control--multiline"
        :ui="{ base: 'app-text-field__input app-text-field__textarea' }"
      />
      <UInput
        v-else
        ref="inputRef"
        v-model="inputValue"
        v-bind="inputAttrs"
        :aria-invalid="hasError || undefined"
        :aria-describedby="detailsMessage ? detailsId : undefined"
        :type="props.type"
        :name="props.name"
        :autocomplete="props.autocomplete"
        :placeholder="props.placeholder"
        :aria-label="props.label || undefined"
        variant="none"
        class="app-text-field__control"
        :ui="{ base: 'app-text-field__input' }"
      />
      <button
        v-if="props.appendIcon && props.appendLabel"
        type="button"
        class="app-text-field__append"
        :aria-label="props.appendLabel"
        @click="emit('click:append')"
      >
        <UIcon :name="props.appendIcon" class="app-text-field__icon" />
      </button>
      <span
        v-else-if="props.appendIcon"
        class="app-text-field__append"
        aria-hidden="true"
      >
        <UIcon :name="props.appendIcon" class="app-text-field__icon" />
      </span>
    </AppOutlinedField>
    <div v-if="!props.hideDetails" class="app-text-field__details">
      <span
        v-if="detailsMessage"
        :id="detailsId"
        class="app-text-field__message"
        :class="{ 'app-text-field__message--error': props.errorMessage }"
      >
        {{ detailsMessage }}
      </span>
      <span
        v-if="props.counter"
        class="app-text-field__counter"
        :class="{
          'app-text-field__message--error':
            props.modelValue.length > props.counter,
        }"
        aria-hidden="true"
      >
        {{ props.modelValue.length }}/{{ props.counter }}
      </span>
    </div>
  </div>
</template>
<style>
/* Material Designのoutlined入力欄と同じ寸法・色にそろえる。 */
.app-text-field {
  display: flex;
  flex-direction: column;
}

.app-text-field__control.app-text-field__control {
  align-items: center;
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
}

.app-text-field__input.app-text-field__input {
  color: inherit;
  font-size: 16px;
  height: 100%;
  letter-spacing: 0.009375em;
  min-height: inherit;
  padding: 0 16px;
}

.app-text-field__input::placeholder {
  color: currentColor;
  opacity: 0.38;
}

/* ラベルがある入力欄では、ラベルと重ならないようフォーカス中だけプレースホルダーを表示する。 */
.app-field--labeled:not(.app-field--focused)
  .app-text-field__input::placeholder {
  opacity: 0;
}

.app-text-field__prepend + .app-text-field__control .app-text-field__input {
  padding-left: 6px;
}

.app-text-field__control:has(+ .app-text-field__append) .app-text-field__input {
  padding-right: 6px;
}

.app-text-field__prepend,
.app-text-field__append {
  align-items: center;
  display: flex;
  flex-shrink: 0;
  opacity: 0.6;
}

:root.dark .app-text-field__prepend,
:root.dark .app-text-field__append {
  opacity: 0.7;
}

.app-text-field__prepend {
  padding-inline: 12px 0;
}

.app-text-field__append {
  padding-inline: 0 12px;
}

button.app-text-field__append {
  cursor: pointer;
}

.app-text-field__icon {
  height: 24px;
  width: 24px;
}

/* 入力欄の下の補足表示。Material Designのhelper textと同じ寸法にする。 */
.app-text-field__details {
  display: flex;
  font-size: 0.75rem;
  gap: 8px;
  justify-content: space-between;
  letter-spacing: 0.0333333333em;
  line-height: 1rem;
  min-height: 22px;
  padding: 6px 16px 0;
}

.app-text-field__message {
  opacity: 0.6;
}

.app-text-field__counter {
  margin-left: auto;
  opacity: 0.6;
  white-space: nowrap;
}

.app-text-field__message--error.app-text-field__message--error {
  color: var(--ui-error);
  opacity: 1;
}

.app-text-field__control--multiline.app-text-field__control--multiline {
  align-items: stretch;
}

.app-text-field__textarea.app-text-field__textarea {
  line-height: 1.5;
  padding-bottom: 12px;
  padding-top: 16px;
  resize: vertical;
}
</style>
