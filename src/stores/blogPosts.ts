import type { PostIndex } from "@/types/interfaces";
import { defineStore } from "pinia";
import Const from "@/constants/const";
import {
  fetchBlogPostBody,
  fetchPostIndex,
} from "@/services/blogPostService";
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
      try {
        this.pageStatus = await fetchPostIndex();
      } finally {
        this.isLoading = false;
      }
    },
    /**
     * 記事のマークダウン情報を取得する
     * @param section
     * @param id
     */
    async recieveBlogPost(section: string, id: string): Promise<void> {
      this.isLoading = true;
      try {
        this.postHtml = await fetchBlogPostBody(this.pageStatus, section, id);
      } finally {
        this.isLoading = false;
      }
    },
  },
});
