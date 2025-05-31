<template>
  <side-menu />
  <v-container>
    <div class="game-board">
      <div class="words-board" ref="words_board">
        <template v-for="word in currentWords">
          <div class="word" :style="word.style">
            <template v-for="(character, index) in word.characters">
              <span :class="word.classList[index]">{{ character }} </span>
            </template>
          </div>
        </template>
      </div>
      <template v-if="isGameStarted">
        <v-text-field v-model="inputValue"  width="90%" />
        <div class="game-status">
          <Timer :accumTime="accumTime" @update:accumTime="$event => (accumTime = $event)"
            :isGameStartedFlag="isGameStarted" :isGameOverFlag="isGameOver" :isRestTimerFlag="isRestTimer" />
          <div class="game-status-item">
            <label>Score</label>
            <span>{{ gameScore }}</span>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="game-options">
          <div class="game-option">
            <label>Game Mode </label>
            <select @change="setGameMode" v-model="selectedGameMode">
              <option v-for="(gameMode, index) in config.modes" :value="index" :selected="index == selectedGameMode">
                {{ gameMode }}
              </option>
            </select>
          </div>
          <div class="game-option">
            <v-btn class="mt-2" color="success" @click="startGame" size="large" width="200px">
              Play➔
            </v-btn>
          </div>
        </div>
      </template>
    </div>
    <Modal :class="modalDisplayStatus ? 'open' : ''" :isGameOver="isGameOver" :modes="config.modes"
      @restart-game="restartGame" />
  </v-container>
</template>
<script setup>
import Modal from "../components/Modal.vue";
import SideMenu from "../components/SideMenu.vue";
import Timer from "../components/Timer.vue";
import { wordsData } from "../assets/words.js";
import { useGameScoresStore } from "../stores/gameScores";
import { useGameModeStore } from "../stores/gameMode.js"
import { onMounted, reactive, ref, useTemplateRef, watch } from "vue";
import util from "../utils/util.js";

/** ゲームスコアに関するストア情報 */
const gameScoresStore = useGameScoresStore();

/** ゲーム難易度に関するストア情報 */
const gameModeStore = useGameModeStore();

/**　タイピング用単語リスト */
const typingWords = ref(wordsData);

/**　ゲームスタートフラグ */
const isGameStarted = ref(false);

/**　設定オブジェクト */
let config = reactive({
  modes: ["Easy", "Normal", "Hard"],
  wordStyleWidth: 200,
  wordInsertionSpeeds: [4, 3, 2],
  wordAnimationSpeeds: [60, 30, 15],
  currentInsertionSpeed: 4,
  currentAnimationSpeed: 60,
});

/** 選択されたゲームの難易度 */
const selectedGameMode = ref(0);

/** アニメーションの表示速度を設定する */
const setWordAnimationSpeed = (() => {
  config.currentAnimationSpeed = config.wordAnimationSpeeds[
    selectedGameMode.value
  ];
  config.currentInsertionSpeed = config.wordInsertionSpeeds[
    selectedGameMode.value
  ];
});

setWordAnimationSpeed();

/** 経過時間 */
const accumTime = ref(0);

onMounted(() => {
  /** 単語をシャッフルする */
  shuffleWords();
});

/** 単語を表示するインターバル */
let interval = reactive({
  insertion: null,
  animation: null,
});

/** 現在表示している単語リスト */
const currentWords = ref([]);

/** タイピングされている単語 */
const inputValue = ref("");

/** ゲームオーバー判定フラグ */
const isGameOver = ref(false);

/** ゲームスコア */
const gameScore = ref(0);

/** 入力された単語があっていた場合、CSSのクラスを設定する */
const checkCharacter = ((typeBox) => {
  if (isGameOver.value) {
    return;
  }
  const inputValueArray = typeBox.split("");
  currentWords.value.forEach((word, wordIndex) => {
    word.characters.forEach((character, characherIndex) => {
      if (inputValueArray[characherIndex] == null) {
        currentWords.value[wordIndex].classList[characherIndex] = "";
      } else if (character == inputValueArray[characherIndex]) {
        currentWords.value[wordIndex].classList[characherIndex] = "correct";
      } else {
        currentWords.value[wordIndex].classList[characherIndex] = "incorrect";
      }
    });
  });
});

/** ゲームを終了する */
const gameFinish = (() => {
  isGameOver.value = true;
  clearInterval();
  saveGameScores();
  setTimeout(() => {
    setModalDisplay();
  }, 500);
});

/** 出題された単語と入力した単語の値を比較判定する */
const checkWordEquality = ((typeBox) => {
  if (isGameOver.value) {
    return;
  }
  const word = typeBox;
  const index = currentWords.value.findIndex(
    (item) => item.characters.join("") == word
  );
  //一致した場合
  if (index != -1) {
    currentWords.value.splice(0, 1);
    inputValue.value = "";
    gameScore.value++;
    checkGameCompleted();
  }
});

