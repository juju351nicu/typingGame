# Balloon Typing Game

Vue 3 + TypeScript で作成した、風船を割っていくタイピングゲームです。

画面下から浮かび上がる風船型の単語を入力し、正しく打てると風船が破裂してスコアが加算されます。
プレイ後は WPM・正確率・ミス数・ランクを確認でき、同じ条件で遊んだ前回のスコアとも比較できます。

## Portfolio Summary

- Vue 3 / TypeScriptによるゲームUI、状態管理、レスポンシブ表示、Markdown技術ブログを実装しています。
- Spring Boot / MySQLのAPIをAWS EC2へ公開し、Nginx、HTTPS、JWT Bearer認証を使ってGitHub Pagesから接続しています。
- ロジックと主要コンポーネントを52ファイル・276テストで検証し、GitHub Actionsでformat・lint・typecheck・test・build・deployを自動化しています。

## Links

- [Live Demo](https://juju351nicu.github.io/typingGame/)
- [Frontend Repository](https://github.com/juju351nicu/typingGame)
- [Backend Repository](https://github.com/juju351nicu/typing-game-backend)

## Screenshots

### Start

![ゲーム開始画面](./public/images/readme-home.png)

### Game

![ゲーム画面](./public/images/readme-game.png)

### Result and Ranking

![リザルト画面](./public/images/readme-result.png)

![ランキング画面](./public/images/readme-ranking.png)

### Settings

![設定画面](./public/images/readme-settings.png)

### Blog

![ブログ一覧](./public/images/readme-blog-list.png)

![ブログ詳細](./public/images/readme-blog-detail.png)

### Mobile

![スマホ表示](./public/images/readme-mobile.png)

### About

![About画面](./public/images/readme-about.png)

## Features

- 画面下から浮かぶ風船型の単語表示
- タイピング入力の正誤判定
- 入力中の文字ハイライト
- ミス入力時の強調表示
- 正解時の風船破裂アニメーション
- スコア表示
- 開始前のゲーム説明、操作手順、評価指標、現在設定の表示
- プレイ中の経過時間 / 残り時間 / スコア / ミス数表示
- リザルト画面
- WPM / 正確率 / ミス数の表示
- 正タイプ数の表示
- 同条件で遊んだ前回スコアとの差分表示
- リトライ
- リザルト画面からランキングへの遷移
- 学習補助用の仮想キーボード表示
- localStorage を使ったランキング表示
- ユーザー登録とJWT Bearer認証によるログイン
- ログイン済みユーザーのスコアAPI保存
- ユーザー別スコアと全体ランキングの切り替え
- 未ログイン時のlocalStorage fallback
- バックエンドAPI無効時のFE単体動作
- 難易度設定
- タイムアタックモード
- スコア履歴の localStorage 保存・初期化
- Markdown ブログ記事の一覧・詳細表示
- ブログ記事の日付・セクション・技術タグ表示
- 最大幅800px、見出し余白、コードハイライト・横スクロールを整えた記事レイアウト
- ブログ記事詳細の前後ナビゲーション
- スマホ表示対応
- DOMPurifyによるMarkdown最終HTMLのサニタイズ
- GitHub Actions による format / lint / typecheck / test / build / deploy 自動化

## How to Play

1. デモURL、またはローカル環境でゲームを開きます。
2. `ゲームをはじめる` ボタンを押してゲームを開始します。
3. 画面に表示される風船の単語を入力します。
4. 正しく入力すると風船が破裂し、スコアが加算されます。
5. 通常モードでは、風船が画面上部まで到達するとゲーム終了です。
6. タイムアタックでは、設定した制限時間が 0 秒になるまでスコアを競います。
7. リザルト画面の `もう一度プレイ` ボタンから再挑戦できます。
8. 仮想キーボードは設定画面から任意で表示できます。

## Tech Stack

| 分類 | 技術 |
| --- | --- |
| Frontend | Vue 3, TypeScript, Vite, Vue Router, Pinia, Vuetify |
| Backend | Java 25, Spring Boot, Spring Security, JWT, JPA, Flyway |
| Database | MySQL 8.4, Docker Compose |
| Infrastructure | AWS EC2, Route 53, Nginx, Let's Encrypt, systemd |
| Test / CI/CD | Vitest, Vue Test Utils, ESLint, Prettier, vue-tsc, GitHub Actions, GitHub Pages |

## Highlights

- `setInterval` のタイマーIDを管理し、多重起動を防止
- `stopTimers` を導入し、画面遷移やゲーム終了時にタイマーを確実に停止
- GitHub Pages のベースパスに対応し、公開環境でのページ遷移エラーを修正
- macOS と Linux のファイル名大文字小文字差異による build エラーを修正
- Pinia と localStorage を使い、設定とスコアを保持
- CSS アニメーションで、風船の浮遊と破裂演出を実装
- 入力中の風船を強調し、正しい文字・ミス文字を視覚的に判別しやすく改善
- ミス入力時に入力欄と風船へ短いフィードバックアニメーションを追加
- 仮想キーボードで次に打つキー、押したキー、ミスしたキーを任意表示
- 開始画面でゲーム内容、3ステップの遊び方、記録される指標、現在設定を確認可能
- プレイ中は入力欄を最優先にし、経過時間、残り時間、スコア、ミス数を整理して表示
- リザルト画面で WPM / 正確率 / 正タイプ数 / ミス数 / ランクを表示
- リザルト画面で同条件の前回スコアとの差分を表示し、ランキング画面への導線を追加
- ランキング画面でスコア、ランク、WPM、正確率、正タイプ数、ミス数、難易度、タイム、通常 / タイムアタック別のベストを比較可能に改善
- ランキング画面で直近5件のスコア / WPM / 正確率推移を表示
- 分析グラフは現時点ではCSSの棒グラフで実装し、折れ線、複数指標の同時表示、期間指定へ広げる段階で Chart.js の導入を検討
- 設定画面で難易度、通常 / タイムアタック、制限時間、仮想キーボード表示、ライト / ダークテーマを変更可能
- Markdown ブログ詳細に、posts-index.json の順序を基準にした前後記事ナビを追加
- Markdown ブログを最大幅800pxの読み物レイアウトにし、記事メタ情報、技術タグ、見出し余白、コード横スクロールを追加
- Markdownから生成した最終HTMLをDOMPurifyでサニタイズし、XSS入力とリンク・画像保持をjsdom上の回帰テストで検証
- スコア保存処理をservice層へ分離し、将来のAPI保存へ差し替えやすい構成に整理
- スコアAPI接続を見越して保存リクエスト / APIレスポンス型と変換処理を追加
- fetchClient でHTTPエラーを共通例外として扱い、JSON helper も追加してAPI接続時の失敗検知と取得処理を整理
- ログイン済みの場合は `/api/me/scores` にスコアを保存し、未ログインの場合はlocalStorage保存のみを行う構成に整理
- ランキング画面では、ログイン済みかつバックエンドAPI有効時だけ `/api/me/scores` からユーザー別スコア一覧を取得し、失敗時はlocalStorageの表示を維持
- GitHub PagesからEC2上のHTTPS APIへ接続しつつ、API停止時もlocalStorageのプレイ結果を維持するfallback構成を実装
- ブログとランキングの error / empty 表示を共通コンポーネントへ整理
- アラート通知を通知ごとの表示状態で管理し、後続通知の自動非表示が崩れないように改善
- リトライ時のページリロードを廃止し、ゲーム状態とタイマーをリセットするSPA内完結の挙動に改善
- ルート単位の遅延読み込みと Markdown renderer の分割により、初期JSと blog chunk の肥大化を軽減
- JWTの有効期限を保存時刻から計算し、期限切れトークンをAPI送信前に破棄
- APIの送信先をURLのoriginで検証し、外部originへAuthorizationヘッダーや認証Cookieを送らないよう制限
- UA文字列によるChrome限定判定を廃止し、必要なlocalStorage機能の可否だけを検出
- ESLint / Prettier / vue-tscを導入し、Pull Requestとデプロイの両方で品質チェックを実行
- `prefers-reduced-motion`、アラート通知、ゲーム状態のARIA属性を追加
- スコア初期化前に確認ダイアログを表示し、誤操作で履歴を消しにくいように改善
- スマホ幅でもゲーム画面、リザルト画面、ランキング画面が見やすいようにレスポンシブ調整
- Vitest で 52 ファイル / 276 テストを実装し、タイピング処理、タイマー、認証、API通信、スコア保存、ランキング、ブログ、ルーティング、設定復元、Markdownサニタイズ、コンポーネント表示などを検証

## Component Design

`TypingPanel.vue` に集まっていたゲーム処理を、Composition API の composable として責務ごとに分離しています。

| ファイル | 役割 |
| --- | --- |
| `useBlogPostNavigation.ts` | ブログ記事詳細の前後ナビゲーション判定 |
| `useCompletedWordHandler.ts` | 単語一致時の破裂、スコア加算、削除後処理の制御 |
| `useDisplayTheme.ts` | Piniaの表示設定とVuetifyテーマの同期 |
| `useMarkdownRenderer.ts` | Markdown本文のHTML変換、コードハイライト、DOMPurifyによる最終HTMLのサニタイズ |
| `useRankingPageState.ts` | ランキング画面のフィルター、集計、推移表示状態の管理 |
| `useScoreReset.ts` | 保存済みスコアの初期化と成功アラート追加 |
| `useTypingGameWords.ts` | 表示中単語、出題インデックス、単語追加・削除・完了判定の管理 |
| `useTypingInput.ts` | 入力文字数、ミス数、ミス状態の算出 |
| `useTypingBoardLayout.ts` | 画面幅に応じた風船幅と表示横位置の算出 |
| `useTypingGameLifecycle.ts` | ゲーム開始時とリセット時の処理順制御 |
| `useTypingKeyboardFeedback.ts` | 仮想キーボードの押下キー・ミスキーの一時表示管理 |
| `useTypingKeyboard.ts` | 次に打つキー、押したキー、ミスキーの判定 |
| `useTypingScore.ts` | 正解時のスコアと正タイプ数の加算値算出 |
| `useTypingTimers.ts` | 単語追加・単語移動・破裂アニメーション用タイマーの管理 |
| `useTypingWordPositions.ts` | 風船の移動、画面上部到達判定 |
| `useTypingWords.ts` | 単語生成、文字ごとの正誤表示、入力状態クラスの生成 |
| `useTimeAttackTimer.ts` | タイムアタックモードの残り時間と時間切れ処理の管理 |

画面コンポーネントは表示と各 composable の接続を担当し、入力判定・タイマー・単語管理・スコア更新などのロジックはテストしやすい単位に分けています。

## Development

Node.js 20.19.0以上を使用します。

Coding guidelines:

```text
docs/coding-guidelines.md
```

Frontend cleanup plan before backend work:

```text
docs/frontend-pre-backend-plan.md
```

Backend API connection policy:

- 未ログインユーザーは、これまで通りPinia persisted state経由でlocalStorageにスコアを保存する。
- ログイン済みユーザーは、localStorage保存後に `POST /api/me/scores` へスコアを保存する。
- ログイン済みユーザーがランキング画面を開いた場合は、`GET /api/me/scores` からDB保存済みスコアを取得する。
- API保存に失敗しても、localStorage側のプレイ結果は消さない。
- API取得に失敗しても、localStorageから復元済みのランキング表示は維持する。
- `VITE_ENABLE_BACKEND_API=true` の場合だけ、ログイン導線とAPI保存を有効にする。
- GitHub Pagesでは `VITE_ENABLE_BACKEND_API=true`、`VITE_API_BASE_URL=https://api.clipdev.jp` で本番APIへ接続する。
- Ghost-PDF5 の `const.js`、`rest.js`、`util.js` は考え方を参考にするが、typingGameでは `src/constants/const.ts`、`src/utils/fetchClient.ts`、`src/utils/gameUtils.ts` へ責務を寄せる。
- JWTアクセストークンの保存・取得は `src/utils/authTokenStorage.ts` に寄せ、`fetchClient.ts` から `Authorization` ヘッダーを付ける。

Local integration check:

2026-07-10 にローカル環境でFE/BE結合確認済みです。

- Swagger UI からユーザー登録、ログイン、ログイン中ユーザー取得が成功する。
- Swagger UI から `POST /api/me/scores` でログインユーザーのスコア保存が成功する。
- Swagger UI から `GET /api/me/scores` でログインユーザーのスコア一覧取得が成功する。
- `VITE_ENABLE_BACKEND_API=true` でFEを起動すると、ログイン導線が表示される。
- FEからログイン後、ゲーム終了時にスコアが保存される。
- ランキング画面でDB保存済みスコアとFEから保存したスコアが表示される。
- API保存・取得に失敗しても、localStorage fallbackを維持する方針は継続する。

Production integration check:

2026-08-29に、GitHub PagesからEC2上の本番APIへの接続を確認しました。

- `https://api.clipdev.jp` のHTTPS、Nginx、Spring Boot、JWT認証が動作する。
- GitHub Pagesからユーザー登録・ログインでき、ログインユーザーがヘッダーへ表示される。
- sessionStorageのJWTを使い、ページ再読み込み後にログインユーザーを復元できる。
- ゲーム終了後にランキング画面へ遷移し、自分の記録を表示できる。
- EC2停止中も、ゲーム、localStorage保存、ローカルランキング、技術ブログは利用できる。

Local backend API:

```bash
npm run dev:api
```

`dev:api` は `VITE_ENABLE_BACKEND_API=true`、`VITE_API_BASE_URL=http://localhost:8091`、`--port 8081`、`--strictPort` 付きで起動します。
`8081` が使用中の場合は `8082` へ自動退避せず、CORSやCookie条件のズレに気づけるようにエラーで停止します。

FE単体モードは以下で起動します。

```bash
npm install
npm run dev
```

Local URL:

```text
http://localhost:8081/
```

## Build

```bash
npm run build
```

## Quality Check

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

すべてまとめて確認する場合は `npm run check` を使用します。

## Test

```bash
npm run test
```

## Blog Post

```bash
npm run create-post
```

`title`、`section`、`description`、任意の `tags`（カンマ区切り）を入力すると、frontmatter 付きの `blog_store/posts/{section}/{id}.md` が作成され、`blog_store/posts-index.json` が再生成されます。`section` を未入力にした場合は `guide` が使われます。

```bash
npm run generate:posts
```

`blog_store/posts-index.json` は、Markdown の frontmatter から生成するファイルです。手動編集せず、既存記事の情報を更新したい場合は Markdown 側の `id`、`title`、`date`、`section`、`description` を変更してから `npm run generate:posts` を実行します。

```bash
npm run check:posts
```

`check:posts` は `posts-index.json` を再生成し、生成結果がコミット済みの内容とズレていないか確認します。GitHub Actions でも実行し、ブログ記事とインデックスの不整合を検知します。

GitHub Actions では deploy 前に `npm run generate:posts` を実行し、`posts-index.json` に差分があれば `github-actions[bot]` が自動コミットします。これにより、Markdown 記事を追加・更新した際のインデックス更新漏れを防ぎます。

記事一覧インデックスは `posts-index.json` に統一しています。公開URLとして扱う静的ファイルのため、kebab-case に寄せています。

## Deployment

Pull Requestでは、GitHub Actionsでブログインデックス、format、lint、typecheck、test、buildを確認します。
`master` ブランチへpushすると、同じ品質チェックの通過後にGitHub Pagesへ自動デプロイされます。

GitHub リポジトリ名 `typingGame` のリネームは急ぎではありません。GitHub Pages の公開URL、Vite の `base`、README 内の Demo URL、スクリーンショット、外部ポートフォリオからのリンクに影響するため、Phase5 のタイムアタックモードが落ち着き、公開URLをまとめて見直すタイミングで検討します。

Workflow:

1. `npm ci`
2. `npm run generate:posts`
3. `posts-index.json` に差分があれば自動コミット
4. `npm run check:posts`
5. `npm run format:check`
6. `npm run lint`
7. `npm run typecheck`
8. `npm run test`
9. `VITE_ENABLE_BACKEND_API=true`、`VITE_API_BASE_URL=https://api.clipdev.jp` を設定して `npm run build`
10. `dist` を GitHub Pages へデプロイ

<details>
<summary><strong>Roadmap（開発履歴）</strong></summary>

## Roadmap

### Phase 1: ゲーム基本機能

- 風船型の単語表示
- タイピング入力の正誤判定
- スコア表示
- ゲームオーバー / リトライ
- 難易度設定

Status: 完了

### Phase 2: 学習補助とランキング

- WPM / 正確率 / 正タイプ数 / ミス数の表示
- localStorage によるスコア保存
- ローカルランキング表示
- 仮想キーボードによる次キー・押下キー・ミスキー表示
- スコア初期化確認ダイアログ

Status: 完了

### Phase 3: 公開・品質改善

- GitHub Pages 公開
- GitHub Actions による test / build / deploy 自動化
- Markdown ブログ一覧・詳細表示
- ブログ前後ナビゲーション
- スマホ表示対応
- composable 化による責務分離
- Vitest による主要ロジックのテスト

Status: 完了

### Phase 4: 仕上げと設計整理

- `TypingPanel.vue` のゲーム開始 / リセット処理を composable 化
- 風船の表示位置計算を composable 化
- 仮想キーボードの押下キー / ミスキー表示管理を composable 化
- composable 間の命名と責務境界を整理
- JSDoc と最低限の補足コメントを整備

Status: 完了

### Phase 5: 拡張機能

Plan: [`docs/phase5-time-attack-plan.md`](./docs/phase5-time-attack-plan.md)

Frontend cleanup before backend work: [`docs/frontend-pre-backend-plan.md`](./docs/frontend-pre-backend-plan.md)

Frontend smoke test checklist: [`docs/frontend-smoke-test-checklist.md`](./docs/frontend-smoke-test-checklist.md)

- タイムアタックモード
  - 30秒 / 60秒 / 90秒などの制限時間を選択
  - 通常モードとは別のゲームモードとして実装
  - 時間内のスコア、WPM、正確率をランキングで比較
- 分析グラフ
  - スコア推移
  - WPM推移
  - 正確率推移
  - Chart.js 導入検討: 折れ線、複数指標の同時表示、期間指定へ広げるタイミング
  - プレイ回数
  - 苦手キー

Status: 主要機能は完了。Chart.js を使う高度な分析、プレイ回数、苦手キーは後続候補。

### Phase 6: バックエンドAPI連携

Plan: [`docs/phase6-backend-api-plan.md`](./docs/phase6-backend-api-plan.md)

Backend startup checklist: [`docs/backend-startup-checklist.md`](./docs/backend-startup-checklist.md)

- Spring Boot API
  - スコア保存API
  - ランキング取得API
  - 成績一覧API
- JWTログイン
  - ユーザー登録
  - ログイン
  - ユーザー別スコア管理
- Docker / PWA
  - Docker Compose
  - オフライン対応
  - ホーム画面追加

Status: 完了。ローカル結合に加え、GitHub PagesからEC2上の本番APIへ接続済みです。MySQLはDocker Composeで稼働しています。

### Phase 7: FE/BE結合確認

目安: 半日〜1日

- バックエンドAPI有効時に、ユーザー登録、ログイン、スコア保存、ランキング表示を確認
- バックエンドAPI無効時に、GitHub Pages公開と同じFE単体モードでlocalStorage保存を確認
- API保存・取得に失敗してもlocalStorage fallbackが維持されることを確認
- 確認結果をREADMEまたはdocsに追記

確認済み:

- `npm run dev:api` で `http://localhost:8081` をAPI有効モードとして起動できる。
- API有効時はログイン導線が表示される。
- ユーザー登録、ログイン、ログイン状態でのゲーム結果保存ができる。
- ランキング画面で「自分の記録」と「全体ランキング」を切り替えられる。
- `npm run dev` でAPI無効のFE単体モードを起動できる。
- API無効時はログイン導線が非表示になり、ゲーム画面、localStorage保存、ランキング表示が動作する。
- API有効モードを `localhost:8082` などCORS未許可のポートで開くと通信に失敗するため、API連携確認は `localhost:8081` に固定する。
- ログインユーザー向けスコアAPIで401になった場合は、FE側のログイン状態をクリアし、共通アラートで再ログイン案内を表示する。localStorageに保存済みの記録は維持する。
- Cookie無効時はセッションCookie方式のログイン継続が難しくなるため、最終的な主方式はJWT Bearer認証に寄せる。
- localStorageは認証方式ではなく、未ログインスコア保存とAPI失敗時fallbackとして残す。

Status: 完了。ローカルと本番の両方でJWT Bearer認証を使用しています。

### Phase 8: JWT化

目安: 3日〜1週間

- ログイン成功時にJWTを発行
- フロントエンドでtokenを保持
- `Authorization` ヘッダーでログインユーザー向けAPIを呼び出す
- ログアウト、認証切れ、未ログイン時の表示を整理
- Spring Securityとフロントエンドのテストを追加

Status: 完了。BEのJWT発行・検証、FEのsessionStorage保存・Authorizationヘッダー付与・401時の再ログイン案内まで実装し、本番環境でも確認済みです。

### Phase 9: 本番公開準備

目安: 2日〜1週間

- 本番用CORS設定を整理
- `application-prod` や環境変数でDB接続情報を切り替える
- GitHub PagesからバックエンドAPIへ接続する前提で設定を整理
- 起動手順、環境変数、確認手順をREADME/docsにまとめる

Status: 完了。`docs/phase9-production-readiness-plan.md` にAPI公開前後の切り替え方針と、localStorage/sessionStorage/Cookieの役割をまとめています。2026-08-29にDeploy workflowを本番API有効モードへ切り替えました。

### Phase 10: EC2デプロイ学習

目安: 1〜2週間

- EC2前に、バックエンド側でMySQLだけDocker Compose固定
- EC2にJava、MySQL、Nginxを準備
- Spring Bootアプリを起動
- `systemd` でサービス化
- セキュリティグループ、ポート、HTTPSを確認
- GitHub PagesのFEからEC2上のBEへ疎通確認

Status: 完了。EC2、Docker/MySQL、Spring Boot、systemd、Nginx、独自ドメイン、HTTPS、JWT Bearer認証を構築し、GitHub Pagesからのブラウザログインとランキング画面表示まで確認済みです。

### 後続フェーズの考え方

現時点では、OpenAPI Generatorは導入しない方針です。
typingGameの規模では、手書きのTypeScript型とSwagger UIで十分に管理できます。
API数が増え、FE/BEの型同期コストが大きくなった段階で再検討します。

FE/BE結合、JWT化、本番公開準備、EC2学習まで完了しました。今後は運用確認、セキュリティ改善、高度な分析表示を必要性に応じて進めます。

</details>
