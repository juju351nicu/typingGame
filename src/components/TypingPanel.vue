<script setup lang="js">
import { onMounted, reactive, ref, useTemplateRef, watch, computed } from "vue";

const props = defineProps(["isGameStarted", "typingWords", "isRestTimer", "gameScore", "isGameOver", "selectedOption", "inputValue"]);

const emit = defineEmits(["update:isGameOver", "update:gameScore", "update:inputValue"]);

/** ゲームスタートフラグ */
const isGameStartedFlag = computed(() => {
    return props.isGameStarted;
});

/** タイピング用単語リスト */
const typingWords = computed(() => {
    return props.typingWords;
});

/** リセットフラグ */
const isRestFlag = computed(() => {
    return props.isRestTimer;
});

/** ゲームスコア */
const gameScore = computed({
    get: () => props.gameScore,
    set: (value) => emit("update:gameScore", value)
});

/** ゲームオーバーフラグ */
const isGameOverFlag = computed({
    get: () => props.isGameOver,
    set: (value) => emit("update:isGameOver", value)
});

/** 選択されたゲームの難易度 */
const selectedOptionValue = computed(() => {
    return props.selectedOption;
});

/** テキストボックスに入力された値 */
const typeBoxValue = computed({
    get: () => props.inputValue,
    set: (value) => emit("update:inputValue", value)
});

/** 現在表示している単語リスト */
const currentWords = ref([]);

/**　設定オブジェクト */
let config = reactive({
    wordStyleWidth: 200,
    wordInsertionSpeeds: [4, 3, 2],
    wordAnimationSpeeds: [60, 30, 15],
    currentInsertionSpeed: 4,
    currentAnimationSpeed: 60,
});

/**
 * アニメーションの表示速度を設定する
 * @param selectedOption 選択したオプション値
 */
const setWordAnimationSpeed = ((selectedOption) => {
    config.currentAnimationSpeed = config.wordAnimationSpeeds[
        selectedOption
    ];
    config.currentInsertionSpeed = config.wordInsertionSpeeds[
        selectedOption
    ];
});

onMounted(() => {
    /** 単語をシャッフルする */
    shuffleWords();
    setWordAnimationSpeed(selectedOptionValue.value);
});

/** 単語を表示するインターバル */
let interval = reactive({
    insertion: null,
    animation: null,
});

/** 入力された単語があっていた場合、CSSのクラスを設定する */
const checkCharacter = ((typeBox) => {
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
    isGameOverFlag.value = true;
    clearInterval();
});

/** 出題された単語と入力した単語の値を比較判定する */
const checkWordEquality = ((typeBox) => {
    const word = typeBox;
    const index = currentWords.value.findIndex(
        (item) => item.characters.join("") == word
    );
    //一致した場合
    if (index != -1) {
        currentWords.value.splice(0, 1);
        typeBoxValue.value = "";
        gameScore.value++;
        checkGameCompleted();
    }
});

/** 単語をシャッフルする */
const shuffleWords = (() => {
    for (let index = typingWords.value.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * index);
        const tempWord = typingWords.value[index];
        typingWords.value[index] = typingWords.value[randomIndex];
        typingWords.value[randomIndex] = tempWord;
    }
});

/** 単語を表示するテンプレート要素 */
const wordsBoard = useTemplateRef("typing-panel");

/**
 *  表示される単語のHTML要素の高さを比較判定する。
 *  現在表示されている単語と「typing-panel」要素の縦幅を比較する。
 * 「typing-panel」要素の縦幅を下回った場合、ゲームを終了する。
 */
const checkIsTopToBottom = (() => {
    let wordsBoardTop = wordsBoard.value.offsetHeight;
    currentWords.value.forEach((_, index) => {
        // 現在表示されている単語の縦幅を取得する。
        let wordPositionTop = getCurrentWordTop(index);
        // 現在表示されている単語と「typing-panel」要素の縦幅を比較する。
        if (wordPositionTop > wordsBoardTop) {
            gameFinish();

        }
    });
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

/** 「typing-panel」要素の横幅を取得する */
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

/**  ボタンをクリックするとゲームがスタートする */
watch(isGameStartedFlag, (newValue, _oldValue) => {
    if (newValue) {
        addWord();
        interval.insertion = setInterval(() => {
            addWord();
        }, config.currentInsertionSpeed * 1000);
        interval.animation = setInterval(() => {
            wordsTopToBottom();
            checkIsTopToBottom();
        }, config.currentAnimationSpeed);
    }
});

/** 入力された単語をウォッチする */
watch(typeBoxValue, (newValue, _oldValue) => {
    if (isGameOverFlag.value) {
        return;
    }
    checkWordEquality(newValue);
    checkCharacter(newValue);
});

/** 選択された難易度をウォッチする */
watch(selectedOptionValue, (newValue, _oldValue) => {
    setWordAnimationSpeed(newValue);
});

/** リセットフラグをウォッチする */
watch(isRestFlag, (newValue, _oldValue) => {
    if (newValue) {
        currentWords.value = [];
        currentWordIndex.value = 0;
        shuffleWords();
    }
});
</script>
<template>
    <div class="words-board" ref="typing-panel">
        <template v-for="word in currentWords">
            <div class="word" :style="word.style">
                <template v-for="(character, index) in word.characters">
                    <span :class="word.classList[index]">{{ character }} </span>
                </template>
            </div>
        </template>
    </div>
</template>
<style>
.words-board {
    background-color: #e0e0e0;
    color: #000000;
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
    color: #ffffff;
    border-radius: 1rem;
}

.word span {
    font-size: 2rem;
}

.correct {
    color: #00FF00;
}

.incorrect {
    color: #ff0000;
}

::-webkit-scrollbar {
    width: .8rem;
}

::-webkit-scrollbar-track {
    background: #dddddd;
}

::-webkit-scrollbar-thumb {
    background: #888888;
}

::-webkit-scrollbar-thumb:hover {
    background: #555555;
}
</style>