<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from "vue";
import Util from "@/utils/util";

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
const isRestTimerFlag = computed(() => {
    return props.isRestTimer;
});
/**
 * 00:00:00形式で計測時間を取得する
 */
const getTimeStr = computed(() => {
    return Util.getCountDownTime(accumTime.value);
});

/** スタートを押した時刻 */
const startTime = ref<any>(null);

/** ストップ時間 */
const stopTime = ref(0);

/** setInterval()の格納用 */
const timerId = ref<any>(null);

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
    timerId.value = setInterval(checkTime, 10);
});

/**
 * ストップボタンを押下した際にインターバルをストップする。
 */
const stopTimer = (() => {
    if (timerId.value) {
        clearInterval(timerId.value);
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
/**
 * スタートボタンを押下した際にインターバルをストップする。
 */
 const childMethod = (() => {
    console.log('chiled component');
});
onMounted(() => {
    if (isGameStartedFlag) {
        startTimer();
    }
});
onUnmounted(() => {
    resetTimer();
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
// 【重要】親コンポーネントに公開する
defineExpose({
  childMethod
});
</script>
<template>
    <div class="game-status-item">
        <label>タイマー</label>
        <span>{{ getTimeStr }}</span>
    </div>
</template>
