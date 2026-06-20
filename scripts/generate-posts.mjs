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

const normalizePath = (filePath) => {
  return filePath.replace(/\\/g, "/");
};

const getRelativeUrl = (fullPath) => {
  return normalizePath(path.relative(ROOT_DIR, fullPath));
};

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

const getPostTimestamp = (post) => {
  const timestamp = new Date(post.date).getTime();
  if (Number.isNaN(timestamp)) {
    throw new Error(`date の形式が不正です: ${post.id} (${post.date})`);
  }

  return timestamp;
};

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
