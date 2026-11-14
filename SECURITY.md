# 依存関係のセキュリティ方針

## 自動監査

GitHub Pagesへ配信する依存関係は、CIとdeployの両方で次のコマンドを実行し、moderate以上の警告があれば処理を停止します。

```bash
npm run audit:production
```

ローカルでは開発用ツールも含めて確認します。

```bash
npm audit
```

## 2026-11-14の監査結果

- 公開物に含まれる依存関係: 0件
- 開発用依存関係を含む全体: moderate 13件
- high / critical: 0件

全体の警告は、Stryker、typescript-eslint、Vue Test Utilsが内部で利用する`minimatch`、`glob`に由来します。公開済みの安全な版へ更新できる直接依存は更新しましたが、これらは上流パッケージが旧majorを指定しているため残っています。

`overrides`で互換範囲外のmajorへ強制置換すると、lint、component test、mutation test自体の信頼性を損なう可能性があります。そのため本番依存の監査を必須にし、開発依存は上流の対応版が公開された時点で通常の更新として取り込みます。

`npm audit fix --force`は、監査表示だけを0件にする目的では実行しません。更新時はlockfileの差分を確認し、format、lint、typecheck、unit test、build、Playwright E2E、mutation testを通します。
