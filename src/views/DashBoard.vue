<template>
    <side-menu />
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
        <input
          type="text"
          class="word-input"
          v-model="inputValue"
          @input="
            checkWordEquality();
            checkCharacter();
          "
        />
        <div class="game-status">
          <div class="game-status-item">
            <label>Time</label>
            <span>{{ getTime }}</span>
          </div>
          <div class="game-status-item">
            <label>Score</label>
            <span>{{ score }}</span>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="game-options">
          <div class="game-option">
            <label>Game Mode </label>
            <select @change="setGameMode" v-model="selectedGameMode">
              <option
                v-for="(gameMode, index) in config.modes"
                :value="index"
                :selected="index == selectedGameMode"
              >
                {{ gameMode }}
              </option>
            </select>
          </div>
          <div class="game-option">
            <button class="btn" @click="play">Play<span class="btn-arrow">➔</span></button>
          </div>
        </div>
      </template>
    </div>
    <Modal
      :class="modalDisplayStatus ? 'open' : ''"
      :isGameover="gameOver"
      :modes="config.modes"
      @restart-game="restartGame"
    />
  </template>
  <script>
  import Modal from "../components/Modal.vue";
  import SideMenu from "../components/SideMenu.vue";
  import { words } from "../assets/words.js";
  export default {
    name: "DashBoard",
    data() {
      return {
        /**　タイピング用単語 */
        words: words,
        currentWords: [],
        gameOver: false,
        isGameStarted: false,
        wordIndex: 0,
        inputValue: "",
        selectedGameMode: 0,
        score: 0,
        modalDisplayStatus: false,
        config: {
          modes: ["Easy", "Normal", "Hard"],
          wordStyleWidth: 200,
          wordInsertionSpeeds: [4, 3, 2],
          wordAnimationSpeeds: [60, 30, 15],
          currentInsertionSpeed: 4,
          currentAnimationSpeed: 60,
        },
        interval: {
          insertion: null,
          animation: null,
          timer: null,
        },
        timer: {
          second: 0,
          minute: 0,
          hour: 0,
        },
      };
    },
    components: {
      Modal,
      SideMenu
    },
    computed: {
      /** 経過時間を取得る 00:00:00 */
      getTime() {
        let second = this.timer.second > 9 ? this.timer.second : `0${this.timer.second}`;
        let minute = this.timer.minute > 9 ? this.timer.minute : `0${this.timer.minute}`;
        let hour = this.timer.hour > 9 ? this.timer.hour : `0${this.timer.hour}`;
        return `${hour}:${minute}:${second}`;
      },
    },
    created() {
      this.selectedGameMode =
        Number(this.getLocalStorageData("gameMode")) || this.selectedGameMode;
      this.setWordAnimationSpeed();
    },
    mounted() {
      /** 単語をシャッフルする */
      this.shuffleWords();
    },
    methods: {
      /** ボタンをクリックするとゲームがスタートする  */
      play() {
        this.isGameStarted = true;
        this.startTimer();
        this.addWord();
        this.interval.insertion = setInterval(() => {
          this.addWord();
        }, this.config.currentInsertionSpeed * 1000);
        this.interval.animation = setInterval(() => {
          this.wordsTopToBottom();
          this.checkIsTopToBottom();
        }, this.config.currentAnimationSpeed);
      },
      /**
       * 出題された単語と入力した単語の値を判定する
       */
      checkWordEquality() {
        if (this.gameOver) return;
        let word = this.inputValue;
        let wordIndex = this.currentWords.findIndex(
          (item) => item.characters.join("") == word
        );
        //一致した場合
        if (wordIndex != -1) {
          this.currentWords.splice(0, 1);
          this.inputValue = "";
          this.score++;
          this.checkGameCompleted();
        }
      },
      checkCharacter() {
        if (this.gameOver) return;
        const inputValue = this.inputValue.split("");
        this.currentWords.forEach((word, wordIndex) => {
          word.characters.forEach((character, characherIndex) => {
            if (inputValue[characherIndex] == null) {
              this.currentWords[wordIndex].classList[characherIndex] = "";
            } else if (character == inputValue[characherIndex]) {
              this.currentWords[wordIndex].classList[characherIndex] = "correct";
            } else {
              this.currentWords[wordIndex].classList[characherIndex] = "incorrect";
            }
          });
        });
      },
      checkGameCompleted() {
        if (this.isAddedAllWords() && this.currentWords.length == 0) {
          this.gameFinish();
        }
      },
      checkIsTopToBottom() {
        let wordsBoardTop = this.$refs.words_board.offsetHeight;
        this.currentWords.forEach((_, index) => {
          let wordPositionTop = this.getCurrentWordTop(index);
          if (wordPositionTop > wordsBoardTop) {
            this.gameFinish();
          }
        });
      },
      /** ゲームを終了する */
      gameFinish() {
        this.gameOver = true;
        this.clearInterval();
        this.saveGameScores();
        setTimeout(() => {
          this.modalDisplayToggle();
        }, 500);
      },
      /** ゲームの時間・スコア・モードを保存する */
      saveGameScores() {
        let gameScores = JSON.parse(this.getLocalStorageData("gameScores")) || [];
        gameScores.push({
          time: this.getTime,
          score: this.score,
          mode: this.selectedGameMode,
        });
        this.setLocalStorageData("gameScores", JSON.stringify(gameScores));
      },
      addWord() {
        if (!this.isAddedAllWords()) {
          this.currentWords.push({
            characters: this.words[this.wordIndex].split(""),
            classList: [],
            style: {
              left: `${this.getRandomPosition()}px`,
              top: "-30px",
            },
          });
          this.wordIndex++;
        }
      },
      wordsTopToBottom() {
        this.currentWords.forEach((_, index) => {
          this.increasePositionTop(index);
        });
      },
      shuffleWords() {
        for (let wordIndex = this.words.length - 1; wordIndex > 0; wordIndex--) {
          const randomIndex = Math.floor(Math.random() * wordIndex);
          const tempWord = this.words[wordIndex];
          this.words[wordIndex] = this.words[randomIndex];
          this.words[randomIndex] = tempWord;
        }
      },
      restartGame() {
        this.resetGameData();
        this.shuffleWords();
        this.modalDisplayToggle();
      },
      /**
       * ローカルストレージからデータを取得する
       * @param dataName ローカルストレージのキー
       */
      getLocalStorageData(dataName) {
        return localStorage.getItem(dataName);
      },
      getWordsBoardWidth() {
        return this.$refs.words_board.offsetWidth;
      },
      getRandomPosition() {
        return Math.floor(
          Math.random() * (this.getWordsBoardWidth() - this.config.wordStyleWidth)
        );
      },
      getCurrentWordTop(wordIndex) {
        return Number(this.currentWords[wordIndex].style.top.slice(0, -2));
      },
      /**総単語数を取得する */
      getWordsLength() {
        this.words.length;
      },
      /**
       * ローカルストレージに保存する
       * @param dataName ローカルストレージのKey名 「gameScores」
       * @param data ゲームの時間・スコア・モードを保存
       */
      setLocalStorageData(dataName, data) {
        localStorage.setItem(dataName, data);
      },
      setGameMode() {
        this.setLocalStorageData("gameMode", this.selectedGameMode);
        this.setWordAnimationSpeed();
      },
      setWordAnimationSpeed() {
        this.config.currentAnimationSpeed = this.config.wordAnimationSpeeds[
          this.selectedGameMode
        ];
        this.config.currentInsertionSpeed = this.config.wordInsertionSpeeds[
          this.selectedGameMode
        ];
      },
      increasePositionTop(wordIndex) {
        this.currentWords[wordIndex].style.top = `${
          this.getCurrentWordTop(wordIndex) + 1
        }px`;
      },
      modalDisplayToggle() {
        this.modalDisplayStatus = !this.modalDisplayStatus;
      },
      isAddedAllWords() {
        return this.words.length == this.wordIndex;
      },
      clearInterval() {
        clearInterval(this.interval.animation);
        clearInterval(this.interval.insertion);
        clearInterval(this.interval.timer);
      },
      startTimer() {
        this.interval.timer = setInterval(() => {
          this.timer.second++;
          if (this.timer.second === 60) {
            this.timer.second = 0;
            this.timer.minute++;
          }
          if (this.timer.minute === 60) {
            this.timer.hour++;
            this.timer.minute = 0;
            this.timer.second = 0;
          }
          if (this.timer.hour === 24) {
            this.timer.hour = 0;
            this.timer.minute = 0;
            this.timer.second = 0;
          }
        }, 1000);
      },
      /** ゲームのデータをリセットする */
      resetGameData() {
        this.currentWords = [];
        this.timer = {
          second: 0,
          minute: 0,
          hour: 0,
        };
        this.score = 0;
        this.gameOver = false;
        this.isGameStarted = false;
        this.wordIndex = 0;
        this.inputValue = "";
      },
    },
  };
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
      display: flex;
      justify-content: space-evenly;
      color: var(--white);
      margin-top: 1.5rem;
  }
  
  .game-status-item {
      display: flex;
      flex-direction: column;
      text-align: center;
  }
  
  .game-board label {
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
  
  
  /* Modal */
  
  .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: var(--black);
      background-color: rgba(0, 0, 0, .5);
      opacity: 0;
      visibility: hidden;
      transition: all .3s ease-out;
      color: var(--white);
  }
  
  .modal.open {
      visibility: visible;
      opacity: 1
  }
  
  .modal.open .modal-content {
      transform: translateY(0)
  }
  
  .modal-content {
      width: 80%;
      max-width: 100rem;
      max-height: 55rem;
      margin: 2.5rem auto 0;
      border-radius: .6rem;
      background-color: var(--main-bg-color);
      border: .6rem solid var(--white);
      box-shadow: 0 8px 24px rgba(0, 0, 0, .75);
      transition: all .3s ease-out;
      transform: translateY(-100rem);
      overflow-y: auto;
  }
  
  .modal-header {
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center
  }
  
  .modal-title {
      font-size: 2rem;
      font-weight: 500
  }
  
  .close {
      cursor: pointer;
      font-size: 3rem
  }
  
  .modal-body {
      padding: 2rem 1rem;
      border-top: 1px solid var(--color-alto);
      border-bottom: 1px solid var(--color-alto);
      font-size: 2rem;
      text-align: center
  }
  
  .modal-body p {
      padding: 0 5rem 2rem;
  }
  
  .modal-footer {
      padding: 1rem;
      display: flex;
      justify-content: center;
      grid-gap: 2.5rem
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
  
  .game-scores-container {
      width: 100%;
      max-width: 60rem;
      max-height: 24rem;
      overflow-y: auto;
      box-shadow: var(--bs-lg);
      margin: 1rem auto 0;
      box-shadow: 0 1px 6px rgba(0, 0, 0, .75);
  }
  
  .game-scores {
      width: 100%;
      border-collapse: collapse;
      font-size: 1.8rem;
  }
  
  .game-scores td,
  .game-scores th {
      text-align: left;
      padding: 1rem;
  }
  
  .game-scores tr:not(:last-child) td,
  th {
      border-bottom: 1px solid var(--color-alto);
  }
  
  .modal .game-option {
      justify-content: flex-end;
      align-items: center;
      max-width: 20rem;
      margin-left: auto;
      font-size: 1.5rem;
  }
  
  .modal .game-option select {
      min-width: 15rem;
      font-size: 1.5rem;
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
  