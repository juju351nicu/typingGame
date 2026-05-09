<script setup lang="ts">
import { ref, onMounted } from "vue";
import Keyboard from "simple-keyboard";
import "simple-keyboard/build/css/index.css"; // CSSをインポート

const input = ref("");
let keyboard: Keyboard | null = null;

/**
 * 仮想キーボードの内容を更新
 * @param inputVal
 */
const onChange = (inputVal: string) => {
  input.value = inputVal;
};

/**
 * 仮想キーボードの入力を処理
 * @param button
 */
const onKeyPress = (button: string) => {
  console.log("Button pressed", button);
};

/**
 * リアルタイム入力に対応
 * @param event
 */
const onInputChange = (event: Event) => {
  //  targetをHTMLInputElementにキャストしてvalueを取得
  const target = event.target as HTMLInputElement;
  console.log(input.value);
  keyboard?.setInput(target.value);
  input.value = target.value;
};

onMounted(() => {
  // インスタンスを初期化
  keyboard = new Keyboard({
    onChange: onChange,
    onKeyPress: onKeyPress,
    physicalKeyboardHighlight: true,
    physicalKeyboardHighlightPress: true,
    physicalKeyboardHighlightTextColor: "red",
    physicalKeyboardHighlightBgColor: "yellow",
  });
});
</script>
<template>
  <div>
    <!-- 入力フィールド -->
    <input
      :value="input"
      class="input"
      @input="onInputChange"
      placeholder="タップして入力"
    />
    <!-- 仮想キーボード表示エリア -->
    <div class="simple-keyboard"></div>
  </div>
</template>
<style scoped>
/* CSSでスタイルを調整 */
.simple-keyboard {
  margin-top: 20px;
}

.input {
  width: 100%;
  padding: 10px;
  font-size: 16px;
}
</style>
