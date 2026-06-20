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
 * Normalizes path separators for browser and GitHub Pages URLs.
 *
 * @param {string} filePath File path from Node.js path utilities.
 * @returns {string} Path with forward slashes.
 */
const normalizePath = (filePath) => {
  return filePath.replace(/\\/g, "/");
};

/**
 * Creates a project-relative URL from the actual Markdown file path.
 *
 * The URL is intentionally based on the real file location, not on frontmatter
 * values, so deeper future directory structures still generate correct paths.
 *
 * @param {string} fullPath Absolute Markdown file path.
 * @returns {string} Project-relative URL for posts_index.json.
 */
const getRelativeUrl = (fullPath) => {
  return normalizePath(path.relative(ROOT_DIR, fullPath));
};

/**
 * Recursively collects Markdown files below the posts directory.
 *
 * @param {string} directory Directory to scan.
 * @returns {Promise<string[]>} Absolute paths to Markdown files.
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
 * Extracts simple key-value frontmatter from a Markdown document.
 *
 * @param {string} markdown Markdown file content.
 * @param {string} filePath Markdown file path used for error messages.
 * @returns {Record<string, string>} Parsed frontmatter values.
 * @throws {Error} When the Markdown file does not start with frontmatter.
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
 * Stops generation when required metadata is missing.
 *
 * @param {Record<string, string>} frontmatter Parsed frontmatter values.
 * @param {string} filePath Markdown file path used for error messages.
 * @throws {Error} When one or more required fields are missing.
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
 * Ensures generated index entries are unique.
 *
 * @param {Array<{ id: string, url: string }>} posts Generated posts so far.
 * @param {{ id: string, url: string }} post New post entry.
 * @param {string} filePath Markdown file path used for error messages.
 * @throws {Error} When id or url duplicates an existing entry.
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
 * Converts a post date into a sortable timestamp.
 *
 * @param {{ id: string, date: string }} post Post entry.
 * @returns {number} Timestamp used for descending sort.
 * @throws {Error} When the date cannot be parsed by Date.
 */
const getPostTimestamp = (post) => {
  const timestamp = new Date(post.date).getTime();
  if (Number.isNaN(timestamp)) {
    throw new Error(`date の形式が不正です: ${post.id} (${post.date})`);
  }

  return timestamp;
};

/**
 * Builds one posts_index.json entry from frontmatter and the actual file path.
 *
 * @param {Record<string, string>} frontmatter Parsed frontmatter values.
 * @param {string} filePath Absolute Markdown file path.
 * @returns {{ id: string, section: string, date: string, title: string, description: string, url: string }} Post index entry.
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
 * Regenerates blog_store/posts_index.json from Markdown frontmatter.
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
