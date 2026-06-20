---
id: nodejs-generate-posts-index
title: Node.js で Markdown ブログの posts_index.json を自動生成した話
date: 2026-06-20
section: guide
description: Vue3 + Vite + TypeScript の技術ブログで、Markdown の frontmatter から posts_index.json を自動生成する Node.js スクリプトを追加したときの設計と実装をまとめました。
---

# Node.js で Markdown ブログの posts_index.json を自動生成した話

## はじめに

このタイピングゲームには、Vue3 + Vite + TypeScript で作った技術ブログ機能があります。

記事本文は Markdown ファイルとして管理し、記事一覧や記事詳細画面では `posts_index.json` を読み込んで、タイトル、説明文、日付、記事URLなどを表示しています。

もともとは `posts_index.json` を手動で編集していましたが、記事が増えるにつれて次のような問題が出やすくなります。

- Markdown を追加したのに `posts_index.json` への追記を忘れる
- `id` や `section` の入力ミスで記事詳細へ遷移できなくなる
- Markdown の実ファイル位置と `url` がズレる
- 日付順の並び替えを毎回手で直す必要がある

そこで、`posts_index.json` を手動編集するファイルではなく、Markdown から生成するファイルとして扱うようにしました。

---

## 目標

今回やりたかったことは、次の2つです。

1. 新しい記事を簡単に作成できるようにする
2. Markdown の情報から `posts_index.json` を安全に再生成できるようにする

そのために、Node.js のスクリプトを2つ用意しました。

```text
scripts/create-post.mjs
scripts/generate-posts.mjs
```

`create-post.mjs` は新規記事作成用です。

```bash
npm run create-post
```

`generate-posts.mjs` は既存の Markdown を走査して `posts_index.json` を再生成するためのスクリプトです。

```bash
npm run generate:posts
```

役割を分けることで、記事を追加するときも、既存記事のタイトルや説明文を修正したときも、同じ生成処理を使えるようにしました。

---

## Markdown に frontmatter を追加する

`posts_index.json` を生成するには、各記事に必要なメタ情報が必要です。

そこで、Markdown の先頭に frontmatter を追加しました。

```md
---
id: nodejs-generate-posts-index
title: Node.js で Markdown ブログの posts_index.json を自動生成した話
date: 2026-06-20
section: guide
description: Vue3 + Vite + TypeScript の技術ブログで、Markdown の frontmatter から posts_index.json を自動生成する Node.js スクリプトを追加したときの設計と実装をまとめました。
---

# Node.js で Markdown ブログの posts_index.json を自動生成した話
```

今回必須にした項目は以下です。

```text
id
title
date
section
description
```

この5つが揃っていれば、記事一覧に必要な情報を Markdown 側から作れます。

逆に、どれか1つでも欠けている場合は、`posts_index.json` を生成しないようにしました。

---

## frontmatter 不足は警告ではなくエラーにする

ブログ記事のメタ情報が不足している状態で `posts_index.json` を生成してしまうと、壊れた記事一覧が公開される可能性があります。

たとえば `id` が無い記事が混ざると、記事詳細ページへの遷移ができません。

`title` が無い記事が混ざると、一覧画面の表示が崩れます。

そのため、不足項目がある場合は警告で流さず、エラーで停止するようにしました。

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

ポイントは、壊れた状態の `posts_index.json` を作らないことです。

生成スクリプトは便利ですが、間違ったデータを自動で広げてしまうと逆に危険です。

---

## url は実ファイルパスから生成する

特に気をつけたのが `url` の作り方です。

最初に考えがちな実装は、frontmatter の `section` とファイル名をつなげる方法です。

```js
url: `blog_store/posts/${frontmatter.section}/${file}`
```

しかし、この方法だと将来ディレクトリ階層を深くしたときにズレる可能性があります。

たとえば、将来このような構成にしたくなるかもしれません。

```text
blog_store/posts/guide/vue/vue3-setinterval-multiple-start.md
```

このとき `section` だけを使ってURLを組み立てると、実ファイルの場所と一致しなくなる可能性があります。

そこで、`url` は実際に見つけた Markdown ファイルのフルパスから生成するようにしました。

