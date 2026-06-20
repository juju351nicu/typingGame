# Coding Guidelines

このドキュメントは、Balloon Typing Game の実装で守る基本方針をまとめたものです。

## TypeScript

- `any` は原則使わず、必要な型を定義する。
- 複数ファイルで使うドメイン型は `src/types/interfaces.ts` に置く。
- 1つの `.vue` / `use〇〇.ts` の中だけで使う Props / Options / 内部型は、そのファイル内に置く。
- composable の外から直接使う戻り値型や options 型は `export interface` にする。
- `defineProps` / `defineEmits` は可能な限り型付きで書く。

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

- `blog_store/posts_index.json` は手動編集せず、Markdown の frontmatter から生成する。
- ブログ記事を追加・更新したら `npm run generate:posts` を実行する。
- コミット前に `npm run check:posts` を実行し、Markdown と `posts_index.json` のズレがないことを確認する。
