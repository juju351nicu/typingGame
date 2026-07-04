# Backend Startup Checklist

お盆休みにバックエンド実装へ入りやすくするための着手メモです。

## 方針

- 最初はスコアAPIだけに絞る。
- JWTログインは、スコア保存 / 取得 / ランキング取得がつながってから着手する。
- フロントエンドの localStorage 保存はすぐに捨てず、API失敗時の退避先として残す。
- API DTO と画面表示用の `GameScore` を混ぜない。

既存の `/Users/shintaniken/Documents/workspace/todo-backend` の流用可否は [`todo-backend-reuse-assessment.md`](./todo-backend-reuse-assessment.md) に整理しています。

## 最初に作るAPI

```text
POST /api/scores
GET /api/scores
GET /api/rankings
```

### POST /api/scores

目的:

- ゲーム終了時のスコアを保存する。

リクエスト候補:

```json
{
  "time": "00:00:28.00",
  "score": 12,
  "mode": 2,
  "gameRule": "timeAttack",
  "timeLimitSeconds": 60,
  "wpm": 32,
  "accuracy": 96,
  "missCount": 2,
  "correctCharacterCount": 80
}
```

レスポンス候補:

```json
{
  "id": 1,
  "time": "00:00:28.00",
  "score": 12,
  "mode": 2,
  "gameRule": "timeAttack",
  "timeLimitSeconds": 60,
  "wpm": 32,
  "accuracy": 96,
  "missCount": 2,
  "correctCharacterCount": 80,
  "date": "2026-07-05 10:10:00"
}
```

フロントエンド側の既存対応:

- `src/types/interfaces.ts`
  - `SaveGameScoreRequest`
  - `GameScoreResponse`
- `src/services/scoreService.ts`
  - `toSaveGameScoreRequest(score)`
  - `toGameScore(response)`

### GET /api/scores

目的:

- 保存済みスコア一覧を取得する。

レスポンス候補:

```json
[
  {
    "id": 1,
    "time": "00:00:28.00",
    "score": 12,
    "mode": 2,
    "gameRule": "timeAttack",
    "timeLimitSeconds": 60,
    "wpm": 32,
    "accuracy": 96,
    "missCount": 2,
    "correctCharacterCount": 80,
    "date": "2026-07-05 10:10:00"
  }
]
```

検討:

- まずは全件取得でよい。
- 件数が増えてから `limit` / `offset` / `page` を追加する。
- API失敗時は localStorage のスコアを表示するか、エラー表示に倒すかを決める。

### GET /api/rankings

目的:

- ランキング画面用のスコア一覧を取得する。

クエリ候補:

```text
mode
gameRule
timeLimitSeconds
limit
```

例:

```text
GET /api/rankings?gameRule=timeAttack&timeLimitSeconds=60&limit=50
```

検討:

- 初期は `GET /api/scores` を取得してFE側で既存のランキング整形を使ってもよい。
- BE側でランキング済みデータを返す場合は、順位計算ルールをAPI仕様として固定する。

## Spring Boot 側の最初の構成候補

```text
controller/
  ScoreController

service/
  ScoreService

repository/
  ScoreRepository

entity/
  Score

dto/
  SaveScoreRequest
  ScoreResponse
```

最初のDB項目候補:

```text
id
time
score
mode
game_rule
time_limit_seconds
wpm
accuracy
miss_count
correct_character_count
created_at
```

## FE接続時の進め方

1. `fetchClient` に `API_BASE_URL` の考え方を入れる。
2. `scoreService` に `saveScoreApi` / `fetchScoresApi` を追加する。
3. `gameScores` store はまず localStorage 保存を残したまま、API保存を追加する。
4. API失敗時はアラート表示し、既存localStorage保存は維持する。
5. ランキング画面は API取得へ切り替える前に、取得元を service 経由へ寄せる。

## 後回しでよいもの

- JWTログイン
- ユーザー別ランキング
- Chart.js
- 期間指定グラフ
- スコア移行バッチ
- Docker / PWA

## 着手前確認

```bash
npm run test
npm run build
```

現時点のFE側テスト目安:

```text
46 files / 224 tests
```
