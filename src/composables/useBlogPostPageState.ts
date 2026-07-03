import type { PostIndex } from "@/types/interfaces";
import { ref } from "vue";

interface BlogPostStore {
  /** 記事一覧の件数 */
  postCount: number;
  /** 現在のエラーメッセージ */
  getErrorMessage: string;
  /** 取得済みMarkdown本文 */
  getPostHtml: string;
  /** 記事一覧を取得する */
  receivePostIndex: () => Promise<void>;
  /** 指定記事のMarkdown本文を取得する */
  receiveBlogPost: (section: string, id: string) => Promise<void>;
}

type RenderMarkdown = (markdown: string) => string;
type LoadMarkdownRenderer = () => Promise<RenderMarkdown>;

/** Markdown rendererを遅延読み込みする。 */
const loadMarkdownRenderer: LoadMarkdownRenderer = async () => {
  const { renderMarkdown } = await import("@/composables/useMarkdownRenderer");
  return renderMarkdown;
};

/** ブラウザ環境の場合だけブログ記事用のdocument titleを設定する。 */
const setBlogPostDocumentTitle = (): void => {
  if (typeof document === "undefined") {
    return;
  }
  document.title = "ブログ記事";
};

/**
 * ブログ詳細画面の記事読み込み状態を管理する。
 *
 * 記事一覧が未取得なら先に一覧を取得し、記事本文取得後にMarkdownをHTMLへ変換する。
 * Markdown rendererは初期JSを重くしないよう、記事表示時だけ遅延読み込みする。
 *
 * @param blogPostsStore ブログ記事ストア
 * @param rendererLoader Markdown rendererの読み込み処理
 */
export const useBlogPostPageState = (
  blogPostsStore: BlogPostStore,
  rendererLoader: LoadMarkdownRenderer = loadMarkdownRenderer
) => {
  /** Htmlに表示するマークダウン情報 */
  const postHtml = ref("");

  /**
   * 記事を読み込んでHTML表示用の本文を更新する。
   *
   * @param section 記事セクション
   * @param id 記事ID
   */
  const loadPost = async (section: string, id: string): Promise<void> => {
    setBlogPostDocumentTitle();

    if (blogPostsStore.postCount === 0) {
      await blogPostsStore.receivePostIndex();
      if (blogPostsStore.getErrorMessage) {
        postHtml.value = "";
        return;
      }
    }

    await blogPostsStore.receiveBlogPost(section, id);
    if (blogPostsStore.getErrorMessage) {
      postHtml.value = "";
      return;
    }

    const renderMarkdown = await rendererLoader();
    postHtml.value = renderMarkdown(blogPostsStore.getPostHtml);
  };

  /**
   * 指定した記事の詳細ルート情報を作成する。
   *
   * @param post 移動先の記事
   * @returns vue-routerへ渡すルート情報
   */
  const createBlogPostRoute = (post: PostIndex) => ({
    name: "BlogPost",
    params: {
      section: post.section,
      id: post.id,
    },
  });

  return {
    createBlogPostRoute,
    loadPost,
    postHtml,
  };
};
