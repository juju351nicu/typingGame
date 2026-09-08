---
id: github-actions-pages-deploy
title: Vue + ViteをGitHub ActionsからGitHub Pagesへ自動デプロイする
date: 2026-07-18
section: guide
description: Vue 3 + ViteのタイピングゲームをGitHub ActionsからGitHub Pagesへ自動デプロイする構成として、API接続の切り替え、SPA fallback、ブログ記事インデックスの自動生成をどう組み込んだのかをまとめました。
tags: Vue 3, GitHub Actions, GitHub Pages
---

# Vue + ViteをGitHub ActionsからGitHub Pagesへ自動デプロイする

Vue 3 + Viteで作っているタイピングゲームを、GitHub ActionsからGitHub Pagesへ自動デプロイしています。

`npm run build` した成果物を置くだけなら簡単ですが、実際には次の3つを解決する必要がありました。

- バックエンドAPIの有無で、フロントエンドの動作を切り替えたい
- Vue RouterのURLへ直接アクセスすると、GitHub Pagesが404を返す
- Markdownブログの記事一覧JSONを、更新し忘れずにデプロイしたい

この記事では、この3点をデプロイworkflowへどう組み込んだのかをまとめます。

## 現在の構成

本番の構成は次のとおりです。

```text
GitHub Pages（Vue 3 / Vite）
        │
        │ HTTPS
        ▼
Spring Boot API（EC2）
        │
        ▼
      MySQL

API失敗時 / 未ログイン時
        ↓
  localStorage fallback
```

ただし、この構成へは一度に到達していません。GitHub Pagesへ公開した時点ではバックエンドが未公開だったため、まずAPIを使わない構成から始めています。

```text
当初の構成

GitHub Pages（Vue 3 / Vite）
        │
        ▼
  localStorage のみ
```

どちらの構成でも同じビルドで動くよう、API接続の有無はビルド時の環境変数で切り替える形にしました。

## GitHub Pages用のビルド設定

GitHub Pagesではリポジトリ名がURLの一部になります。

このプロジェクトでは公開URLが `/typingGame/` 配下になるため、Vite側のbase設定と、ブログ記事の静的パスがずれないようにしています。

公開URLは次の形です。

```text
https://juju351nicu.github.io/typingGame/
```

## API接続をビルド時に切り替える

フロントエンドには、バックエンドAPIを使うモードと使わないモードがあります。切り替えはコードではなく、ビルド時の環境変数で行います。

公開当初、バックエンドは外部未公開だったため、明示的にAPIを無効にしました。

```yaml
- name: Build
  env:
    VITE_ENABLE_BACKEND_API: "false"
  run: npm run build
```

この状態では、公開URLにログイン導線は出ず、スコアはlocalStorageへ保存されます。

バックエンドをEC2へ公開したあとは、同じ箇所を有効側へ切り替えました。

```yaml
- name: Build
  env:
    VITE_ENABLE_BACKEND_API: "true"
    VITE_API_BASE_URL: "https://api.clipdev.jp"
  run: npm run build
```

この切り替えだけで済むようにしておいたことが、あとから効きました。バックエンド公開時にフロントエンドのコードへ手を入れる必要がなく、変更はworkflowの環境変数だけです。

なお、API有効化後も未ログイン時とAPI失敗時のlocalStorage fallbackは残しています。バックエンドが停止していてもゲーム自体は遊べる状態を維持するためです。

## SPA fallback

Vue Routerを使っているため、ブラウザで直接 `/scoresBoard` のような画面を開くと、GitHub Pages側がそのファイルを探して404になる可能性があります。

そこで、ビルド後に `dist/index.html` を `dist/404.html` としてコピーしています。

```yaml
- name: Add SPA fallback
  run: cp dist/index.html dist/404.html
```

GitHub Pagesでは存在しないパスにアクセスされたとき `404.html` が返るため、Vue Router側で画面を復元できます。

## ブログ記事インデックスの生成

このアプリにはMarkdownで書ける技術ブログ機能があります。

記事一覧の `posts-index.json` は手動編集せず、各Markdownファイルのfrontmatterから生成しています。

Actionsでもデプロイ前に次を実行します。

```yaml
- name: Generate blog post index
  run: npm run generate:posts

- name: Check blog post index
  run: npm run check:posts
```

これにより、記事を追加したのに一覧JSONを更新し忘れる、というミスを防げます。

## 動作確認

公開後、次の点を確認しました。

- 公開URLが `200 OK` で返る
- API無効モードでログイン導線が表示されない
- 1回ゲームをプレイできる
- 結果がlocalStorageに保存される
- ランキング画面に保存済みスコアが表示される
- サマリー、分析、ランキング表の各タブが動く
- `404.html` が生成されている

## まとめ

GitHub Pagesへの公開そのものは、静的サイトとしてはシンプルです。難しいのは、SPA、環境変数、ローカル保存、ブログ記事生成、バックエンド連携が同時に絡んだときに、公開用ビルドがどの状態なのかを曖昧にしないことでした。

今回もっとも効果があったのは、**API接続の有無をコードではなくビルド時の環境変数へ出したこと**です。この設計により、バックエンドが未公開の段階でフロントエンドだけ先に公開でき、後日EC2へAPIを公開したときも、変更したのはworkflowの環境変数2行だけで済みました。

EC2上のSpring Boot APIについては、別記事「GitHub PagesのVueからAWS EC2上のSpring Boot APIへHTTPS接続するまで」で扱っています。