/** ゲームの時間・スコア・モードを保存する */
const saveGameScores = (() => {
  const data = {
    time: util.getCountDownTime(accumTime.value),
    score: gameScore.value,
    mode: selectedGameMode.value,
  }
  gameScoresStore.saveGameScoreList(data);
});

/** 総単語数を取得する */
const getWordsLength = (() => {
  return typingWords.value.length;
});

/** 単語をシャッフルする */
const shuffleWords = (() => {
  for (let index = getWordsLength - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * index);
    const tempWord = typingWords.value[index];
    typingWords.value[index] = typingWords.value[randomIndex];
    typingWords.value[randomIndex] = tempWord;
  }
});

/** モーダルにてリセットボタン押下時、データをリセットする */
const restartGame = (() => {
  resetGameData();
  shuffleWords();
  setModalDisplay();
});

/** 単語を表示するテンプレート要素 */
const wordsBoard = useTemplateRef("words_board");

/**
 *  表示される単語のHTML要素の高さを比較判定する。
 *  現在表示されている単語と「words_board」要素の縦幅を比較する。
 * 「words_board」要素の縦幅を下回った場合、ゲームを終了する。
 */
const checkIsTopToBottom = (() => {
  let wordsBoardTop = wordsBoard.value.offsetHeight;
  currentWords.value.forEach((_, index) => {
    // 現在表示されている単語の縦幅を取得する。
    let wordPositionTop = getCurrentWordTop(index);
    // 現在表示されている単語と「words_board」要素の縦幅を比較する。
    if (wordPositionTop > wordsBoardTop) {
      gameFinish();
    }
  });
});

/** ゲームの難易度設定する */
const setGameMode = (() => {
  gameModeStore.saveGameMode(selectedGameMode.value);
  setWordAnimationSpeed();
});

/**
 * 索引に該当する、現在表示されている単語の要素の上からの配置位置（距離）を取得する
 * @param index 索引
 */
const getCurrentWordTop = ((index) => {
  return Number(currentWords.value[index].style.top.slice(0, -2));
});

/**
 * 索引に該当する、単語の垂直位置を増加させる。
 * @param index 索引
 */
const increasePositionTop = ((index) => {
  currentWords.value[index].style.top = `${getCurrentWordTop(index) + 1
    }px`;
});

/**
 * 現在表示している各単語の単語の垂直位置を増加させる。
 */
const wordsTopToBottom = (() => {
  currentWords.value.forEach((_, index) => {
    increasePositionTop(index);
  });
});

/** モーダル表示フラグ */
const modalDisplayStatus = ref(false);

/**  モーダル表示有無を設定する */
const setModalDisplay = (() => {
  modalDisplayStatus.value = !modalDisplayStatus.value;
});

/** 現在表示されているの単語の索引 */
const currentWordIndex = ref(0);

/**  総単語数と入力完了した単語の数を比較判定する */
const isAddedAllWords = (() => {
  return typingWords.value.length == currentWordIndex.value;
});

/** ゲームが完了したかを判定する */
const checkGameCompleted = (() => {
  if (isAddedAllWords() && currentWords.value.length == 0) {
    gameFinish();
  }
});

/** 単語を表示するインターバルをクリアする */
const clearInterval = (() => {
  interval.insertion = null;
  interval.animation = null;
});

/** 「words_board」要素の横幅を取得する */
const getWordsBoardWidth = (() => {
  return wordsBoard.value.offsetWidth;
});

/** 表示するタイピング単語の横位置を生成する */
const getRandomPosition = (() => {
  return Math.floor(
    Math.random() * (getWordsBoardWidth() - config.wordStyleWidth)
  );
});

/** 表示するタイピングの単語を追加する */
const addWord = (() => {
  if (!isAddedAllWords()) {
    currentWords.value.push({
      characters: typingWords.value[currentWordIndex.value].split(""),
      classList: [],
      style: {
        left: `${getRandomPosition()}px`,
        top: "-30px",
      },
    });
    currentWordIndex.value++;
  }
});

/** ボタンをクリックするとゲームがスタートする  */
const startGame = (() => {
  isGameStarted.value = true;
  addWord();
  interval.insertion = setInterval(() => {
    addWord();
  }, config.currentInsertionSpeed * 1000);
  interval.animation = setInterval(() => {
    wordsTopToBottom();
    checkIsTopToBottom();
  }, config.currentAnimationSpeed);
});

/** リセットタイマーのフラグ */
const isRestTimer = ref(false);

