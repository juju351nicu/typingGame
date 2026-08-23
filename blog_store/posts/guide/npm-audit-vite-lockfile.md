---
id: npm-audit-vite-lockfile
title: npm auditで見つかったVite脆弱性を更新対応した記録
date: 2026-08-08
section: guide
description: npm auditで検出されたVite関連の脆弱性に対して、Vite更新、テスト、GitHub Actionsのnpm ci失敗、lockfile同期まで対応した流れをまとめました。
tags: npm, Vite, GitHub Actions
---

# npm auditで見つかったVite脆弱性を更新対応した記録

フロントエンドの依存関係を確認するために `npm audit` を実行したところ、Vite関連の脆弱性が検出されました。

最終的にはViteと `@vitejs/plugin-vue` を更新し、`npm audit` が `found 0 vulnerabilities` になるところまで確認しました。

その過程で、ローカルではビルドできるのにGitHub Actionsの `npm ci` が失敗する問題にも遭遇しました。

## 発生したこと

`npm audit` で、Viteが依存している開発サーバー周りの脆弱性が表示されました。

指示としては `npm audit fix --force` が表示されましたが、これは破壊的な更新になる可能性があるため、そのまま実行せず、Vite更新タスクとして分けて対応しました。

## 対応方針

今回は次の方針にしました。

- 既存の公開作業とは別タスクとして扱う
- Viteと `@vitejs/plugin-vue` を更新する
- 既存テストをすべて通す
- GitHub Pages用のAPI無効ビルドも確認する
- `npm audit` が0件になることを確認する
- GitHub Actionsの `npm ci` でも通ることを確認する

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

最終的に次の状態まで確認しました。

- `npm audit` が0件
- `npm run test` が成功
- GitHub Pages用ビルドが成功
- GitHub ActionsのDeploy workflowが成功
- 公開URLが `200 OK` で返る

## 学んだこと

`npm audit fix --force` は便利ですが、メジャーバージョン更新が入る場合は慎重に扱う必要があります。

また、ローカルで `npm install` や `npm audit` が通っていても、CIでは `npm ci` がlockfileを厳密に見るため、CI環境に近いnpmバージョンで再現確認することが重要だと分かりました。

依存関係の更新は地味ですが、公開済みアプリを安全に保つためには大事な作業だと感じました。
