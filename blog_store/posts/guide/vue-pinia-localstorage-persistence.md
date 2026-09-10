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

画面はstoreへスコアを渡すだけで、`localStorage` というキーワードはstoreの外に出てきません。

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

ここで迷ったのは保存の順番です。ログイン済みならAPIを本体の保存先と見なし、localStorageは未ログイン専用にする方が構成としては素直です。ただそれだと、API保存が失敗した時点でそのプレイの記録がどこにも残りません。

そこでログイン状態に関係なく、まずlocalStorageへ書いてからAPIへ送る順番にしました。API保存に失敗してもローカルの結果は消さず、API取得に失敗してもlocalStorage由来のランキング表示は維持します。

ただし、境界は明示しておきます。現時点ではAPI保存に失敗したスコアの自動再送までは実装していません。localStorageは同期キューではなく、プレイ結果を失わないためのフォールバックとして使っています。API復旧後にサーバー側へ反映されるのは、それ以降のプレイ結果です。

## 公開URLで確認したこと

GitHub Pages公開後、実際に1回プレイして、Result画面から `gameScores` がlocalStorageへ入り、ランキング表、サマリーの最高スコアとプレイ回数、分析タブの推移まで反映されることを確認しました。

## 振り返り

保存先をstoreの内部実装として隠したことは、実際にAPI連携を足す段階で効きました。localStorageだけの状態からAPI併用へ移っても、画面側のコードは1行も変わっていません。

ただ、より効いたのは書き込みの順番でした。API連携の実装そのものは公式ドキュメントを追えば書けますが、「先にどちらへ書くか」は仕様として決めておかないと、あとから直すときにはもうユーザーの記録が失われた状態で気づくことになります。

ログイン状態とトークンの扱いは[Spring Security Resource ServerでJWT Bearer認証を実装する](spring-security-jwt-resource-server)、APIを実際に公開した構成は[GitHub PagesのVueからAWS EC2上のSpring Boot APIへHTTPS接続するまで](ec2-spring-boot-https-frontend-connection)にまとめています。
