import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT_DIR = process.cwd();
const BLOG_ROOT = path.join(ROOT_DIR, "blog_store");
const POSTS_ROOT = path.join(BLOG_ROOT, "posts");
const POSTS_INDEX_PATH = path.join(BLOG_ROOT, "posts_index.json");
const REQUIRED_FRONTMATTER_KEYS = [
  "id",
  "title",
  "date",
  "section",
  "description",
];

/**
 * ブラウザやGitHub Pagesで扱いやすいようにパス区切りを正規化する。
 *
 * @param {string} filePath Node.jsのpath関数から得たファイルパス
 * @returns {string} 区切り文字をスラッシュに統一したパス
 */
const normalizePath = (filePath) => {
  return filePath.replace(/\\/g, "/");
};

/**
 * 実際のMarkdownファイル位置からプロジェクト相対URLを生成する。
 *
 * frontmatterの値ではなく実ファイル位置を基準にすることで、
 * 将来ディレクトリ階層が深くなっても正しいURLを生成できる。
 *
 * @param {string} fullPath Markdownファイルの絶対パス
 * @returns {string} posts_index.json に保存するプロジェクト相対URL
 */
const getRelativeUrl = (fullPath) => {
  return normalizePath(path.relative(ROOT_DIR, fullPath));
};

/**
 * postsディレクトリ配下のMarkdownファイルを再帰的に収集する。
 *
 * @param {string} directory 探索対象ディレクトリ
 * @returns {Promise<string[]>} Markdownファイルの絶対パス一覧
 */
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

/**
 * Markdown本文から単純なkey-value形式のfrontmatterを抽出する。
 *
 * @param {string} markdown Markdownファイル本文
 * @param {string} filePath エラーメッセージ用のMarkdownファイルパス
 * @returns {Record<string, string>} 解析したfrontmatterの値
 * @throws {Error} Markdownファイルがfrontmatterで始まっていない場合
 */
const parseFrontmatter = (markdown, filePath) => {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (match === null) {
    throw new Error(`frontmatter がありません: ${getRelativeUrl(filePath)}`);
  }

  return match[1].split(/\r?\n/).reduce((frontmatter, line) => {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) {
      return frontmatter;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    frontmatter[key] = value.replace(/^["']|["']$/g, "");
    return frontmatter;
  }, {});
};

/**
 * 必須メタデータが不足している場合に生成処理を停止する。
 *
 * @param {Record<string, string>} frontmatter 解析済みfrontmatter
 * @param {string} filePath エラーメッセージ用のMarkdownファイルパス
 * @throws {Error} 必須項目が1つ以上不足している場合
 */
const assertRequiredFrontmatter = (frontmatter, filePath) => {
  const missingKeys = REQUIRED_FRONTMATTER_KEYS.filter(
    (key) => !frontmatter[key]
  );

  if (missingKeys.length > 0) {
    throw new Error(
      `frontmatter の必須項目が不足しています: ${getRelativeUrl(
        filePath
      )} (${missingKeys.join(", ")})`
    );
  }
};

/**
 * 生成する記事インデックスのidとurlが重複していないことを確認する。
 *
 * @param {Array<{ id: string, url: string }>} posts ここまでに生成した記事一覧
 * @param {{ id: string, url: string }} post 新しく追加する記事
 * @param {string} filePath エラーメッセージ用のMarkdownファイルパス
 * @throws {Error} idまたはurlが既存記事と重複している場合
 */
const assertUniquePost = (posts, post, filePath) => {
  const duplicatedId = posts.find((item) => item.id === post.id);
  if (duplicatedId) {
    throw new Error(
      `同じ id の記事が存在します: ${post.id} (${duplicatedId.url}, ${getRelativeUrl(
        filePath
      )})`
    );
  }

  const duplicatedUrl = posts.find((item) => item.url === post.url);
  if (duplicatedUrl) {
    throw new Error(`同じ url の記事が存在します: ${post.url}`);
  }
};

/**
 * 記事の日付をソート用のタイムスタンプへ変換する。
 *
 * @param {{ id: string, date: string }} post 記事情報
 * @returns {number} 降順ソートに使うタイムスタンプ
 * @throws {Error} Dateで解析できない日付の場合
 */
const getPostTimestamp = (post) => {
  const timestamp = new Date(post.date).getTime();
  if (Number.isNaN(timestamp)) {
    throw new Error(`date の形式が不正です: ${post.id} (${post.date})`);
  }

  return timestamp;
};

/**
 * frontmatterと実ファイルパスから posts_index.json の1件分を生成する。
 *
 * @param {Record<string, string>} frontmatter 解析済みfrontmatter
 * @param {string} filePath Markdownファイルの絶対パス
 * @returns {{ id: string, section: string, date: string, title: string, description: string, url: string }} 記事インデックス1件分
 */
const createPostIndex = (frontmatter, filePath) => {
  return {
    id: frontmatter.id,
    section: frontmatter.section,
    date: frontmatter.date,
    title: frontmatter.title,
    description: frontmatter.description,
    url: getRelativeUrl(filePath),
  };
};

/**
 * Markdownのfrontmatterから blog_store/posts_index.json を再生成する。
 *
 * @returns {Promise<void>}
 */
const main = async () => {
  const markdownFiles = await findMarkdownFiles(POSTS_ROOT);
  const posts = [];

  for (const filePath of markdownFiles) {
    const markdown = await readFile(filePath, "utf8");
    const frontmatter = parseFrontmatter(markdown, filePath);
    assertRequiredFrontmatter(frontmatter, filePath);

    // url は frontmatter から組み立てず、実ファイル位置から生成する。
    const post = createPostIndex(frontmatter, filePath);
    assertUniquePost(posts, post, filePath);
    posts.push(post);
  }

  posts.sort((a, b) => getPostTimestamp(b) - getPostTimestamp(a));

  await writeFile(POSTS_INDEX_PATH, `${JSON.stringify(posts, null, 2)}\n`, "utf8");
  console.log(`Generated: ${getRelativeUrl(POSTS_INDEX_PATH)}`);
  console.log(`Posts: ${posts.length}`);
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
