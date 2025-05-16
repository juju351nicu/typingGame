<template>
    <table>
        <thead>
            <tr>
                <td colspan="2">
                    <h1> {{ getTimeStr() }} </h1>
                </td>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <button v-if="status !== 'start'" @click="startTimer()">スタート</button>
                    <button v-else @click="stopTimer()">ストップ</button>
                </td>
                <td>
                    <button @click="resetTimer()">リセット</button>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script setup>
import { ref } from "vue";
/** 実行状態 */
const status = ref("clear");
/** 計測時間 */
const accumTime = ref(0);
/** スタートを押した時刻 */
const startTime = ref(null);
/** ストップ時間 */
const stopTime = ref(0);
/** setInterval()の格納用 */
const timer = ref(null);
/**
 * 
 */
const checkTime = () => {
    accumTime.value = Date.now() - startTime.value + stopTime.value;
};
/**
 * スタートボタンを押下した際にインターバルをストップする。
 */
const startTimer = (() => {
    status.value = "start";

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

    status.value = "stop";
    startTime.value = null;
    stopTime.value = accumTime.value;
});
/**
 * リセットボタンを押下した際に各変数をクリアする。
 */
const resetTimer = (() => {
    stopTimer();
    status.value = "clear";
    accumTime.value = 0;
    startTime.value = null;
    stopTime.value = 0;
});
/**
 * 計測時間を返却する。
 */
const getTimeStr = (() => {
    // this.time is milliseconds
    // 1秒 = 1000ミリ秒
    // 1分 = 60 * 1000ミリ秒
    // 1時間 = 60 * 60 * 1000ミリ秒
    const currentTime = accumTime.value;
    let milliseconds = currentTime % 1000;
    let seconds = Math.floor((currentTime / 1000) % 60);
    let minutes = Math.floor((currentTime / (60 * 1000)) % 60);
    let hours = Math.floor(currentTime / (60 * 60 * 1000));

    let millisecondsMultiplyTen = Math.floor(milliseconds / 10);

    millisecondsMultiplyTen = ("0" + millisecondsMultiplyTen).slice(-2);
    seconds = ("0" + seconds).slice(-2);
    minutes = ("0" + minutes).slice(-2);
    hours = hours < 100 ? ("0" + hours).slice(-2) : hours;

    return `${hours}:${minutes}:${seconds}.${millisecondsMultiplyTen}`;
});
</script>
