# Frontend Cleanup Plan Before Backend Work

## 目的

お盆休みにバックエンド側のタスクへ入りやすくするため、事前にフロントエンド側で潰せる課題を整理します。

特に、Spring Boot API、JWTログイン、ユーザー別スコア管理へ進む前に、フロントエンドの状態管理、service層、エラー処理、表示状態を整えておくことを目的にします。

## 優先方針

- バックエンドAPIへ差し替えやすい構成を優先する。
- 既存画面の挙動は変えず、責務分離と安全性を上げる。
- 大きなUI変更より、store / service / fetch / error / loading の整理を優先する。
- 1コミットで追いやすい粒度に分ける。

## P0: バックエンド前の地ならし

### 1. スコア保存処理をservice層へ分離

目的:

- 現在の localStorage / Pinia 永続化から、将来のスコア保存APIへ差し替えやすくする。
- store は状態管理に寄せ、保存処理の責務を service へ逃がす。

対応状況:

- 完了。

関連ファイル:

```text
src/stores/gameScores.ts
src/services/scoreService.ts
test/ut/services/scoreService.spec.ts
```

コミット例:

```text
refactor: スコア保存処理をservice層へ分離
```

### 2. fetchClient のエラーハンドリング改善

目的:

- HTTPエラー、通信失敗、JSON parse失敗などの扱いを整理する。
- バックエンドAPI接続時に、service側で失敗理由を扱いやすくする。

対応状況:

- 完了。
- HTTPエラーの共通例外化と JSON helper 追加まで対応済み。

関連ファイル:

```text
src/utils/fetchClient.ts
test/ut/utils/fetchClient.spec.ts
```

コミット例:

```text
refactor: fetchClientのHTTPエラー処理を整理
```

### 3. API接続を見越した型整理

目的:

- `GameScore` などの型を、画面表示用、保存用、API入出力用に分ける必要があるか検討する。
- すぐに分割しすぎず、バックエンドAPIのDTO設計が見えた段階で無理なく移行できる状態にする。

候補:

```text
GameScore
GameScoreBase
SaveGameScoreRequest
GameScoreResponse
RankingScore
PerformanceTrendItem
```

対応状況:

- 初期整理は完了。
- 既存画面で使う `GameScore` は維持し、保存API向けの `SaveGameScoreRequest` と取得API向けの `GameScoreResponse` を追加済み。
- `scoreService` に API 境界で使う変換関数を追加済み。

検討ポイント:

- APIから返すスコアと、画面用に rank / resultRank を付与したスコアを引き続き分けて扱う。
- `gameRule` や `timeLimitSeconds` の optional 扱いを、既存localStorage互換とAPI新規保存でどう扱うかバックエンド実装時に最終決定する。

### 4. loading / error / empty 表示の共通化

目的:

- API接続後に増える loading / error / empty 状態を画面ごとに散らさない。
- ブログ、ランキング、将来のユーザー別スコア画面で再利用できる表示にする。

候補:

```text
src/components/AppStateMessage.vue
```

対応状況:

- 一部完了。
- ブログ一覧、ブログ詳細、ランキング分析の error / empty 表示に `AppStateMessage.vue` を適用済み。
- loading は既存の `Loading.vue` を継続利用する。

検討ポイント:

- API画面が増えた段階で、`Loading.vue` と `AppStateMessage.vue` の統合や配置ルールを再検討する。
- ランキング表の no-data 表示を Vuetify 標準のままにするか、共通表示へ寄せるか検討する。

## P1: 今のFE品質を上げる

### 5. `receive` 系メソッド名の維持

目的:

- store action のスペルミスを解消した状態を維持する。
- バックエンドAPI接続時の命名を読みやすくする。

対応状況:

```text
receivePostIndex
receiveBlogPost
```

- 完了。
- 呼び出し元も `receive...` へ修正済み。

コミット例:

```text
refactor: ブログ記事取得メソッド名をreceiveへ修正
```

### 6. ランキング分析の仕上げ

目的:

- スコア / WPM / 正確率推移の表示を、バックエンド化前に安定させる。
- APIから履歴を取得する形になっても、表示ロジックを大きく変えずに済むようにする。

候補:

- 表示件数を 5件固定のままにするか、切り替え可能にするか検討する。
- 上部フィルターと分析タブの関係が分かりやすいか確認する。
- 折れ線、複数指標の同時表示、期間指定へ進む段階で Chart.js の導入を検討する。

### 7. service / utils のテスト追加

目的:

- API化前に、service層と純粋関数のテストを増やす。
- store や画面に寄りすぎたテストを避け、差し替えやすい単位を守る。

対応済み:

```text
scoreService
blogPostService
markdownUtils
fetchClient
```

追加候補:

- APIレスポンス変換用 mapper を追加した場合のテスト

### 8. README / docs のPhase整理

目的:

- Phase5 完了範囲、FE整理、Phase6 バックエンド着手範囲を分けておく。
- 次回作業時に「何を先にやるか」で迷わないようにする。

候補:

- Phase5: タイムアタック、ランキング分析、FE整理
- Phase6: Spring Boot API、JWTログイン、ユーザー別スコア管理
- Phase7: Docker / PWA / 公開構成見直し

対応状況:

- Phase5 / Phase6 の入口整理は一部完了。
- アラート通知は通知ごとの表示状態と自動非表示タイマーを持つ形に修正済み。
- リトライ処理はページリロードではなく、ゲーム状態・タイマー・TypingPanel のリセットで完結する形に修正済み。

## P2: 余力があれば

### 9. chunk size warning 対策

目的:

- build 時の chunk size warning を軽減する。
- 公開ページの初期ロードを改善する。

候補:

- ルート単位の dynamic import
- Markdown / ブログ関連の分割
- Vuetify の読み込み見直し

注意:

- 現時点では警告であり、バックエンド着手前の必須作業ではない。

### 10. E2E寄りの最低限確認

目的:

- バックエンド接続前後で壊れていないか確認する導線を明確にする。

候補導線:

- Play -> Result -> Ranking
- Settings -> Time Attack -> Result -> Ranking
- Blog list -> Blog detail -> Previous / Next navigation
- Settings -> Score reset -> Ranking empty state

まずは自動化ではなく、手順書化でもよい。

## 推奨する次の作業順

1. Phase5 / Phase6 のREADMEとdocsを整理する。
2. API接続を見越した型整理を進める。
3. loading / error / empty 表示の適用範囲を広げる。
4. 余力があれば chunk size warning と導線確認を進める。

## バックエンド着手時の入口

バックエンド側では、まず以下のAPIから着手するとフロントエンドと接続しやすいです。

```text
POST /api/scores
GET /api/scores
GET /api/rankings
```

フロントエンド側では、現在の `scoreService` を起点に localStorage 保存から API 保存へ段階的に移行します。
