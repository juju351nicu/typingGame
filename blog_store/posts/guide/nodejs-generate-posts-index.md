---
id: nodejs-generate-posts-index
title: Node.jsでMarkdownブログのposts-index.jsonを自動生成する
date: 2026-06-20
section: guide
description: Vue 3 + Vite + TypeScriptの技術ブログで、Markdownのfrontmatterからposts-index.jsonを自動生成するNode.jsスクリプトを追加したときの設計と実装をまとめました。
tags: Node.js, Markdown, TypeScript
---

# Node.jsでMarkdownブログのposts-index.jsonを自動生成する

このタイピングゲームには、Vue 3 + Vite + TypeScriptで作った技術ブログ機能があります。記事本文はMarkdownファイルで管理し、一覧画面と記事詳細画面は `posts-index.json` を読み込んでタイトル、説明文、日付、記事URLを表示しています。

最初は `posts-index.json` を手で編集していました。記事が3、4本のうちは何の問題もありませんが、増えてくると次のあたりが崩れます。Markdownを追加したのにJSONへの追記を忘れる、`id` や `section` の打ち間違いで記事詳細へ遷移できなくなる、Markdownの実ファイル位置と `url` がズレる、日付順の並びを毎回手で直す。

どれも気をつければ防げる類のミスですが、気をつける対象が記事本数に比例して増えていきます。そこで `posts-index.json` を手動編集するファイルから、Markdownから生成するファイルへ変えました。

用意したスクリプトは2つです。

```text
scripts/create-post.mjs
scripts/generate-posts.mjs
```

`create-post.mjs` が新規記事の作成、`generate-posts.mjs` が既存Markdownの走査と `posts-index.json` の再生成を担当します。

```bash
npm run create-post
npm run generate:posts
```

役割を分けたのは、記事を追加したときと、既存記事のタイトルや説明文だけを直したときで、同じ生成処理を使いたかったからです。`create-post.mjs` の最後は `generate-posts.mjs` の呼び出しになっています。

## Markdownにfrontmatterを持たせる

`posts-index.json` の情報源をMarkdown側へ移すので、各記事にメタ情報が必要です。frontmatterを記事の先頭に置きました。

```md
---
id: nodejs-generate-posts-index
title: Node.jsでMarkdownブログのposts-index.jsonを自動生成する
date: 2026-06-20
section: guide
description: Vue 3 + Vite + TypeScriptの技術ブログで、Markdownのfrontmatterからposts-index.jsonを自動生成するNode.jsスクリプトを追加したときの設計と実装をまとめました。
---

# Node.jsでMarkdownブログのposts-index.jsonを自動生成する
```

必須にしたのは `id`、`title`、`date`、`section`、`description` の5つです。この5つが揃っていれば、記事一覧に必要な情報はMarkdown側だけで作れます。

## 不足は警告ではなくエラーで止める

ここは最初どちらにするか迷いました。不足項目を警告で流して残りの記事だけ生成する方が、1本壊れていても他が公開できるので一見親切です。

ただ、この構成では壊れた `posts-index.json` がそのままGitHub Pagesへ出ていきます。`id` が無い記事が混ざれば記事詳細へ遷移できず、`title` が無ければ一覧の表示が崩れます。生成スクリプトは間違ったデータを自動で広げる側にも回れるので、警告ではなくエラーで止める方を選びました。

```js
const REQUIRED_FRONTMATTER_KEYS = [
  "id",
  "title",
  "date",
  "section",
  "description",
];
```

```js
const assertRequiredFrontmatter = (frontmatter, filePath) => {
  const missingKeys = REQUIRED_FRONTMATTER_KEYS.filter(
    (key) => !frontmatter[key]
  );

  if (missingKeys.length > 0) {
    throw new Error(
      `frontmatter の必須項目が不足しています: ${filePath} (${missingKeys.join(", ")})`
    );
  }
};
```

## urlはfrontmatterではなく実ファイルパスから作る

一番考えたのが `url` の作り方です。最初に書いたのは、frontmatterの `section` とファイル名をつなげる実装でした。

```js
url: `blog_store/posts/${frontmatter.section}/${file}`;
```

これは今の構成では正しく動きます。記事は `blog_store/posts/{section}/{id}.md` に置いてあるので、`section` とファイル名から実ファイルの位置を復元できます。

