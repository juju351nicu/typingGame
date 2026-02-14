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
     * 記事情報リストを取得する。
     * @returns 記事情報リスト
     */
    getPostStatus(): PostIndex[] {
      return this.pageStatus;
    },
  },
  actions: {
    /**
     *
     */
    async recievePostIndex() {
      const response = await Fetcher.getRequest(
        Const.BLOG_PATH.POST_INDEX
      ).then((response) => {
        return response.json();
      });
      const postsIndex = response;
      console.log(postsIndex.length);
      this.pageStatus = postsIndex.slice(1, 5);
    },
  },
});
