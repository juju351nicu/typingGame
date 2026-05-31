<script setup lang="ts">
import { onMounted, onUnmounted, watch } from "vue";
import Keyboard from "simple-keyboard";
import "simple-keyboard/build/css/index.css";

interface Props {
  nextKey?: string;
  pressedKey?: string;
  missKey?: string;
}

const props = withDefaults(defineProps<Props>(), {
  nextKey: "",
  pressedKey: "",
  missKey: "",
});

let keyboard: Keyboard | null = null;

const keyboardLayout = {
  default: ["q w e r t y u i o p", "a s d f g h j k l", "z x c v b n m"],
};

const getKeyTheme = () => {
  const buttonTheme = [];

  if (props.nextKey !== "") {
    buttonTheme.push({
      class: "hg-next-key",
      buttons: props.nextKey,
    });
  }

  if (props.pressedKey !== "") {
    buttonTheme.push({
      class: "hg-pressed-key",
      buttons: props.pressedKey,
    });
  }

  if (props.missKey !== "") {
    buttonTheme.push({
      class: "hg-miss-key",
      buttons: props.missKey,
    });
  }

  return buttonTheme;
};

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
  background: #ffffff;
  border: 1px solid #e2e6ea;
  border-radius: 8px;
  padding: 10px;
}

.keyboard-status {
  color: #555555;
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
