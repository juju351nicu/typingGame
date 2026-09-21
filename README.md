# Balloon Typing Game

[![Frontend CI](https://github.com/juju351nicu/typingGame/actions/workflows/ci.yml/badge.svg)](https://github.com/juju351nicu/typingGame/actions/workflows/ci.yml)

Vue 3 + TypeScriptで作成した、風船を割っていくタイピングゲームです。

画面下から浮かび上がる風船型の単語を入力し、正しく打てると風船が破裂してスコアが加算されます。
プレイ後はWPM・正確率・ミス数・ランクを確認でき、同じ条件で遊んだ前回のスコアとも比較できます。

個人開発として、設計、フロントエンド・バックエンド実装、テスト、CI/CD、AWS環境構築まで一通り担当しています。

## ポートフォリオ概要

- Vue 3 / TypeScriptによるゲームUI、状態管理、レスポンシブ表示、Markdown技術ブログを実装しています。
- Spring Boot / MySQLのAPIをAWS EC2へ公開し、Nginx、HTTPS、JWT Bearer認証を使ってGitHub Pagesから接続しています。
- ロジックと主要コンポーネントを53ファイル・283テストで検証し、GitHub Actionsでformat・lint・typecheck・test・build・deployを自動化しています。

## リンク

- [Live Demo](https://juju351nicu.github.io/typingGame/)
- [Frontend Repository](https://github.com/juju351nicu/typingGame)
- [Backend Repository](https://github.com/juju351nicu/typing-game-backend)

## 技術ブログ

アプリ内にMarkdownの技術ブログ機能を実装し、開発中の設計判断と切り分けを記事として公開しています。

- [GitHub PagesのVueからAWS EC2上のSpring Boot APIへHTTPS接続するまで](https://juju351nicu.github.io/typingGame/guide/ec2-spring-boot-https-frontend-connection) — EC2への配置からHTTPS化、`502 Bad Gateway`などの切り分けを記録しています。
- [Spring Security Resource ServerでJWT Bearer認証を実装する](https://juju351nicu.github.io/typingGame/guide/spring-security-jwt-resource-server) — CookieからJWTへの移行理由と、`sessionStorage`を選んだトレードオフを整理しています。
- [Node.jsでMarkdownブログのposts-index.jsonを自動生成する](https://juju351nicu.github.io/typingGame/guide/nodejs-generate-posts-index) — frontmatterから記事索引を生成し、CIで更新漏れを検知する構成を説明しています。

上記以外を含む全12記事は[技術ブログ一覧](https://juju351nicu.github.io/typingGame/blogPostList)から参照できます。

## スクリーンショット

### ゲーム開始

![ゲーム開始画面](./public/images/readme-home.png)

### プレイ中

![ゲーム画面](./public/images/readme-game.png)

### リザルト・ランキング

![リザルト画面](./public/images/readme-result.png)

![ランキング画面](./public/images/readme-ranking.png)

### 技術ブログ

![ブログ一覧](./public/images/readme-blog-list.png)

### スマホ表示

![スマホ表示](./public/images/readme-mobile.png)

## 主な機能

### ゲーム

- 画面下から浮かぶ風船型の単語表示とタイピング判定
- 通常モード / タイムアタックモードと難易度設定
- 入力中の文字ハイライト、ミス入力時の強調、正解時の破裂アニメーション
- 学習補助用の仮想キーボード（次に打つキー、押したキー、ミスしたキーを表示）
- プレイ中の経過時間 / 残り時間 / スコア / ミス数表示

### リザルト・ランキング

- WPM / 正確率 / 正タイプ数 / ミス数 / ランクの計測
- 同条件で遊んだ前回スコアとの差分表示
- localStorageによるスコア履歴とローカルランキング
- ログインユーザーのスコアDB保存と、ユーザー別 / 全体ランキングの切り替え
- 直近5件のスコア / WPM / 正確率の推移表示

### アカウント・API

- ユーザー登録とJWT Bearer認証によるログイン
- API障害時もプレイ結果を失わないlocalStorage fallback
- バックエンドAPI無効時のフロントエンド単体動作

### UI

- スマホ幅まで対応したレスポンシブ表示
- ライト / ダークテーマ
- ARIA属性と `prefers-reduced-motion` 対応

### 技術ブログ

- Markdown記事の一覧・詳細表示（日付、セクション、技術タグ）
- 記事詳細の前後ナビゲーションと、本文からの関連記事リンク（SPA遷移）
- DOMPurifyによるMarkdown最終HTMLのサニタイズ

## 遊び方

1. デモURLまたはローカル環境でゲームを開き、必要に応じて難易度、ゲームモード、仮想キーボードを設定します。
2. `ゲームをはじめる` を押し、風船に表示された単語を入力します。正しく入力すると風船が破裂してスコアが加算されます。
3. 通常モードは風船が画面上部へ到達すると終了し、タイムアタックは制限時間内のスコアを競います。
4. 終了後は成績と前回との差分を確認し、そのまま再挑戦またはランキング表示へ進めます。

## 技術スタック

| 分類 | 技術 |
| --- | --- |
| Frontend | Vue 3, TypeScript, Vite, Vue Router, Pinia, Vuetify |
| Backend | Java 25, Spring Boot, Spring Security, JWT, JPA, Flyway |
| Database | MySQL 8.4, Docker Compose |
| Infrastructure | AWS EC2, Route 53, Nginx, Let's Encrypt, systemd |
| Test / CI/CD | Vitest, Vue Test Utils, ESLint, Prettier, vue-tsc, GitHub Actions, GitHub Pages |

## アーキテクチャ

```text
        GitHub Pages
   Vue 3 / TypeScript / Pinia
             │
             │  HTTPS + JWT Bearer
             ▼
      AWS EC2 (Ubuntu 24.04)
             │
        Nginx (リバースプロキシ / Let's Encrypt)
             │
        Spring Boot (systemd)
             │
        MySQL 8.4 (Docker Compose)
```

フロントエンドはGitHub Pagesの静的ホスティング、APIはEC2上のNginx経由でSpring Bootへ転送しています。
API停止中もゲーム、localStorage保存、ローカルランキング、技術ブログは動作します。

## 実装上の工夫

- ゲームロジックをComposition APIのcomposableへ責務ごとに分離し、コンポーネントは表示と接続に専念させています。
- `setInterval` のタイマーIDを管理し、`stopTimers` で画面遷移・ゲーム終了時に確実に停止させて多重起動を防いでいます。
- Spring Security Resource ServerによるJWT Bearer認証を実装し、有効期限を保存時刻から計算して期限切れトークンをAPI送信前に破棄しています。
- APIの送信先をURLのoriginで検証し、外部originへ `Authorization` ヘッダーを送らないよう制限しています。
- スコア保存をservice層へ分離し、常にlocalStorageへ保存したうえで、バックエンドAPI有効かつログイン時だけ `POST /api/me/scores` にも保存しています。
- `fetchClient` でHTTPエラーを共通例外として扱い、API保存・取得の失敗時もlocalStorageのプレイ結果と表示を維持しています。
- Markdown技術ブログを実装し、`posts-index.json` をfrontmatterから生成してGitHub Actionsで更新漏れを検知しています。
- Markdownから生成した最終HTMLをDOMPurifyでサニタイズし、XSS入力とリンク・画像保持をjsdom上の回帰テストで検証しています。
- ルート単位の遅延読み込みとMarkdown rendererの分割により、初期JSとblog chunkの肥大化を軽減しています。
- Vitestで53ファイル / 283テストを実装し、タイピング処理、タイマー、認証、API通信、スコア保存、ランキング、ブログ、ルーティング、設定復元、Markdownサニタイズ、コンポーネント表示を検証しています。

## コンポーネント設計

`TypingPanel.vue` に集まっていた処理を、状態と副作用の境界に合わせてComposition APIのcomposableへ分離しています。

- 出題状態と入力判定: `useTypingGameWords.ts`、`useTypingInput.ts`、`useTypingWords.ts`
- 時間と画面上の移動: `useTypingTimers.ts`、`useTimeAttackTimer.ts`、`useTypingWordPositions.ts`
- ページ状態とMarkdown表示: `useRankingPageState.ts`、`useMarkdownRenderer.ts`

分離の考え方は[Vue 3 / TypeScriptで画面・API通信・状態管理・Utilityの責務を分離する](https://juju351nicu.github.io/typingGame/guide/vue-typescript-responsibility-separation)で説明しています。全体は `src/composables` を参照してください。

## 開発環境

Node.js 20.19.0以上を使用します。

```bash
npm install
npm run dev
```

バックエンドAPIと接続して起動する場合:

```bash
npm run dev:api
```

`dev:api` は `VITE_ENABLE_BACKEND_API=true`、`VITE_API_BASE_URL=http://localhost:8091`、`--port 8081`、`--strictPort` 付きで起動します。
`8081` が使用中の場合はポートを自動退避せず、CORS条件のズレに気づけるようエラーで停止します。

## 品質チェック

```bash
npm run check
```

`format:check`、`lint`、`typecheck`、`test`、`build` をまとめて実行します。

## ビルド

```bash
npm run build
```

## 技術ブログ記事の追加

```bash
npm run create-post
npm run generate:posts
```

`create-post` は `title`、`section`、`description`、任意の `tags` を入力するとfrontmatter付きの記事ファイルを作成します。
`blog_store/posts-index.json` はMarkdownのfrontmatterから自動生成するため、手動編集しません。

## デプロイ

Pull Requestでは、GitHub Actionsでブログインデックス、format、lint、typecheck、test、buildを確認します。
`master` ブランチへpushすると、同じ品質チェックの通過後にGitHub Pagesへ自動デプロイされます。

```text
generate:posts / check:posts
→ format:check
→ lint
→ typecheck
→ test
→ build
→ GitHub Pages deploy
```
