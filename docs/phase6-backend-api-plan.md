# Phase 6: Backend API Plan

## 目的

Phase6 では、現在 localStorage と Pinia persisted state で保持しているスコア情報を、Spring Boot API と接続できる形へ段階的に移行します。

まずはフロントエンドの既存体験を壊さず、スコア保存、ランキング取得、ユーザー別スコア管理へ進めるためのAPI境界を作ります。

## 前提

Phase5 までに以下は完了しています。

- タイムアタックモード
- ランキング画面の通常 / タイムアタック対応
- スコア / WPM / 正確率推移
- `scoreService` へのスコア保存処理分離
- スコア保存API向けの `SaveGameScoreRequest`
- スコア取得API向けの `GameScoreResponse`
- `fetchClient` のHTTPエラー共通化
- `fetchClient` の JSON helper
- ブログ記事取得処理の service 分離
- error / empty 表示の一部共通化

## 初期API候補

最初はスコア関連APIから着手します。

```text
POST /api/scores
GET /api/scores
GET /api/rankings
```

具体的な着手チェックリストは [`backend-startup-checklist.md`](./backend-startup-checklist.md) にまとめています。

## 現在の到達状況

2026-07-11 時点では、セッションCookie方式でバックエンドAPI連携を進めています。

実装済み:

- ユーザー登録API
- ログインAPI
- ログイン中ユーザー取得API
- ログアウトAPI
- スコア保存API
- ログインユーザー別スコア保存API
- ログインユーザー別スコア一覧取得API
- ランキング取得API
- FEの `VITE_ENABLE_BACKEND_API` フラグ
- FEの localStorage fallback
- FEのログイン画面
- FEのログイン済みスコア保存 / 取得
- FEのランキングAPI取得処理
- FEの「自分の記録 / 全体ランキング」表示切替
- FEのランキングAPI取得テスト

現在の残タスク:

1. FE画面から「全体ランキング」へ切り替え、`GET /api/rankings` の結果が表示されることをブラウザで手動確認する。
2. API無効時にGitHub Pages向けのFE単体動作が維持されることを確認する。
3. 必要に応じて、全体ランキングの文言や表示位置を微調整する。

この3項目が完了したら、Phase6 の「FE/BE一通りの実装」は一区切りとします。

### POST /api/scores

目的:

- ゲーム終了時のスコアを保存する。

フロントエンド接続候補:

```text
src/services/scoreService.ts
src/stores/gameScores.ts
src/views/GamePage.vue
```

検討する入力:

```ts
SaveGameScoreRequest
```

フロントエンドでは、既存の `GameScore` から `scoreService.toSaveGameScoreRequest` で `date` を除外して送信する想定です。

### GET /api/scores

目的:

- 保存済みスコア一覧を取得する。
- まずはログインなしの全件取得、またはローカルユーザー相当で開始する。

検討ポイント:

- localStorage の既存スコアを残すか、API取得へ完全移行するか。
- API失敗時に localStorage のスコアをフォールバック表示するか。
- ページングや期間指定をどの段階で入れるか。
- APIレスポンスは `GameScoreResponse` として受け取り、`scoreService.toGameScore` で既存画面用の `GameScore` へ変換する。

### GET /api/rankings

目的:

- ランキング画面用のスコア一覧を取得する。

検討するクエリ:

```text
mode
gameRule
timeLimitSeconds
limit
```

フロントエンド側では、現在の `createRankingScores` を残すか、API側でランキング済みのデータを返すかを決めます。

### mode / gameRule の扱い

Phase6 中は、既存のFE型、localStorageデータ、バックエンドAPIの互換性を優先し、`mode` と `gameRule` の値は現在の形を維持します。

```ts
mode: 0 | 1 | 2
gameRule: "normal" | "timeAttack"
```

`gameRule` は候補値が少なく、バックエンド側では enum 化しやすい項目です。
一方で `mode` は数値として画面、localStorage、API、DBに渡っているため、enum 化する場合は変換層を明確にする必要があります。

そのため、enum 化は「自分の記録 / 全体ランキング」の表示切替とテストまで終わった後の改善フェーズで検討します。
実装する場合も、外向きのAPI値はできるだけ変えず、FE側の `GameScore` や保存済みlocalStorageと矛盾しないようにします。

## 認証方式とJWT化のタイミング

Phase6 では、まず Spring Security のセッションCookie方式で認証を実装します。

理由:

- Spring Security の基本を学びやすい。
- ユーザー登録、ログイン、認証ユーザー取得、ログアウトの流れを小さく確認できる。
- FEでは `credentials: "include"` とCookie送受信の挙動を学べる。
- JWTを同時に入れると、token期限、refresh、保存場所、XSS/CSRF、独自filterなど考えることが増えすぎる。

JWT化は、Phase6の一通りの実装が完了してから検討します。
目安としては、お盆前後に Spring Security の仕組みを復習したうえで、別ブランチまたは小さい検証用プロジェクトで試してから typingGame へ戻す方針です。

JWT化で検討する候補:

```text
access token
refresh token
Authorization header
JWT filter
token期限切れ
refresh API
logout時の扱い
HTTPS前提の保存場所
```

フロントエンド側で影響を受ける候補:

```text
src/stores/auth.ts
src/services/authService.ts
src/utils/fetchClient.ts
```

## フロントエンド側の対応順

1. APIレスポンス用の型を整理する。
2. `scoreService` に API 保存 / 取得の入口を追加する。
3. localStorage 保存と API 保存を切り替えられる形にする。
4. ランキング画面の取得元を service 経由へ寄せる。
5. loading / error / empty 表示をAPI画面へ広げる。
6. 全体ランキングAPIを画面から使う場合は、「自分の記録 / 全体ランキング」の表示切替を追加する。

## 注意点

- 最初から localStorage を完全に捨てない。
- 既存の公開ページで遊べる状態を維持する。
- API失敗時のユーザー表示を先に決める。
- API DTO と画面表示用データを混ぜすぎない。
- JWT はPhase6完了後の改善フェーズで検討する。

## 完了条件

Phase6 の一区切り条件は以下です。

- スコア保存APIにフロントエンドから接続できる。
- ログイン済みユーザーのスコア保存 / 取得ができる。
- ランキング画面でAPI由来のスコアを表示できる。
- 全体ランキングAPIを画面から使う場合は、FE側の表示切替とテストがある。
- APIエラー時に画面が破綻しない。
- API無効時にGitHub Pages向けのFE単体動作が維持される。
- `npm run test` が通る。
- `npm run build` が通る。

Phase6完了後は、追加実装ではなく改善フェーズとして扱います。

改善候補:

- Service / ServiceImpl 化
- JWT化
- EC2 / RDS / S3 / GitHub Actions などのデプロイ学習
- E2Eテスト
- UI微調整
- 管理画面
- パスワード変更 / 退会 / ユーザー設定
- ランキング期間指定
- `mode` / `gameRule` の enum 化
- Docker化
