import type { PostIndex } from "@/types/interfaces";
import { defineStore } from "pinia";
import Fetcher from "@/utils/rest";
import Const from "@/constants/const";
/**
 * BlogPostsストアで使用する変数の型定義
 */
interface PostsState {
  pageStatus: PostIndex[];
  postHtml: string;
  isLoading: boolean;
}
/**
 * BlogPostsストア情報
 */
export const useBlogPostsStore = defineStore("Posts", {
  state: (): PostsState => ({
    pageStatus: [],
    postHtml: "",
    isLoading: true,
  }),
  getters: {
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
     * @param pageNumber ページ番号
     * @returns 記事情報リスト
     */
    getPostRageByPage: (state) => {
      return (pageNumber: number): PostIndex[] => {
        const SIZE = 5;
        return state.pageStatus.slice(
          (pageNumber - 1) * SIZE,
          (pageNumber - 1) * SIZE + SIZE
        );
      };
    },
  },
  actions: {
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
     * @returns 記事のマークダウン情報を取得する
     */
    async recieveBlogPost(section: string, id: string): Promise<string> {
      this.isLoading = true;
      return await Fetcher.getRequest(
        Const.BLOG_PATH.POST_FOLDER + section + "/" + id + ".md"
      )
        .then((response) => {
          return response.text();
        })
        .then((body) => {
          this.isLoading = false;
          return body;
        });
    },
  },
});