/** ゲームのデータをリセットする */
const resetGameData = (() => {
  currentWords.value = [];
  gameScore.value = 0;
  isRestTimer.value = true;
  isGameOver.value = false;
  isGameStarted.value = false;
  currentWordIndex.value = 0;
  inputValue.value = "";
});


/** 入力された単語をウォッチする */
watch(inputValue, (newValue, _oldValue) => {
  checkWordEquality(newValue);
  checkCharacter(newValue);
});
</script>
<style>
:root {
  --main-bg-color: #DB2777;
  --black: #000000;
  --white: #ffffff;
  --lime: #00FF00;
  --red: #ff0000;
  --gray: #888888;
  --color-alto: #dddddd;
  --color-emperor: #555555;
  --color-malibu: #7bc1f7;
  --color-gainsboro: #e0e0e0;
}

*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

a {
  text-decoration: none;
  color: var(--black);
}

html {
  font-size: 10px;
}

body {
  background-color: var(--main-bg-color);
}

.game-board {
  width: 100vmin;
  height: 90vmin;
  display: flex;
  flex-direction: column;
  margin: 5vmin auto 0;
  -webkit-box-shadow: 1px 1px 5px 1px rgba(0, 0, 0, 0.75);
  -moz-box-shadow: 1px 1px 5px 1px rgba(0, 0, 0, 0.75);
  box-shadow: 1px 1px 5px 1px rgba(0, 0, 0, 0.75);
}

.words-board {
  background-color: var(--color-gainsboro);
  color: var(--black);
  height: 75%;
  padding: .5rem;
  font-size: 2.4rem;
  position: relative;
  overflow: hidden;
}

.word {
  position: absolute;
  padding: 0 1rem;
  background-color: rgba(0, 0, 0, 0.75);
  color: var(--white);
  border-radius: 1rem;
}

.word span {
  font-size: 2rem;
}

.word-input {
  width: 90%;
  margin: 1.5rem auto 0;
  height: 3.6rem;
  font-size: 1.6rem;
  padding: 1.5rem;
  border: 1px solid var(--color-alto);
  border-radius: 4px;
  -moz-border-radius: 4px;
  -webkit-border-radius: 4px;
}

.word-input:focus {
  outline: none;
  border: 1px solid var(--color-malibu);
  box-shadow: 0px 0px 8px var(--color-malibu);
  -moz-box-shadow: 0px 0px 8px var(--color-malibu);
  -webkit-box-shadow: 0px 0px 8px var(--color-malibu);
}

.game-status {
  background-color: mediumpurple;
  display: flex;
  justify-content: space-evenly;
  color: var(--white);
  margin-top: 1.5rem;
}

.game-status-item {
  background-color: mediumpurple;
  display: flex;
  flex-direction: column;
  text-align: center;
}

.game-board label {
  background-color: mediumpurple;
  font-weight: bold;
  font-size: 2.4rem;
  margin-bottom: .5rem;
  color: var(--white);
}

.game-board span {
  font-size: 2rem;
}

.game-options {
  display: flex;
  align-items: center;
  flex-direction: column;
  grid-gap: 1.5rem;
  padding: 1.5rem 0;
  background-color: mediumpurple;
}

.game-option {
  display: flex;
  flex-direction: column;
}

.game-option select {
  font-size: 1.6rem;
  padding: 1rem;
  border: none;
  outline: none;
  border-radius: 4px;
  background-color: transparent;
  box-shadow: 1px 1px 5px 1px rgba(0, 0, 0, 0.5);
  color: var(--white);
}

.game-option select option {
  background-color: var(--main-bg-color);
}

.correct {
  color: var(--lime);
}

.incorrect {
  color: var(--red);
}

.close {
  cursor: pointer;
  font-size: 3rem
}

.btn {
  outline: none;
  border: none;
  text-align: center;
  font-size: 1.5rem;
  border-radius: .3rem;
  transition: all .5s;
  background-color: transparent;
  color: var(--white);
  align-items: center;
  cursor: pointer;
  box-shadow: 0 1px 6px rgba(0, 0, 0, .75);
  padding: 1rem;
  display: flex;
  justify-content: center;
  min-width: 12rem;
}

.btn:hover .btn-arrow {
  padding-left: 1rem
}

.btn-arrow {
  width: 2.5rem;
  transition: all .3s ease-in-out
}



::-webkit-scrollbar {
  width: .8rem;
}

::-webkit-scrollbar-track {
  background: var(--color-alto);
}

::-webkit-scrollbar-thumb {
  background: var(--gray);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-emperor);
}

@media screen and (max-width: 600px) {
  .game-board {
    margin: 0;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
    box-shadow: none;
    height: 55rem;
  }
}
</style>