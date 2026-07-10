# Coding Guidelines

このドキュメントは、Balloon Typing Game の実装で守る基本方針をまとめたものです。

## TypeScript

- `any` は原則使わず、必要な型を定義する。
- 複数ファイルで使うドメイン型は `src/types/interfaces.ts` に置く。
- 1つの `.vue` / `use〇〇.ts` の中だけで使う Props / Options / 内部型は、そのファイル内に置く。
- composable の外から直接使う戻り値型や options 型は `export interface` にする。
- `defineProps` / `defineEmits` は可能な限り型付きで書く。

## Shared Utilities

Ghost-PDF5、todo、typingGame を将来的に揃えるため、共通処理は責務ごとに置き場所を固定します。

- `src/utils/fetchClient.ts`
  - fetch共通処理、JSON送受信、HTTPエラー、Cookie送受信などを扱う。
  - Ghost-PDF5 の `rest.js` 相当です。
- `src/utils/gameUtils.ts`
  - 空判定、localStorage、ブラウザ判定など、画面から独立した補助処理を扱う。
  - Ghost-PDF5 の `util.js` 相当です。
- `src/constants/const.ts`
  - URL、画面選択肢、ゲーム設定値、表示用定数などを扱う。
  - Ghost-PDF5 の `const.js` 相当です。

新しく `rest.ts`、`util.ts`、`const.ts` を増やす前に、既存の `fetchClient.ts`、`gameUtils.ts`、`constants/const.ts` に追加できるか確認してください。

Ghost-PDF5へ戻す時は、TypeScriptの型をそのまま移すのではなく、関数名、責務分離、エラー処理、localStorageの扱いを流用します。

## Backend API Connection

- 未ログインユーザーは、これまで通りlocalStorageにスコアを保存する。
- ログイン済みユーザーは、localStorage保存後に `POST /api/me/scores` へスコアを保存する。
- ログイン済みユーザーがランキング画面を開いた場合は、`GET /api/me/scores` でDB保存済みスコアの取得を試みる。
- API保存に失敗しても、localStorage側のプレイ結果は消さない。
- API取得に失敗しても、localStorageから復元済みのスコア一覧は維持する。
- API呼び出しは `fetchClient.ts` 経由に寄せる。
- セッションCookieを使うAPIでは、`credentials: "include"` が必要になる。
- GitHub Pagesでは当面FEだけを公開するため、バックエンドAPI前提の動きにしない。
- バックエンドAPI連携は `VITE_ENABLE_BACKEND_API=true` の場合だけ有効にする。
- `VITE_ENABLE_BACKEND_API` が未設定または `false` の場合は、ログイン導線を非表示にし、API保存も呼ばない。
- `VITE_API_BASE_URL` はAPI有効時の接続先だけを表す。APIの有効/無効判定には使わない。

### FE単体公開を守る設計

当面はGitHub Pagesでフロントエンドだけを公開し、EC2などでバックエンドを公開するのは後の学習フェーズにします。

そのため、公開版の最重要条件は「バックエンドが無くてもゲームとして自然に使えること」です。

- ゲーム開始、タイピング、リザルト表示、ランキング表示はFEだけで完結させる。
- スコア保存はlocalStorageを主とし、API保存は追加機能として扱う。
- バックエンドAPIが無効な環境では、ユーザーがログイン機能を見つけて失敗する状態を避ける。
- APIが落ちている、または未公開であることが、ゲーム体験の失敗に見えないようにする。

### `VITE_ENABLE_BACKEND_API` の責務

`VITE_ENABLE_BACKEND_API` は、バックエンドAPIを使うUIと通信処理を有効にするための明示フラグです。

```text
VITE_ENABLE_BACKEND_API=true
```

- `true`
  - ローカルでBE/FEを両方起動して動作確認する環境。
  - ログイン導線を表示する。
  - ログイン済みユーザーのスコアをAPIにも保存する。
  - ログイン済みユーザーのランキング表示では、APIからユーザー別スコア一覧を取得する。
- 未設定 / `false`
  - GitHub PagesなどFE単体公開の環境。
  - ログイン導線を表示しない。
  - `/login` へ直接アクセスされた場合はゲーム画面へ戻す。
  - スコアはlocalStorageへ保存し、API保存・API取得は呼ばない。

`VITE_API_BASE_URL` は接続先URLの設定であり、APIを使うかどうかの判断には使いません。URLが設定されているだけでAPI機能が有効になると、GitHub Pages公開時に意図しない通信が起きやすいためです。

