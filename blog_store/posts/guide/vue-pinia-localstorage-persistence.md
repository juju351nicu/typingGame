---
id: vue-pinia-localstorage-persistence
title: Vue + Piniaでゲーム結果をlocalStorageへ永続化し、API障害時も結果を残す
date: 2026-06-08
section: guide
description: Vue 3 + Piniaでタイピングゲームのプレイ結果をlocalStorageへ永続化し、バックエンドAPIが停止していてもスコアが消えないフォールバック設計にした実装をまとめました。
tags: Vue 3, Pinia, localStorage
---

# Vue + Piniaでゲーム結果をlocalStorageへ永続化し、API障害時も結果を残す

Vue 3 + Piniaで作っているタイピングゲームでは、プレイ結果をブラウザのlocalStorageへ保存し、ランキング画面で表示しています。

目的は2つあります。バックエンドAPIが未公開の段階でもゲーム体験を完結させること、そしてAPIを公開したあとも、バックエンドが停止したときにユーザーのプレイ結果が消えないようにすることです。

この記事では、保存先をどこに置き、APIとどう併存させたのかをまとめます。

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

## 保存はPinia storeへ寄せる

画面からlocalStorageを直接触らず、保存はPinia storeに寄せています。

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

ただし、境界は明示しておきます。現時点ではAPI保存に失敗したスコアの自動再送までは実装していません。localStorageは同期キューではなく、プレイ結果を失わないためのフォールバックとして使っています。API復旧後にサーバー側へ反映されるのは、それ以降のプレイ結果です。

## 公開URLで確認したこと

GitHub Pages公開後には、実際に1回ゲームをプレイして確認しました。

- Result画面が表示される
- `gameScores` がlocalStorageに保存される
- ランキング表に保存済みスコアが表示される
- サマリーに最高スコアやプレイ回数が表示される
- 分析タブに直近スコア推移が表示される

## まとめ

localStorageは個人開発では手軽ですが、画面から直接扱うと後から変更しにくくなります。

今回の設計で効いたのは、**保存先をstoreの内部実装として隠したこと**です。画面はstoreへスコアを渡すだけなので、保存先がlocalStorageだけの状態からAPI併用へ移行しても、画面側のコードは変わっていません。

そして、ログイン済みでもまずlocalStorageへ書いてからAPIへ送る順番にしたことで、バックエンドが停止していてもプレイ結果が失われない構成になりました。API連携そのものより、この順番の判断の方が効果が大きかったと感じています。

ログイン状態とトークンの扱いは[Spring Security Resource ServerでJWT Bearer認証を実装する](spring-security-jwt-resource-server)、APIを実際に公開した構成は[GitHub PagesのVueからAWS EC2上のSpring Boot APIへHTTPS接続するまで](ec2-spring-boot-https-frontend-connection)にまとめています。