```js
const getRelativeUrl = (fullPath) => {
  return path.relative(ROOT_DIR, fullPath).replace(/\\/g, "/");
};
```

`path.relative()` を使うことで、実ファイル位置を基準にした相対パスを作れます。

さらに、Windows ではパス区切りが `\` になるため、GitHub Pages やブラウザで扱いやすいように `/` へ統一しています。

```js
.replace(/\\/g, "/")
```

これで `posts_index.json` の `url` は、frontmatter から推測した値ではなく、実ファイル由来の値になります。

---

## Markdown ファイルを再帰的に探す

記事ファイルは現在、次のような構成です。

```text
blog_store/posts/{section}/{id}.md
```

ただし、将来さらに階層を増やしても対応できるように、Markdown ファイルは再帰的に探すようにしました。

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

この処理により、`blog_store/posts` 配下にある `.md` ファイルをまとめて取得できます。

---

## date は ISO 形式に寄せる

既存の記事では、日付が次のような形式でした。

```text
May 10, 2026
January 24, 2020
```

表示するだけなら問題ありませんが、並び替えや機械的な処理を考えると ISO 形式の方が扱いやすいです。

そこで、frontmatter 側の日付は `YYYY-MM-DD` に寄せました。

```text
2026-05-10
2020-01-24
```

生成時は `Date` に変換して、新しい日付順に並べます。

```js
posts.sort((a, b) => getPostTimestamp(b) - getPostTimestamp(a));
```

これにより、記事一覧では新しい記事が上に表示されます。

---

## create-post は記事作成、generate-posts は一覧生成

新規記事を作る `create-post.mjs` では、以下を入力できるようにしました。

```text
title
section
description
```

`section` が未入力の場合は `guide` を使います。

英数字タイトルの場合は、タイトルから `id` を自動生成します。

```text
Temporary Test Post
```

この場合、次のような `id` になります。

```text
temporary-test-post
```

日本語タイトルのように、そのままでは slug を作れない場合は、`id` を手入力します。

作成される Markdown は frontmatter 付きです。

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

そして、Markdown 作成後に `generate-posts.mjs` を呼び出して、`posts_index.json` を再生成します。

つまり、記事一覧の情報源は常に Markdown です。

---

## 画面側の変更は最小限にする

今回の目的は、ブログ画面の大きなリファクタリングではありません。

あくまで `posts_index.json` の手動管理をなくすことが目的です。

そのため、既存のブログ一覧・記事詳細画面は、これまで通り `posts_index.json` を読み込む構成のままにしました。

変更したのは、記事詳細で Markdown を読み込むときの処理です。

frontmatter は記事管理用の情報なので、本文には表示したくありません。

そこで、Markdown を画面に渡す前に、先頭の frontmatter だけ取り除くようにしました。

```ts
const removeFrontmatter = (markdown: string): string => {
  return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
};
```

また、記事詳細の Markdown 取得時は、`section` と `id` からURLを組み立てるだけでなく、`posts_index.json` の `url` があればそれを優先するようにしました。

これにより、将来 Markdown の階層が深くなっても、`posts_index.json` の `url` を正しく生成できていれば画面側は追従できます。

---

## 確認したこと

実装後、次の確認を行いました。

```bash
npm run generate:posts
```

Markdown の frontmatter から `posts_index.json` が生成されることを確認しました。

```bash
npm run create-post
```

新規記事作成後に、`posts_index.json` が再生成されることを確認しました。

frontmatter が不足した Markdown を一時的に追加し、エラーで停止することも確認しました。

```text
frontmatter がありません: blog_store/posts/guide/frontmatter-error-check.md
```

最後に、既存機能に影響がないことを確認しました。

```bash
npm run test
npm run build
```

テストとビルドが通ることで、ブログ表示やゲーム側の処理に大きな影響が出ていないことを確認できました。

---

## まとめ

今回の対応で、`posts_index.json` は手動編集するファイルではなく、Markdown から生成するファイルになりました。

手動管理を減らすことで、記事追加時のミスを減らせます。

また、`url` を実ファイルパスから生成するようにしたことで、将来ディレクトリ構成を変えた場合にも壊れにくくなりました。

小さな Node.js スクリプトですが、ブログ機能の運用をかなり楽にしてくれる改善になりました。
