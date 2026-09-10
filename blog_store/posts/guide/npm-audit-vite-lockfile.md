---
id: npm-audit-vite-lockfile
title: npm auditで検出したVite脆弱性とnpm ciのlockfileエラーを解消する
date: 2026-08-08
section: guide
description: npm auditで検出されたVite関連の脆弱性を、npm audit fix --forceを使わずに解消し、その過程で発生したGitHub Actionsのnpm ci失敗をlockfile同期で解決するまでをまとめました。
tags: npm, Vite, GitHub Actions
---

# npm auditで検出したVite脆弱性とnpm ciのlockfileエラーを解消する

フロントエンドの依存関係を確認するために `npm audit` を実行したところ、Vite関連の脆弱性が検出されました。

最終的にはViteと `@vitejs/plugin-vue` を更新し、`npm audit` が `found 0 vulnerabilities` になるところまで確認しました。

その過程で、ローカルではビルドできるのにGitHub Actionsの `npm ci` が失敗する問題にも遭遇しました。

## 発生したこと

`npm audit` で、Viteが依存している開発サーバー周りの脆弱性が表示されました。

指示としては `npm audit fix --force` が表示されましたが、これは破壊的な更新になる可能性があるため、そのまま実行せず、Vite更新タスクとして分けて対応しました。

## 対応方針

`--force` を避けたのは、当時GitHub Pagesの公開作業と並行していたからです。脆弱性対応とメジャーバージョン更新が同じ変更に混ざると、公開後に何か壊れたときにどちらが原因か分からなくなります。

そこで公開作業とは別タスクとして切り出し、Viteと `@vitejs/plugin-vue` を明示的に更新して、既存テスト、GitHub Pages用のAPI無効ビルド、`npm audit` の0件、GitHub Actionsの `npm ci` を順に確認する形にしました。

## 更新した依存関係

主に次を更新しました。

```json
{
  "vite": "^8.1.5",
  "@vitejs/plugin-vue": "^6.0.8"
}
```

Viteのメジャーバージョンが上がるため、単に依存を更新するだけでなく、テストとビルドの確認を必ず行いました。

## ローカルで確認したコマンド

更新後、次の確認を行いました。

```bash
npm run check:posts
npm run test
VITE_ENABLE_BACKEND_API=false npm run build
npm audit
```

テストは50ファイル、262テストが通りました。

また、GitHub Pages向けのビルドでは、生成されたJavaScriptにAPI無効設定が入っていることも確認しました。

```text
BACKEND_API:{ENABLED:!1
```

## GitHub Actionsで起きたlockfile問題

ローカルでは問題なく見えていましたが、GitHub Actionsでは `Install dependencies` の `npm ci` で失敗しました。

原因は、ローカルのnpmバージョンとGitHub Actions側のnpmバージョン差により、`package-lock.json` のoptional dependency / peer dependencyまわりに不足が出ていたことでした。

具体的には、Actions相当のnpm 10で次のような不足が再現できました。

```text
Missing: @emnapi/core from lock file
Missing: @emnapi/runtime from lock file
```

## 解決方法

Actionsに近いnpmバージョンでlockfileを同期しました。

```bash
npx npm@10.9.4 install --package-lock-only
npx npm@10.9.4 ci --dry-run
```

これにより、GitHub Actionsの `npm ci` でも依存関係を正しく解決できるようになりました。

## 最終確認

`npm audit` の0件、`npm run test` とGitHub Pages用ビルドの成功、Deploy workflowの成功、そして公開URLが `200 OK` を返すところまで確認しました。

## 振り返り

`npm install` と `npm ci` は同じものを入れるコマンドだと思っていたのですが、この件でそうではないと分かりました。`npm install` はlockfileに足りない依存があれば埋めて進みますが、`npm ci` はlockfileを正解として扱うので、埋めるはずだったものが無いまま止まります。ローカルで通ったことは、CIで通る根拠になりません。

そして、npmのバージョン差でlockfileの内容が変わる以上、再現確認もCI相当のバージョンで行う必要があります。`npx npm@10.9.4` で確認したのはそのためで、ローカルのnpmで何度試しても同じ失敗は出ませんでした。

なお `--force` を使わないと決めた判断の経緯は[AIに調査・整理・実装補助を任せ、技術判断は自分で行う個人開発の進め方](ai-assisted-personal-development)にもまとめています。