### 判定を置く場所

フラグ判定は、ユーザー体験を守る層と通信を止める層の両方に置きます。

- `src/constants/const.ts`
  - `BACKEND_API.ENABLED` と `BACKEND_API.BASE_URL` を集約する。
- `src/components/TheHeader.vue`
  - API無効時はログインボタンとログアウト表示を出さない。
- `src/router/routes.ts`
  - バックエンドAPIが必要な画面に `meta.requiresBackendApi` を付ける。
- `src/router/index.ts`
  - API無効時に `requiresBackendApi` の画面へ入ろうとしたらゲーム画面へ戻す。
- `src/stores/auth.ts`
  - API無効時はログイン、登録、ログイン中ユーザー取得、ログアウトAPIを呼ばない。
- `src/stores/gameScores.ts`
  - API無効時はログイン状態が残っていてもスコアAPI保存・API取得を呼ばない。
  - API取得に失敗した場合は、既存のlocalStorage由来スコアを維持する。

UI側だけで隠すと、直アクセスや将来の実装追加でAPIが呼ばれる可能性があります。Store側だけで止めると、公開画面に使えないログイン導線が残ります。そのため、UI・router・storeの3箇所で責務を分けます。

### ローカル開発時の起動

BE連携を確認したい場合は、BEを起動したうえで以下のようにFEを起動します。

```bash
VITE_ENABLE_BACKEND_API=true npm run dev
```

`VITE_API_BASE_URL` を指定しない場合は、`http://localhost:8091` を使います。

別URLのAPIへ向ける場合:

```bash
VITE_ENABLE_BACKEND_API=true VITE_API_BASE_URL=http://localhost:8091 npm run dev
```

ローカル結合確認では、ブラウザで開くFEのURLも `http://localhost:8081` に揃えます。
`http://127.0.0.1:8081` で開くと、ブラウザ上は別オリジン扱いになり、CORSやCookie送受信の条件が変わるためです。

## Vue Components

- 画面コンポーネントは表示と composable の接続を主な責務にする。
- 画面単位の `.vue` は `GamePage.vue` / `RankingPage.vue` のように `Page` を付ける。
- アプリ共通部品は `AppHeader` / `AppAlerts` のように `App` を付ける。
- 用途が限定される部品は `ResultModal` / `GameTimer` のように役割が分かる名前にする。
- 公開済みURLの path は、ファイル名や route name を整理しても安易に変えない。
- ゲーム判定、スコア計算、タイマー、入力フィードバックなどの処理は composable に分ける。
- コンポーネント参照を使う場合は、`ref<any>` ではなく `TimerExpose` のような最小限の型を定義する。
- デバッグ用の `console.log` は残さない。

## Composables

- ファイル名は責務が分かる `use〇〇.ts` にする。
- 1つの composable に複数の責務を詰め込みすぎない。
- 純粋関数で表せる処理は、状態を持たない関数として切り出す。
- タイマーを開始する処理は、二重起動を防ぐため先に既存タイマーを停止する。
- `setInterval` / `setTimeout` を使う場合は、停止処理と破棄時の cleanup も用意する。

## Comments

- 公開関数や主要な型には JSDoc を付ける。
- `.ts` / `.vue` / `.mjs` の JSDoc は、読み手を揃えるため日本語で書く。
- JSDoc とは別に、処理順や分岐理由が読み取りにくい箇所には短いコメントを付ける。
- コメントは「何をしているか」より「なぜそうしているか」を優先する。
- 自明な代入や単純な return にはコメントを増やしすぎない。

## Tests

- composable に切り出したロジックは Vitest でテストする。
- 入力判定、スコア計算、タイマー、localStorage 復元、ブログ前後ナビなど、画面に依存しない処理を優先してテストする。
- バグ修正時は、可能なら再発防止のテストを追加する。

## README

- 機能を追加・整理したら、README の Features / Highlights / Component Design / Roadmap のズレを確認する。
- テストファイル数やテスト数を README に書いている場合は、追加後に更新する。

## Blog

- `blog_store/posts-index.json` は手動編集せず、Markdown の frontmatter から生成する。
- ブログ記事を追加・更新したら `npm run generate:posts` を実行する。
- コミット前に `npm run check:posts` を実行し、Markdown と `posts-index.json` のズレがないことを確認する。
