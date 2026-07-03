import Const from "@/constants/const";
import type { PostIndex } from "@/types/interfaces";
import Fetcher from "@/utils/fetchClient";
import { removeFrontmatter } from "@/utils/markdownUtils";

/**
 * 記事のJSON一覧を取得する。
 * @returns 記事情報リスト
 */
export const fetchPostIndex = async (): Promise<PostIndex[]> => {
  const response = await Fetcher.getRequest(Const.BLOG_PATH.POST_INDEX);
  return response.json();
};

/**
 * 記事のMarkdown本文を取得する。
 * @param pageStatus 記事情報リスト
 * @param section 記事セクション
 * @param id 記事ID
 * @returns frontmatterを除去したMarkdown本文
 */
export const fetchBlogPostBody = async (
  pageStatus: PostIndex[],
  section: string,
  id: string
): Promise<string> => {
  const post = pageStatus.find((postIndex) => {
    return postIndex.section === section && postIndex.id === id;
  });

  // posts_index.jsonにurlがある場合は、実ファイル由来のURLを優先して読み込む。
  const postUrl = post?.url
    ? `${import.meta.env.BASE_URL}${post.url}`
    : Const.BLOG_PATH.POST_FOLDER + section + "/" + id + ".md";

  const response = await Fetcher.getRequest(postUrl);
  const body = await response.text();
  return removeFrontmatter(body);
};
