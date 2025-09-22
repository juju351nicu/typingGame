<template>
    <div class="game-status-item">
        <label>タイマー</label>
        <span>{{ getTimeStr }}</span>
    </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from "vue";
import util from "@/utils/util";


const props = defineProps(["accumTime", "isGameStarted", "isGameOver", "isRestTimer"]);

const emit = defineEmits(["update:accumTime"]);

/** 計測時間 */
const accumTime = computed({
    get: () => props.accumTime,
    set: (value) => emit("update:accumTime", value)
});

/** ゲームスタートフラグ */
const isGameStartedFlag = computed(() => {
    return props.isGameStarted;
});

/** ゲームオーバーフラグ */
const isGameOverFlag = computed(() => {
    return props.isGameOver;
});

/** リセットタイマーのフラグ */
const isRestTimerFlag =  computed(() => {
    return props.isRestTimer;
});
/**
 * 00:00:00形式で計測時間を取得する
 */
const getTimeStr = computed(() => {
    return util.getCountDownTime(accumTime.value);
});

/** スタートを押した時刻 */
const startTime = ref(null);

/** ストップ時間 */
const stopTime = ref(0);

/** setInterval()の格納用 */
const timer = ref(null);

/**
 * タイマーの時間を計算する
 */
const checkTime = () => {
    accumTime.value = Date.now() - startTime.value + stopTime.value;
};
/**
 * スタートボタンを押下した際にインターバルをストップする。
 */
const startTimer = (() => {
    if (startTime.value === null) {
        startTime.value = Date.now();
    }
    timer.value = setInterval(checkTime, 10);
});

/**
 * ストップボタンを押下した際にインターバルをストップする。
 */
const stopTimer = (() => {
    if (timer.value) {
        clearInterval(timer.value);
    }
    startTime.value = null;
    stopTime.value = accumTime.value;
});

/**
 * リセットボタンを押下した際に各変数をクリアする。
 */
const resetTimer = (() => {
    stopTimer();
    accumTime.value = 0;
    startTime.value = null;
    stopTime.value = 0;
});

onMounted(() => {
    if (isGameStartedFlag) {
        startTimer();
    }
});

/** ゲームオーバーフラグにてストップウォッチを止める */
watch(isGameOverFlag, (newValue, _oldValue) => {
    if (newValue) {
        stopTimer();
    }
});

/** リセットタイマーフラグにてタイマーをリセットする */
watch(isRestTimerFlag, (newValue, _oldValue) => {
    if (newValue) {
        resetTimer();
    }
});
</script>
