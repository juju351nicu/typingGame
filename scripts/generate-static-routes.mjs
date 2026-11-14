import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const ROOT_DIR = process.cwd();
const DEFAULT_DIST_DIR = path.join(ROOT_DIR, "dist");
const DEFAULT_POSTS_INDEX_PATH = path.join(
  ROOT_DIR,
  "blog_store",
  "posts-index.json"
);

const FIXED_ROUTE_PATHS = [
  "scoresBoard",
  "settingBoard",
  "login",
  "admin/notifications",
  "blogPostList",
  "aboutUs",
];

const SAFE_ROUTE_SEGMENT_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/;

/**
 * GitHub Pagesへ出力できる安全な1階層分のroute名か確認する。
 *
 * @param {unknown} segment sectionまたは記事ID
 * @param {string} fieldName エラー表示用の項目名
 * @returns {string} 検証済みsegment
 */
const assertSafeRouteSegment = (segment, fieldName) => {
  if (
    typeof segment !== "string" ||
    !SAFE_ROUTE_SEGMENT_PATTERN.test(segment)
  ) {
    throw new Error(`記事の${fieldName}が静的routeとして不正です: ${segment}`);
  }

  return segment;
};

/**
 * 固定画面と記事一覧から、静的entryを生成するroute pathを作る。
 *
 * @param {Array<{ section: unknown, id: unknown }>} posts 記事索引
 * @returns {string[]} 重複のないアプリ相対route path
 */
export const createStaticRoutePaths = (posts) => {
  if (!Array.isArray(posts)) {
    throw new Error("posts-index.jsonのrootは配列である必要があります");
  }

  const articleRoutes = posts.map((post) => {
    const section = assertSafeRouteSegment(post.section, "section");
    const id = assertSafeRouteSegment(post.id, "id");
    return `${section}/${id}`;
  });
  const routes = [...FIXED_ROUTE_PATHS, ...articleRoutes];

  if (new Set(routes).size !== routes.length) {
    throw new Error("静的route pathが重複しています");
  }

  return routes;
};

/**
 * Viteのentry HTMLを各routeへ配置し、GitHub Pagesの直リンクを200にする。
 *
 * @param {{ distDir?: string, postsIndexPath?: string }} options 入出力path
 * @returns {Promise<string[]>} 生成したroute path
 */
export const generateStaticRoutes = async ({
  distDir = DEFAULT_DIST_DIR,
  postsIndexPath = DEFAULT_POSTS_INDEX_PATH,
} = {}) => {
  const [entryHtml, postsJson] = await Promise.all([
    readFile(path.join(distDir, "index.html"), "utf8"),
    readFile(postsIndexPath, "utf8"),
  ]);
  const routes = createStaticRoutePaths(JSON.parse(postsJson));

  await Promise.all(
    routes.map(async (routePath) => {
      const routeDirectory = path.join(distDir, ...routePath.split("/"));
      await mkdir(routeDirectory, { recursive: true });
      await writeFile(
        path.join(routeDirectory, "index.html"),
        entryHtml,
        "utf8"
      );
    })
  );
  await writeFile(path.join(distDir, "404.html"), entryHtml, "utf8");

  return routes;
};

const isExecutedDirectly =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isExecutedDirectly) {
  generateStaticRoutes()
    .then((routes) => {
      console.log(`Generated static routes: ${routes.length}`);
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    });
}