問題は、その前提が将来も成り立つとは限らないことです。記事が増えて、たとえばこう分けたくなったとします。

```text
blog_store/posts/guide/vue/vue3-setinterval-multiple-start.md
```

`section` は `guide` のままなので、frontmatterから組み立てたURLは `blog_store/posts/guide/vue3-setinterval-multiple-start.md` を指し続けます。ファイルは存在するのにURLだけが実体からズレる、原因の分かりにくい壊れ方です。

そこで `url` は、実際に見つけたMarkdownファイルのパスから作るようにしました。

```js
const getRelativeUrl = (fullPath) => {
  return path.relative(ROOT_DIR, fullPath).replace(/\\/g, "/");
};
```

`path.relative()` を使えば、frontmatterの申告ではなく実ファイルの位置が情報源になります。Windowsではパス区切りが `\` になるため、GitHub Pagesとブラウザで扱えるよう `/` へ統一しています。開発はWindows、デプロイ先はLinuxなので、ここを揃えておかないとローカルだけ通る状態になります。

## Markdownファイルは再帰的に探す

同じ理由で、ファイルの探索も階層を決め打ちにしていません。

```js
const findMarkdownFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return findMarkdownFiles(fullPath);
      }

      return entry.isFile() && entry.name.endsWith(".md") ? [fullPath] : [];
    })
  );

  return files.flat();
};
```

`blog_store/posts` 配下の `.md` をまとめて拾うので、階層を増やしても生成側は変更なしで追従します。

## dateはISO形式に寄せる

既存記事の日付は、こういう形式で書いていました。

```text
May 10, 2026
January 24, 2020
```

表示するだけなら困りません。ただ並び替えを機械的にやるなら、パースの当たり外れがない形の方が安全です。frontmatter側は `YYYY-MM-DD` に統一しました。

```text
2026-05-10
2020-01-24
```

生成時に `Date` へ変換し、新しい順に並べます。

```js
posts.sort((a, b) => getPostTimestamp(b) - getPostTimestamp(a));
```

## create-postはid生成だけ手を貸す

`create-post.mjs` では `title`、`section`、`description` を入力できます。`section` が未入力なら `guide` を使います。

英数字タイトルなら、タイトルから `id` を作ります。

```text
Temporary Test Post
  ↓
temporary-test-post
```

日本語タイトルはそのままではslugにできないので、`id` を手入力する形にしました。ここを機械的なローマ字変換で埋めることもできますが、`id` は記事URLの一部として公開後は変えにくい値です。自動生成に任せて後から後悔するより、書くときに決めた方が確実だと判断しました。

作られるMarkdownはfrontmatter付きです。

```md
---
id: temporary-test-post
title: Temporary Test Post
date: 2026-06-20
section: guide
description: Temporary description
---

# Temporary Test Post

Temporary description
```

## 画面側の変更は最小限にする

やりたかったのは `posts-index.json` の手動管理をなくすことだけなので、ブログ画面のリファクタリングはしていません。一覧・記事詳細はこれまで通り `posts-index.json` を読み込みます。

変えたのは記事詳細のMarkdown読み込みです。frontmatterは記事管理用の情報なので、本文には出したくありません。画面へ渡す前に先頭のfrontmatterだけ落とします。

```ts
const removeFrontmatter = (markdown: string): string => {
  return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
};
```

もう1点、記事詳細のMarkdown取得では、`section` と `id` からURLを組み立てるのではなく、`posts-index.json` の `url` があればそちらを優先します。生成側で実ファイルパスからURLを作った意味が、これで画面側まで通ります。

## GitHub Actionsでも生成する

ここまでで、ローカルで `npm run generate:posts` を叩けば `posts-index.json` は最新になります。ただ運用としては、記事を書いたあとに毎回それを実行してコミットする必要が残ります。

手動編集よりは楽ですが、忘れる余地は消えていません。Markdownだけコミットしてしまう、本文を少し直しただけのつもりで一覧用の `description` や `date` の変更を反映し忘れる、といったズレが起こります。生成できるものを人間が運ぶ限り、運び忘れは残ります。

そこでdeploy workflowにも `npm run generate:posts` を組み込みました。専用のworkflowを新しく作らなかったのは、既存のdeploy workflowが同じタイミングで動いていたからです。

```text
npm ci
npm run check:posts
npm run test
npm run build
GitHub Pages へ deploy
```

この列に `generate:posts` を足せば、deploy前に必ず記事一覧が最新化されます。

```yaml
- name: Checkout
  uses: actions/checkout@v4
  with:
    ref: ${{ github.ref_name }}

