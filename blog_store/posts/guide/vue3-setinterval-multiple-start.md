---
id: vue3-setinterval-multiple-start
title: Vue3 の setInterval 多重起動で単語が大量生成された話
date: 2026-05-10
section: guide
description: Vue3 + TypeScript でタイピングゲームを作成中に発生した、setInterval の多重起動バグについて原因と解決方法をまとめました。
tags: Vue 3, TypeScript, setInterval
---

# Vue3 の setInterval 多重起動で単語が大量生成された話

## はじめに

Vue3 + TypeScript でタイピングゲームを作成していた際に、
`setInterval` の多重起動によるバグにハマったので、その原因と解決方法をまとめます。

---

## やりたかったこと

一定時間ごとに単語を生成し、画面に表示する処理を実装しました。

```ts
setInterval(() => {
  addWord();
}, 1000);
```

---

## 発生した問題

ゲームを再スタートすると、単語の出現速度がどんどん速くなる現象が発生しました。
再スタートするたびに単語が一斉に出現し、setInterval が重複して動作していることに気づきました。

```text
1回目：正常
2回目：2倍速
3回目：3倍速
```

---

## 原因

原因はシンプルで、**setInterval が複数回実行されていたこと**でした。

```ts
// NGパターン
const startGame = () => {
  setInterval(() => {
    addWord();
  }, 1000);
};
```

👉 startGame を呼ぶたびに新しいタイマーが増える

---

## 解決方法

### ① タイマー ID を保持する

```ts
const timerId = ref<number | null>(null);
```

---

### ② setInterval の戻り値を保存

```ts
timerId.value = setInterval(() => {
  addWord();
}, 1000);
```

---

### ③ clearInterval で停止

```ts
if (timerId.value !== null) {
  clearInterval(timerId.value);
  timerId.value = null;
}
```

---

### ④ ゲーム開始前に必ずリセット

```ts
const startGame = () => {
  stopGame(); // 既存タイマー停止

  timerId.value = setInterval(() => {
    addWord();
  }, 1000);
};
```

## また、コンポーネント破棄時にも clearInterval を実行するため、onUnmounted でタイマー停止処理を呼ぶようにしました。

## 学んだこと

- setInterval は自動で止まらない
- 再実行時は必ず clearInterval が必要
- タイマーは「状態」として管理するべき

---

## 実務的な観点

今回の問題は、実務でもよくあるバグです。

- 二重 API 呼び出し
- 多重イベント登録
- メモリリーク

👉 「リソースを解放する」という意識が重要

---

## まとめ

setInterval は便利ですが、管理を誤るとバグの原因になります。
Vue で扱う場合は、必ず「開始・停止」をセットで設計することが重要です。
