---
id: vue3-setinterval-multiple-start
title: Vue 3 の setInterval 多重起動で単語が大量生成された話
date: 2026-05-10
section: guide
description: Vue 3 + TypeScript のタイピングゲームで、再スタートのたびに単語の出現速度が上がっていく不具合が発生しました。原因の setInterval 多重起動と、タイマーを状態として管理する修正方法をまとめました。
tags: Vue 3, TypeScript, setInterval
---

# Vue 3 の setInterval 多重起動で単語が大量生成された話

## はじめに

Vue 3 + TypeScript でタイピングゲームを作成していた際、ゲームを再スタートするたびに単語の出現速度が上がっていく不具合が発生しました。

原因は `setInterval` の多重起動です。この記事では、症状から原因の特定、そしてタイマーを「状態」として管理する修正方法までをまとめます。

## やりたかったこと

一定時間ごとに単語を生成し、画面に表示する処理を実装しました。

```ts
setInterval(() => {
  addWord();
}, 1000);
```

## 発生した問題

ゲームを再スタートすると、単語の出現速度がどんどん速くなりました。

```text
1回目：正常
2回目：2倍速
3回目：3倍速
```

再スタートの回数に比例して速くなることから、処理そのものではなく、タイマーが重複して動いていると判断できます。

## 原因

`setInterval` が呼ばれるたびに、新しいタイマーが増えていました。

```ts
// NGパターン
const startGame = () => {
  setInterval(() => {
    addWord();
  }, 1000);
};
```

`startGame` を呼ぶたびに新しいタイマーが生成されますが、以前のタイマーは止まりません。`setInterval` は明示的に `clearInterval` するまで動き続けるためです。

## 解決方法

タイマーIDを保持し、開始前に必ず停止する形へ変更しました。

### タイマーIDを状態として持つ

```ts
const timerId = ref<number | null>(null);
```

### setInterval の戻り値を保存する

```ts
timerId.value = setInterval(() => {
  addWord();
}, 1000);
```

戻り値を保存しておかないと、あとから停止する手段がなくなります。

### clearInterval で停止する

```ts
const stopGame = () => {
  if (timerId.value !== null) {
    clearInterval(timerId.value);
    timerId.value = null;
  }
};
```

停止後に `null` を代入することで、「今タイマーが動いているか」を状態として判断できます。

### ゲーム開始前に必ずリセットする

```ts
const startGame = () => {
  stopGame(); // 既存タイマーを停止してから開始する

  timerId.value = setInterval(() => {
    addWord();
  }, 1000);
};
```

開始処理の先頭で停止を呼ぶことで、何回 `startGame` を呼んでも動くタイマーは常に1つになります。

### コンポーネント破棄時にも停止する

画面を離れたときにタイマーが残ると、存在しない画面に対して処理が動き続けます。そのため `onUnmounted` でも停止を呼びます。

```ts
onUnmounted(() => {
  stopGame();
});
```

これにより、ゲームの再スタートと画面遷移の両方でタイマーが残らなくなります。

## 同じ形で起きる問題

今回の不具合は、タイマーに限った話ではありません。

- 二重の API 呼び出し
- 多重のイベントリスナー登録
- 破棄されない購読によるメモリリーク

いずれも「開始したリソースを解放していない」という同じ構造です。

## まとめ

`setInterval` は自動では止まりません。再実行するなら `clearInterval` が必要で、そのためにはタイマーIDを状態として保持しておく必要があります。

Vue で扱う場合は、開始と停止を必ずセットで設計し、さらに `onUnmounted` で解放するところまでを1組として考えるのが安全でした。

このタイマー処理を画面から切り出したcomposable設計は[Vue 3 / TypeScriptで画面・API通信・状態管理・Utilityの責務を分離する](vue-typescript-responsibility-separation)にまとめています。
