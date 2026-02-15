<script setup lang="ts">
import { computed, onBeforeMount, ref } from "vue";
import Loading from "@/components/Loading.vue";
import BlogPagingList from "@/components/BlogPagingList.vue";
import { useRouter } from "vue-router";
import { useBlogPostsStore } from "@/stores/BlogPosts"
import Fetcher from "@/utils/rest";
import Const from "@/constants/const";
const router = useRouter();

/** 最初のページ */
const currentPage = ref<number>(1);

/** ブログのストア情報取得 */
const blogPostsStore = useBlogPostsStore();

/**
 * 記事の詳細ページに遷移する
 * @param section
 * @param id
 */
const doPostDetail = (section: string, id: string): void => {
  router.push({ name: "BlogPost", params: { section: section, id: id } });
};

/** 記事の一覧情報 */
const pageStatus = ref();
/** 記事の総件数 */
const pageCounts = computed((): number => {
  return blogPostsStore.postCount;
});
/** データ取得中フラグ */
const isLoading = ref(false);
// const isLoading = computed((): boolean => {
//   return blogPostsStore.getLoading;
// });
const SIZE = 5;
/** ページ遷移 */
const searchPaging = async (pageNumber: number) => {
  currentPage.value = pageNumber;
  isLoading.value = true;
  const response = await Fetcher.getRequest(Const.BLOG_PATH.POST_INDEX).then(response => {
    return response.json();
  });
  const postsIndex = response;
  pageStatus.value = postsIndex.slice(
    (pageNumber - 1) * SIZE,
    (pageNumber - 1) * SIZE + SIZE
  );
  isLoading.value = false;
  console.log(pageNumber);
};
/** 記事の一覧情報をセットする。 */
onBeforeMount(async () => {
  document.title = "ブログの一覧";
  isLoading.value = true;
  blogPostsStore.recievePostIndex();
  const response = await Fetcher.getRequest(Const.BLOG_PATH.POST_INDEX).then(response => {
    return response.json();
  });
  const postsIndex = response;
  pageStatus.value = postsIndex.slice(
    (1 - 1) * SIZE,
    (1 - 1) * SIZE + SIZE
  );
  isLoading.value = false;
  console.log("BlogPostList: pageStatus.value.");
  console.log("BlogPostList: Component about to be mounted." + postsIndex.length);
});
</script>
<template>
  <BlogPagingList v-if="!isLoading" :pageStatus="pageStatus" :pageCounts="pageCounts" :currentPage="currentPage"
    @doPostDetail="doPostDetail" @toNumberPage="searchPaging" />
  <Loading v-if="isLoading" />
</template>