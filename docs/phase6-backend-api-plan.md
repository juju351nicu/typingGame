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
{
  score: number;
  mode: number;
  gameRule: "normal" | "timeAttack";
  timeLimitSeconds?: 30 | 60 | 90;
  time: string;
  wpm?: number;
  accuracy?: number;
  missCount?: number;
  correctCharacterCount?: number;
}
```

### GET /api/scores

目的:

- 保存済みスコア一覧を取得する。
- まずはログインなしの全件取得、またはローカルユーザー相当で開始する。

検討ポイント:

- localStorage の既存スコアを残すか、API取得へ完全移行するか。
- API失敗時に localStorage のスコアをフォールバック表示するか。
- ページングや期間指定をどの段階で入れるか。

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

## JWTログイン候補

スコアAPIが接続できた後、ユーザー別スコア管理へ進む段階で JWT ログインを検討します。

候補API:

```text
POST /api/auth/register
POST /api/auth/login
GET /api/me
```

フロントエンド側の候補:

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
6. JWTログインが必要になった段階で `authService` と `auth` store を追加する。

## 注意点

- 最初から localStorage を完全に捨てない。
- 既存の公開ページで遊べる状態を維持する。
- API失敗時のユーザー表示を先に決める。
- API DTO と画面表示用データを混ぜすぎない。
- JWT はスコアAPIの接続が見えてから進める。

## 完了条件

Phase6 の初期完了条件は以下です。

- スコア保存APIにフロントエンドから接続できる。
- ランキング画面がAPI由来のスコアを表示できる。
- APIエラー時に画面が破綻しない。
- `npm run test` が通る。
- `npm run build` が通る。
