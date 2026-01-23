
  <script setup lang="js">
  import { ref, onMounted } from "vue";
  import Keyboard from "simple-keyboard";
  import "simple-keyboard/build/css/index.css"; // CSSをインポート
  
  const input = ref("");
  let keyboard = null;
  
  // キーボードの内容を更新
  const onChange = (inputVal) => {
    input.value = inputVal;
  };
  
  // キーボードの入力を処理
  const onKeyPress = (button) => {
    console.log("Button pressed", button);
  };
  
  // リアルタイム入力に対応
  const onInputChange = (event) => {
    console.log(input.value);
    keyboard.setInput(event.target.value);
    input.value = event.target.value;
  };
  
  onMounted(() => {
    // インスタンスを初期化
    keyboard = new Keyboard({
      onChange: onChange,
      onKeyPress: onKeyPress,
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
      <!-- キーボード表示エリア -->
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
  