- name: Generate blog post index
  run: npm run generate:posts
```

生成後、`blog_store/posts-index.json` に差分があるかを見ます。差分がなければ何もせず後続へ進み、あれば `github-actions[bot]` としてコミットします。

```yaml
- name: Commit generated blog post index
  run: |
    if git diff --quiet -- blog_store/posts-index.json; then
      echo "posts-index.json is up to date."
      exit 0
    fi

    git config user.name "github-actions[bot]"
    git config user.email "github-actions[bot]@users.noreply.github.com"
    git add blog_store/posts-index.json
    git commit -m "chore: regenerate blog post index"
    git push origin HEAD:${{ github.ref_name }}
```

`checkout` の `ref` とpush先の両方に `${{ github.ref_name }}` を書いています。Actions上ではHEADが分離した状態になることがあるので、どのブランチへ反映するのかを明示しておかないと、生成したファイルの行き先が読みにくくなります。

## contents: writeが必要になる

Actionsからコミットしてpushするには、workflowの `permissions` に `contents: write` が必要です。GitHub Pagesへ配るだけならリポジトリを読めれば足りるので、もとは `contents: read` でした。

```yaml
permissions:
  contents: write
  pages: write
  id-token: write
```

`pages: write` と `id-token: write` はGitHub Pagesへのデプロイ用、`contents: write` は生成した `posts-index.json` をリポジトリへ戻すためのものです。書き込み権限を渡す変更なので、コミット対象も後述のとおり1ファイルに絞っています。

## check:postsは残す

`generate:posts` をActionsで実行するなら、`check:posts` は要らないように見えます。実際いったん外そうとしました。

残したのは、`check:posts` が確認しているのが生成の有無ではなく、生成結果の安定性だからです。中身はもう一度 `posts-index.json` を生成して差分が出ないかを見るだけですが、これが通らないなら生成処理自体が実行ごとに違う結果を出していることになります。

```yaml
- name: Check blog post index
  run: npm run check:posts
```

結果として二段構えになっています。

```text
1. generate:posts
   posts-index.json を最新化する

2. 必要なら自動コミット
   Markdown と posts-index.json のズレをリポジトリへ反映する

3. check:posts
   再生成しても差分が出ないことを確認する
```

## 自動コミットの範囲を絞る

自動コミットは便利ですが、Actionsに書き込み権限を渡した状態でもあります。対象は `blog_store/posts-index.json` だけに限定しました。

```bash
git add blog_store/posts-index.json
```

`git add -A` にしてしまうと、ビルド成果物や意図しない変更までActionsがコミットする余地が生まれます。記事本文のMarkdown自体も自動生成しません。本文は人が書き、一覧用のインデックスだけを生成する、という線をここで引いています。

## 確認したこと

`npm run generate:posts` でfrontmatterから `posts-index.json` が生成されること、`npm run create-post` の記事作成後にも再生成が走ることを確認しました。

frontmatterを欠いたMarkdownを一時的に置いて、エラーで停止することも見ています。

```text
frontmatter がありません: blog_store/posts/guide/frontmatter-error-check.md
```

最後に既存機能への影響として、ローカルで生成からビルドまでを通しました。

```bash
npm run generate:posts
npm run check:posts
npm run test
npm run build
```

## 振り返り

一番効いたのは、`url` を実ファイルパスから作る判断でした。`section` から組み立てる実装でもその時点では動いていたので、変えなくても困らなかったはずです。ただこの手のズレは、ディレクトリを分けた瞬間ではなく、その後で記事詳細を開いたときに気づきます。原因が生成スクリプトにあると分かるまでに時間を取られる壊れ方なので、動いているうちに直しておく価値がありました。

`generate:posts` と `check:posts` の二段構えも同じ考え方です。生成を自動化した以上、生成処理そのものが疑わしくなる場面が必ず来るので、その検査を残しておきます。

この生成処理を組み込んだデプロイworkflow全体は[Vue + ViteをGitHub ActionsからGitHub Pagesへ自動デプロイする](github-actions-pages-deploy)にまとめています。
