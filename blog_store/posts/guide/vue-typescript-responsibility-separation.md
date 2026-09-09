---
id: vue-typescript-responsibility-separation
title: Vue 3 / TypeScriptで画面・API通信・状態管理・Utilityの責務を分離する
date: 2026-05-25
section: guide
description: Vue 3 + TypeScriptのタイピングゲームで、定数、API通信、汎用ロジック、画面状態、アプリ全体の状態をそれぞれどこへ置くか決めた責務分離の方針と、その判断理由をまとめました。
tags: TypeScript, 設計, リファクタリング
---

# Vue 3 / TypeScriptで画面・API通信・状態管理・Utilityの責務を分離する

Vue 3 + TypeScriptで開発しているタイピングゲームでは、コードを書き始める前に「どの処理をどこへ置くか」を先に決めました。

画面コンポーネントは、放っておくと肥大化します。`fetch` の呼び出し、定数、スコア計算、タイマー管理、表示整形が1つのファイルに集まると、変更するときに影響範囲が読めなくなります。

この記事では、typingGameで採用した責務分離の方針と、それぞれをなぜその場所へ置いたのかをまとめます。

## 決めた責務分担

置き場所は次のように決めました。

```text
src/constants/const.ts    アプリ全体で使う定数
src/utils/fetchClient.ts  API通信の共通処理
src/utils/gameUtils.ts    画面に依存しない計算・整形
src/composables/          画面ごとの状態とロジック
Pinia store               アプリ全体で共有する状態
コンポーネント             表示とユーザー操作
```

この方針は、以前開発していたGhost-PDFでの反省をもとにしています。

Ghost-PDFでは、画面処理、定数、API通信、補助関数が同じ場所に少しずつ増えていき、最終的に「どこを直せばよいか分からない」状態になりました。typingGameでは、同じことを繰り返さないよう最初から分けることにしました。

## 過去のコードはコピーせず、設計判断だけを持ち込む

Ghost-PDFには `const.js`、`rest.js`、`util.js` がありました。typingGameでも似た役割は必要でしたが、JavaScriptのコードをそのまま持ち込むことはしていません。

プロジェクトが違えば、フレームワークも型も責務も変わるためです。そこで処理の考え方だけを取り出し、次のように置き換えました。

- `const.js` 相当は `src/constants/const.ts`
- `rest.js` 相当は `src/utils/fetchClient.ts`
- `util.js` 相当は `src/utils/gameUtils.ts`
- 画面ごとの状態管理は `src/composables`
- アプリ全体の状態はPinia store

過去プロジェクトのコードは、そのまま再利用するより、設計判断を再利用する方が役に立ちます。

## API通信をfetchClientへ寄せる

画面ごとに `fetch` の書き方が散らばると、あとから認証ヘッダーやエラー処理を入れるときに、すべての呼び出し箇所を探して回ることになります。

typingGameでは、通信処理を `fetchClient.ts` へ寄せ、JWT Bearer tokenを付ける処理もそこから扱えるようにしました。

この分け方の効果は、あとからJWT認証を追加したときにはっきり出ました。画面側は `Authorization` ヘッダーの組み立てを一切意識せず、共通処理の変更だけで全APIへ認証を通せます。

## 計算・整形をgameUtilsへ寄せる

ランキング整形、スコア計算、表示用ラベル変換のような処理を画面へ直接書くと、テストするためにコンポーネントごとマウントする必要が出てきます。

そのため、画面に依存しない処理は `gameUtils.ts` へ寄せました。

ランキング表示では、次の処理を画面から切り出しています。

- 難易度ラベルの変換
- ランク色の決定
- スコア順の並び替え
- タイムアタック制限時間の表示
- 直近プレイの推移データ作成

画面は表示に集中し、ロジックは純粋な関数としてテストできる形になります。

## 画面ごとのロジックをcomposableへ分ける

Vueでは、画面コンポーネントが大きくなりやすいです。

typingGameでも、ゲーム開始、タイマー、単語生成、入力判定、スコア更新、キーボード表示を1つの画面へ集めると読みづらくなります。

そこで、処理単位ごとにcomposableへ分けました。1つのcomposableが1つの関心事だけを持つようにすると、タイマーの不具合を追うときに見る場所が1ファイルで済みます。

## まとめ

typingGameでは、定数、API通信、汎用ロジック、画面状態、アプリ全体の状態を、それぞれ別の場所へ置く方針で開発を始めました。

分けたこと自体より、分けたおかげで後からの変更が局所で済んだことに効果がありました。特に `fetchClient.ts` へ通信を寄せていたため、JWT認証の追加が共通処理の変更だけで完了しています。そのJWT認証側の実装は[Spring Security Resource ServerでJWT Bearer認証を実装する](spring-security-jwt-resource-server)にまとめています。

過去のGhost-PDFを整理する場合も、`constants`、`fetchClient`、`gameUtils`、`composables` というこの分け方を持ち込む予定です。
