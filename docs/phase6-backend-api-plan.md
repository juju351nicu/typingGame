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
- FE画面からの全体ランキング表示確認
- API無効時のFE単体動作確認
- `npm run dev:api` によるAPI有効起動
- `8081` 固定と `--strictPort` によるCORS確認ミス防止

現在の残タスク:

1. JWT化へ進む前に、セッションCookie方式での結合確認結果を必要に応じて追記する。
2. JWT化の詳細設計をバックエンド側docsで具体化する。

ここまでで、Phase6 の「FE/BE一通りの実装」は一区切りです。

手動確認メモ:

- `GET /api/rankings?mode=2&gameRule=timeAttack&timeLimitSeconds=60&limit=20` でDB由来のスコアが返ることを確認済み。
- FEを `http://localhost:8081/scoresBoard` で開き、「全体ランキング」へ切り替えるとランキング表に4件表示されることを確認済み。
- API無効モードの `http://localhost:8082/scoresBoard` では、ログイン導線と「自分の記録 / 全体ランキング」切り替えが非表示で、ランキング画面自体は表示されることを確認済み。
- `npm run dev:api` でAPI有効モードを起動し、ユーザー登録、ログイン、ログイン状態でのゲーム結果保存、ランキング表示を確認済み。
- `npm run dev` でAPI無効モードを起動し、ログイン導線が非表示でFE単体動作できることを確認済み。
- `localhost:8082` などCORS未許可のポートでAPI有効モードを開くと、ログインAPIなどの通信に失敗する。API連携確認は `localhost:8081` に固定する。
- ログイン画面では、APIの `fieldErrors` がある場合はその内容を表示し、CORSやBE停止などfetch自体が失敗した場合は接続確認用メッセージを表示する。
- `http://127.0.0.1:8081` で開くと、CORSやCookie送受信の条件が変わるため、ローカル結合確認では `localhost` に揃える。

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

既存のFE型、localStorageデータ、バックエンドAPIの互換性を優先し、`mode` と `gameRule` の外向き値は現在の形を維持します。

```ts
export type GameMode = 0 | 1 | 2;
export type GameRule = "normal" | "timeAttack";
```

BE側では `GameModeEnum` / `GameRuleEnum` を使い、FE側では TypeScript の union型と `as const` 定数を使います。

```text
BE GameModeEnum.HARD -> API/DB/FE では 2
BE GameRuleEnum.TIME_ATTACK -> API/DB/FE では "timeAttack"
```

FE側で TypeScript の `enum` は使わず、以下の形にします。

```ts
const GAME_MODE = {
  EASY: 0,
  NORMAL: 1,
  HARD: 2,
} as const satisfies Record<string, GameMode>;
```

OpenAPI Generator は現時点では導入しません。
API数が増え、request / response 型の手書き同期がつらくなった段階で、`npm run generate:api` のような生成タスクを検討します。

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

Phase8の初期方針:

- 最初は access token のみで開始する。
- tokenは `sessionStorage` に保存する。
- API呼び出し時は `Authorization: Bearer {token}` を付ける。
- token期限切れ時はログイン状態をクリアし、再ログインを促す。
- refresh token は後回しにする。
- API無効時のFE単体動作とlocalStorage fallbackは維持する。

`sessionStorage` を使う理由:

- 同じタブでの画面リロード後もログイン状態を復元できる。
- ブラウザを閉じると消えるため、localStorageより残り続けにくい。
- JWTの学習用途として実装が分かりやすい。

JWT化後に更新するFE型の候補:

```ts
export interface LoginResponse {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  user: LoginUser;
}
```

JWT化後に追加する処理の候補:

```text
authStore
- accessToken を state に持つ
- sessionStorage へ保存 / 復元する
- logout 時に token を削除する

fetchClient
- token がある場合は Authorization ヘッダーを付ける
- 401 / token期限切れ時の扱いを整理する
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
