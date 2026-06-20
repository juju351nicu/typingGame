import type { PostIndex } from "@/types/interfaces";
import { defineStore } from "pinia";
import Fetcher from "@/utils/fetchClient";
import Const from "@/constants/const";
/**
 * BlogPostsストアで使用する変数の型定義
 */
interface PostsState {
  prevPageNo: number;
  pageStatus: PostIndex[];
  postHtml: string;
  isLoading: boolean;
}

/**
 * Markdown本文から記事管理用のfrontmatterを取り除く
 * @param markdown Markdown本文
 * @returns 表示用Markdown本文
 */
const removeFrontmatter = (markdown: string): string => {
  return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
};
/**
 * BlogPostsストア情報
 */
export const useBlogPostsStore = defineStore("Posts", {
  state: (): PostsState => ({
    prevPageNo: 1,
    isLoading: true,
    pageStatus: [],
    postHtml: "",
  }),
  getters: {
    /**
     * 前ページ番号を取得する
     * @returns フラグの判定
     */
    getPrevPageNo(): number {
      return this.prevPageNo;
    },
    /**
     * ローディング情報を取得する
     * @returns フラグの判定
     */
    getLoading(): boolean {
      return this.isLoading;
    },
    /**
     * 記事のマークダウン情報を取得する
     * @returns 記事のマークダウン情報
     */
    getPostHtml(): string {
      return this.postHtml;
    },
    /**
     * 記事情報リスト件数
     * @returns 難易度の数値
     */
    postCount(): number {
      return this.pageStatus.length;
    },
    /**
     * 記事情報リストを取得する。
     * @returns 記事情報リスト
     */
    getPostIndexList(): PostIndex[] {
      return this.pageStatus;
    },
    /**
     * 記事情報リストを取得する。
     * @param pageNumber ページ番号
     * @returns 記事情報リスト
     */
    getPostRageByPage: (state) => {
      return (pageNumber: number): PostIndex[] => {
        const SIZE = Const.NUMBER_OF_BLOGS;
        return state.pageStatus.slice(
          (pageNumber - 1) * SIZE,
          (pageNumber - 1) * SIZE + SIZE
        );
      };
    },
  },
  actions: {
    /**
     * 前ページ番号を保存する。
     * @param {number} payload
     */
    savePrevPageNo(payload: number) {
      this.prevPageNo = payload;
    },
    /**
     * 記事のJSON一覧を取得する
     */
    async recievePostIndex(): Promise<void> {
      this.isLoading = true;
      const response = await Fetcher.getRequest(
        Const.BLOG_PATH.POST_INDEX
      ).then((response) => {
        return response.json();
      });
      this.pageStatus = response;
      this.isLoading = false;
    },
    /**
     * 記事のマークダウン情報を取得する
     * @param section
     * @param id
     */
    async recieveBlogPost(section: string, id: string): Promise<void> {
      this.isLoading = true;
      const post = this.pageStatus.find((postIndex) => {
        return postIndex.section === section && postIndex.id === id;
      });
      // posts_index.jsonにurlがある場合は、実ファイル由来のURLを優先して読み込む。
      const postUrl = post?.url
        ? `${import.meta.env.BASE_URL}${post.url}`
        : Const.BLOG_PATH.POST_FOLDER + section + "/" + id + ".md";
      const response = await Fetcher.getRequest(postUrl)
        .then((response) => {
          return response.text();
        })
        .then((body) => {
          return removeFrontmatter(body);
        });
      this.postHtml = response;
      this.isLoading = false;
    },
  },
});
