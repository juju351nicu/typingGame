<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";
import Util from "@/utils/util";

const props = defineProps(["accumTime"]);

const emit = defineEmits(["update:accumTime"]);

/** 計測時間 */
const accumTime = computed({
    get: () => props.accumTime,
    set: (value) => emit("update:accumTime", value)
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

const isRunning = ref<boolean>(false);
/**
 * タイマーの時間を計算する
 */
const checkTime = () => {
    accumTime.value = Date.now() - startTime.value + stopTime.value;
};
/**
 * スタートボタンを押下した際にインターバルを開始する。
 */
const startTimer = (() => {
    console.log('スタートボタンを押下した際にインターバルを開始する。');
    if (isRunning.value) {
        return;
    }
    isRunning.value = true;
    if (startTime.value === null) {
        startTime.value = Date.now();
    }
    timerId.value = setInterval(checkTime, 10);
});

/**
 * ストップボタンを押下した際にインターバルをストップする。
 */
const stopTimer = (() => {
    console.log('ストップボタンを押下した際にインターバルをストップする。');
    isRunning.value = false;
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
    stopTime.value = 0;
});
// ページ表示時に実行
onMounted(() => {
    startTimer();
});
// ページ破棄に実行
onUnmounted(() => {
    resetTimer();
});
// defineExpose を使用してコンポーネント内に定義されたメソッドを親コンポーネントから参照できる様にしています。
defineExpose({ startTimer, stopTimer, resetTimer })
</script>
<template>
    <div class="game-status-item">
        <label>タイマー</label>
        <span>{{ getTimeStr }}</span>
    </div>
</template>
