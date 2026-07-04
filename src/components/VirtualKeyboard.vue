<script setup lang="ts">
import { onMounted, onUnmounted, watch } from "vue";
import Keyboard from "simple-keyboard";
import "simple-keyboard/build/css/index.css";
import Util from "@/utils/gameUtils";

interface Props {
  /** 次に入力すべきキー */
  nextKey?: string;
  /** 直近で押されたキー */
  pressedKey?: string;
  /** 直近でミスしたキー */
  missKey?: string;
}

const props = withDefaults(defineProps<Props>(), {
  nextKey: "",
  pressedKey: "",
  missKey: "",
});

let keyboard: Keyboard | null = null;

/** simple-keyboardに渡すアルファベット配列 */
const keyboardLayout = {
  default: ["q w e r t y u i o p", "a s d f g h j k l", "z x c v b n m"],
};

/**
 * 現在の入力状態から、simple-keyboardへ渡すハイライト設定を作成する。
 *
 * @returns 次キー、押下キー、ミスキーのボタンテーマ設定
 */
const getKeyTheme = () => {
  const buttonTheme = [];

  if (!Util.isEmpty(props.nextKey, { trimString: false })) {
    buttonTheme.push({
      class: "hg-next-key",
      buttons: props.nextKey,
    });
  }

  if (!Util.isEmpty(props.pressedKey, { trimString: false })) {
    buttonTheme.push({
      class: "hg-pressed-key",
      buttons: props.pressedKey,
    });
  }

  if (!Util.isEmpty(props.missKey, { trimString: false })) {
    buttonTheme.push({
      class: "hg-miss-key",
      buttons: props.missKey,
    });
  }

  return buttonTheme;
};

/** simple-keyboardのハイライト設定を最新状態へ反映する。 */
const updateKeyTheme = () => {
  keyboard?.setOptions({
    buttonTheme: getKeyTheme(),
  });
};

onMounted(() => {
  keyboard = new Keyboard({
    layout: keyboardLayout,
    theme: "hg-theme-default learning-keyboard",
    buttonTheme: getKeyTheme(),
  });
});

onUnmounted(() => {
  keyboard?.destroy();
  keyboard = null;
});

watch(
  () => [props.nextKey, props.pressedKey, props.missKey],
  () => {
    updateKeyTheme();
  }
);
</script>

<template>
  <div class="virtual-keyboard-panel">
    <div class="keyboard-status">
      <span>Next: {{ nextKey || "-" }}</span>
      <span>Pressed: {{ pressedKey || "-" }}</span>
    </div>
    <div class="simple-keyboard"></div>
  </div>
</template>

<style scoped>
.virtual-keyboard-panel {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 8px;
  padding: 10px;
}

.keyboard-status {
  color: var(--app-text-muted);
  display: flex;
  font-size: 1.1rem;
  font-weight: bold;
  gap: 14px;
  margin-bottom: 8px;
}

.simple-keyboard {
  font-size: 1.1rem;
}

.simple-keyboard :deep(.hg-button) {
  border-radius: 6px;
  height: 32px;
}

.simple-keyboard :deep(.hg-next-key) {
  background: #fff3bf;
  box-shadow: inset 0 0 0 2px #f59f00;
  color: #5c3c00;
}

.simple-keyboard :deep(.hg-pressed-key) {
  background: #d0ebff;
  box-shadow: inset 0 0 0 2px #339af0;
  color: #0b7285;
}

.simple-keyboard :deep(.hg-miss-key) {
  background: #ffe3e3;
  box-shadow: inset 0 0 0 2px #fa5252;
  color: #c92a2a;
}
</style>
