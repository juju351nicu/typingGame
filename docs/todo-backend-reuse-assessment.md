# todo-backend Reuse Assessment

`/Users/shintaniken/Documents/workspace/todo-backend` を Phase6 のバックエンド実装に流用できるか確認したメモです。

## 結論

流用できます。ただし、既存APIをそのまま移植するより、Spring Boot / Doma / Security / 例外処理の「骨格」を使って、typingGame 用に小さく作り直す方が安全です。

特に最初のスコアAPIでは、認証や画面テンプレートを持ち込まず、REST API とDBアクセスだけを薄く作るのが良いです。

## 流用しやすいもの

### Spring Boot 構成

`todo-backend` は以下の構成を持っています。

- Spring Boot 3.3
- Java 21
- Maven
- Spring Web
- Spring Validation
- Spring Security
- Doma
- MySQL
- Lombok

typingGame のバックエンドも Spring Boot で始めるなら、`pom.xml` の依存関係はかなり参考になります。

### Doma の DAO / Entity 構成

以下の構成はスコアAPIにも流用しやすいです。

```text
entity/base/Todo.java
dao/TodoDao.java
src/main/resources/META-INF/.../*.sql
```

typingGame では以下のように置き換えるとよさそうです。

```text
entity/Score.java
dao/ScoreDao.java
src/main/resources/META-INF/.../ScoreDao/selectScores.sql
src/main/resources/META-INF/.../ScoreDao/selectRankings.sql
```

### Controller / Service / DTO の層構造

`TodoRestController -> TodoService -> TodoDao` の形は、スコアAPIにも使えます。

typingGame では以下のようにすると見通しが良いです。

```text
controller/ScoreController
service/ScoreService
dao/ScoreDao
entity/Score
dto/SaveScoreRequest
dto/ScoreResponse
```

### Validation

`TodoUpsertRequest` のように `@Valid` と Jakarta Validation を使う方針は流用できます。

typingGame の `SaveScoreRequest` では、例えば以下を検討できます。

- `score`: 0以上
- `mode`: 0, 1, 2
- `gameRule`: `normal` / `timeAttack`
- `timeLimitSeconds`: 30 / 60 / 90
- `accuracy`: 0から100
- `wpm`: 0以上

### CORS

`SecurityConfig` に `http://localhost:8081` を許可するCORS設定があります。typingGame の dev server も `localhost:8081` なので、考え方は流用できます。

ただし、本番URLや GitHub Pages のURLを見越して、許可Originは環境変数化した方が安全です。

## そのまま流用しない方がよいもの

### 認証 / JWT

JWTまわりは参考にはなりますが、そのまま流用しない方が良いです。

理由:

- JWT秘密鍵が固定文字列
- `NoOpPasswordEncoder` を使用している
- `X-AUTH-TOKEN` と `Authorization: Bearer` の方針が混在している
- コメントアウト済みの別JWT実装が残っている
- `System.out.println` が多い
- tokenの期限やrefresh tokenの方針が未整理

typingGame では、最初のスコアAPI接続ではJWTを後回しにして、スコア保存 / 取得 / ランキング取得が動いてから認証を足す方がよいです。

### application.yml

`todo-backend` の `application.yml` にはOAuth、メール、DBなどの接続情報が含まれています。

typingGame に流用する場合は、以下のように分離した方が安全です。

```text
application.yml
application-local.yml
.env.example
```

実値はGit管理せず、環境変数から読む形にします。

### 画面テンプレート / static assets

`todo-backend` は Thymeleaf のテンプレートや静的JS/CSSを多く持っています。

typingGame はフロントエンドが Vue / Vite 側にあるため、以下は基本的に不要です。

- `src/main/resources/templates`
- `src/main/resources/static/js`
- `src/main/resources/static/css`
- Thymeleaf 前提の画面Controller

### Todo固有ロジック

Todo固有の以下は流用対象外です。

- `TodoCallendarService`
- calendar/event API
- member管理画面
- inquiry mail
- news
- OAuth login

## typingGame 用に最初に作るなら

### 1. 認証なしスコアAPI

まずは認証なしで以下だけ作るのが良いです。

```text
POST /api/scores
GET /api/scores
GET /api/rankings
```

### 2. DBテーブル

最初の `scores` テーブル候補です。

```sql
CREATE TABLE scores (
  id BIGINT NOT NULL AUTO_INCREMENT,
  time VARCHAR(20) NOT NULL,
  score INT NOT NULL,
  mode INT NOT NULL,
  game_rule VARCHAR(20) NOT NULL DEFAULT 'normal',
  time_limit_seconds INT NULL,
  wpm INT NULL,
  accuracy INT NULL,
  miss_count INT NULL,
  correct_character_count INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);
```

### 3. DTO

フロントエンド側にはすでに以下があります。

```text
SaveGameScoreRequest
GameScoreResponse
```

バックエンド側は名前を合わせて以下にすると接続しやすいです。

```text
SaveScoreRequest
ScoreResponse
```

### 4. ランキング

初期は以下のどちらでもよいです。

- `GET /api/scores` で全件取得し、FEの既存 `createRankingScores` で並び替える
- `GET /api/rankings` でBE側が score desc / time asc / created_at desc で返す

おすすめは、最初は `GET /api/scores` をつなぎ、次に `GET /api/rankings` を足す順番です。

## 移植時の注意

- パスは `/api/v1` ではなく、FE計画に合わせて `/api` から始める方がシンプルです。
- `System.out.println` は使わず、`Slf4j` の logger に寄せる。
- パスワード認証を始めるまでは `spring-boot-starter-security` を入れないか、スコアAPIを permitAll にする。
- DB接続情報、JWT secret、OAuth secret、mail password は必ず環境変数化する。
- entity と request / response DTO は分ける。
- localStorage fallback を残すので、最初からログイン必須にしない。

## おすすめ判断

```text
todo-backend を土台として見る: OK
todo-backend をそのままコピーして使う: NG
Doma / Controller / Service / DAO / Validation の形を真似する: OK
JWT / OAuth / mail / Thymeleaf / static assets を持ち込む: 後回し
```

最初のバックエンド着手は、`ScoreController` と `ScoreDao` を中心にした小さいREST APIから始めるのが一番安全です。
