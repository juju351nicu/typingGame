import type { PostIndex } from "@/types/interfaces";
import { defineStore } from "pinia";
import Fetcher from "@/utils/rest";
import Const from "@/constants/const";
/**
 *
 */
interface PostsState {
  pageStatus: PostIndex[];
  isLoading: boolean;
}
/**
 *
 */
export const useBlogPostsStore = defineStore("Posts", {
  state: (): PostsState => ({
    pageStatus: [],
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
     * 記事情報リスト件数
     * @returns 難易度の数値
     */
    postCount(): number {
      return this.pageStatus.length;
    },
  },
  actions: {
    /**
     * 記事情報リストを取得する。
     * @param pageNumber ページ番号
     * @returns 記事情報リスト
     */
    getPostRageByPage(pageNumber: number): PostIndex[] {
      const SIZE = 5;
      return this.pageStatus.slice(
        (pageNumber - 1) * SIZE,
        (pageNumber - 1) * SIZE + SIZE
      );
    },
    /**
     *
     */
    async recievePostIndex() {
      this.isLoading = true;
      const response = await Fetcher.getRequest(
        Const.BLOG_PATH.POST_INDEX
      ).then((response) => {
        return response.json();
      });
      this.pageStatus = response;
      this.isLoading = false;
    },
  },
});
