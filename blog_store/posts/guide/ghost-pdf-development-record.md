---
id: ghost-pdf-development-record
title: Ghost-PDF開発で学んだ責務分離をtypingGameへ活かした記録
date: 2026-05-25
section: guide
description: Ghost-PDF開発で使っていたconst、rest、utilの考え方を、typingGameのTypeScript構成へ移すときに意識した責務分離と再利用の考え方をまとめました。
tags: TypeScript, 設計, リファクタリング
---

# Ghost-PDF開発で学んだ責務分離をtypingGameへ活かした記録

過去に作っていたGhost-PDFでは、画面処理、定数、API通信、補助関数が少しずつ増えていきました。

その経験を踏まえて、typingGameでは最初から責務を分けることを意識しました。

## そのままコピーしない

Ghost-PDFのコードをtypingGameへ移すときに意識したのは、JavaScriptをそのままコピーしないことです。

プロジェクトが違えば、フレームワークも型も責務も変わります。

そのため、処理の考え方だけを取り出し、typingGameでは次のように置き換えました。

- `const.js` 相当は `src/constants/const.ts`
- `rest.js` 相当は `src/utils/fetchClient.ts`
- `util.js` 相当は `src/utils/gameUtils.ts`
- 画面ごとの状態管理は `src/composables`
- アプリ全体の状態はPinia store

過去のコードを資産として使いつつ、今の構成に合わせて作り直すことを優先しました。

## fetchClientに寄せたこと

API通信では、画面ごとに `fetch` の書き方が散らばると、あとから認証ヘッダーやエラー処理を入れにくくなります。

typingGameでは、`fetchClient.ts` に通信処理を寄せ、JWT Bearer tokenを付ける処理もそこから扱えるようにしました。

これにより、ログイン後のAPI呼び出しでも、画面側が `Authorization` ヘッダーの細かい組み立てを意識しなくて済みます。

## gameUtilsに寄せたこと

ランキング整形、スコア計算、表示用ラベル変換のような処理は、画面に直接書くとテストしにくくなります。

そのため、typingGameでは `gameUtils.ts` に寄せました。

例えば、ランキング表示では次のような処理を画面から切り出しています。

- 難易度ラベルの変換
- ランク色の決定
- スコア順の並び替え
- タイムアタック制限時間の表示
- 直近プレイの推移データ作成

画面は表示に集中し、ロジックは関数としてテストできる形にしました。

## composableに分けたこと

Vueでは、画面コンポーネントが大きくなりやすいです。

typingGameでも、ゲーム開始、タイマー、単語生成、入力判定、スコア更新、キーボード表示などを1つの画面に集めると読みづらくなります。

そこで、処理単位ごとにcomposableへ分けました。

この分け方は、Ghost-PDFへ戻るときにも活かせると考えています。

## 学んだこと

過去プロジェクトのコードは、そのまま再利用するより、設計判断を再利用する方が役に立つことがあります。

Ghost-PDFで感じた「処理が増えると見通しが悪くなる」という反省を、typingGameでは責務分離として活かしました。

今後Ghost-PDFを整理する場合も、typingGameで試した `constants`、`fetchClient`、`gameUtils`、`composables` の分け方を参考にして、少しずつ戻していきたいです。
