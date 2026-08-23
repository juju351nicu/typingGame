---
id: github-actions-pages-deploy
title: GitHub ActionsでVueアプリをGitHub Pagesに公開した記録
date: 2026-07-18
section: guide
description: Vue3 + Viteで作成したタイピングゲームを、GitHub ActionsからGitHub Pagesへ公開したときの構成、API無効モード、SPA fallback、確認手順をまとめました。
tags: Vue 3, GitHub Actions, GitHub Pages
---

# GitHub ActionsでVueアプリをGitHub Pagesに公開した記録

Vue3 + Viteで作成しているタイピングゲームを、GitHub Actionsを使ってGitHub Pagesへ公開しました。

単に `npm run build` して終わりではなく、公開環境ではバックエンドAPIを無効にすること、SPAの直接アクセスに対応すること、Markdownブログのインデックスを生成してからデプロイすることを意識しました。

## 背景

このアプリは、フロントエンドだけでも遊べるタイピングゲームとして作っています。

一方で、将来的にはSpring Bootのバックエンドと連携し、ログイン、スコア保存、ランキングAPIなども使える構成にする予定です。

そのため公開時には、次の条件を満たす必要がありました。

- GitHub Pagesでは静的ファイルとして動かす
- バックエンドAPIが未公開でもゲームを遊べる
- スコアはlocalStorageに保存する
- ブログ記事一覧はMarkdownから自動生成する
- ルーティングの直接アクセスで404にならないようにする

## GitHub Pages用のビルド設定

GitHub Pagesではリポジトリ名がURLの一部になります。

このプロジェクトでは公開URLが `/typingGame/` 配下になるため、Vite側のbase設定と、ブログ記事の静的パスがずれないようにしています。

公開URLは次の形です。

```text
https://juju351nicu.github.io/typingGame/
```

## API無効モード

フロントエンドには、バックエンドAPIを使うモードと使わないモードがあります。

GitHub Pages公開時点ではバックエンドをまだ外部公開していないため、Actionsのビルドでは明示的にAPIを無効にしました。

```yaml
- name: Build
  env:
    VITE_ENABLE_BACKEND_API: "false"
  run: npm run build
```

これにより、公開URLではログイン導線を出さず、スコアはlocalStorageに保存する動きになります。

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

## 確認したこと

公開後は、次の点を確認しました。

- 公開URLが `200 OK` で返る
- API無効モードでログイン導線が表示されない
- 1回ゲームをプレイできる
- 結果がlocalStorageに保存される
- ランキング画面に保存済みスコアが表示される
- サマリー、分析、ランキング表の各タブが動く
- `404.html` が生成されている

## 学んだこと

GitHub Pagesへの公開は、静的サイトとしてはシンプルです。

ただし、SPA、環境変数、ローカル保存、ブログ記事生成、将来のバックエンド連携を同時に考えると、公開用ビルドの状態を明確に分けることが大事だと感じました。

今回の構成にしたことで、バックエンドが未公開でもフロントエンドだけ先に公開でき、今後EC2などでAPIを公開したあとにAPI有効モードへ進める準備ができました。
