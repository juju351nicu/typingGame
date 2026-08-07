---
id: vue-localstorage-ranking
title: VueでlocalStorageランキング機能を作った記録
date: 2026-06-08
section: guide
description: Vue3 + Piniaでタイピングゲームのプレイ結果をlocalStorageに保存し、ランキング表、サマリー、スコア推移を表示できるようにした実装をまとめました。
---

# VueでlocalStorageランキング機能を作った記録

typingGameでは、プレイ結果をブラウザのlocalStorageへ保存し、ランキング画面で見られるようにしています。

バックエンドAPIが未公開の状態でも、フロントエンドだけでゲーム体験が完結するようにしたかったためです。

## 保存する情報

ゲーム終了時には、スコアだけでなく、振り返りに必要な情報も保存します。

- スコア
- 難易度
- ゲームルール
- プレイ時間
- WPM
- 正タイプ数
- 正確率
- ミス数
- プレイ日時
- タイムアタック制限時間

単純なスコア一覧ではなく、あとからランキング、サマリー、推移グラフへ展開できる形にしました。

## Pinia persisted state

保存はPinia storeに寄せています。

`gameScores` storeでスコア一覧を持ち、persist設定でlocalStorageへ保存します。

```ts
export const useGameScoresStore = defineStore("gameScores", {
  state: () => ({
    scores: [],
    isLoading: false,
  }),
  persist: {
    storage: localStorage,
  },
});
```

画面側がlocalStorageを直接触るのではなく、storeを通して保存・削除することで、後からAPI保存を追加しやすくしました。

## ランキング表示

ランキング画面では、保存済みスコアを次の観点で扱えるようにしました。

- 難易度で絞り込む
- 通常モード / タイムアタックで絞り込む
- タイムアタックの制限時間で絞り込む
- スコア順に並べる
- 同点の場合はプレイ時間や日時も見る
- サマリー、分析、ランキング表をタブで切り替える

ランキング用の整形処理は `gameUtils.ts` に寄せ、画面側は表示に集中できるようにしました。

## API対応を見越した設計

後からSpring Boot APIと連携するため、localStorage保存はすぐに消さない方針にしました。

現在の考え方は次の通りです。

- 未ログインユーザーはlocalStorageへ保存
- ログイン済みユーザーもまずlocalStorageへ保存
- その後、可能ならAPIへ保存
- API保存に失敗してもlocalStorageの結果は残す
- API取得に失敗してもlocalStorage由来のランキングは維持する

これにより、バックエンドが落ちていても、ユーザーのプレイ結果がすぐ消えない構成にできます。

## 公開URLで確認したこと

GitHub Pages公開後には、実際に1回ゲームをプレイして確認しました。

- Result画面が表示される
- `gameScores` がlocalStorageに保存される
- ランキング表に保存済みスコアが表示される
- サマリーに最高スコアやプレイ回数が表示される
- 分析タブに直近スコア推移が表示される

## 学んだこと

localStorageは小さな個人開発では便利ですが、画面から直接扱いすぎると後から変更しにくくなります。

store、service、utilityに責務を分けておくことで、フロントエンド単体公開とバックエンドAPI連携の両方に対応しやすくなりました。
