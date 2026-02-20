<script setup lang="ts">
import { computed, onBeforeMount, ref } from "vue";
import Loading from "@/components/Loading.vue";
import BlogPagingList from "@/components/BlogPagingList.vue";
import { useRouter } from "vue-router";
import { useBlogPostsStore } from "@/stores/BlogPosts"
import { PostIndex } from "@/types/interfaces";

const router = useRouter();

/** 現在のページ */
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
const pageStatus = ref<PostIndex[]>([]);
/** 記事の総件数 */
const pageCounts = computed((): number => {
  return blogPostsStore.postCount;
});

/** データ取得中フラグ */
const isLoading = computed((): boolean => {
  return blogPostsStore.getLoading;
});

/** ページ遷移 */
const searchPaging = (pageNumber: number) => {
  currentPage.value = pageNumber;
  pageStatus.value = blogPostsStore.getPostRageByPage(pageNumber);
  console.log(pageNumber);
};

/** 記事の一覧情報をセットする。 */
onBeforeMount(async () => {
  document.title = "ブログの一覧";
  await blogPostsStore.recievePostIndex();
  pageStatus.value = blogPostsStore.getPostRageByPage(1);
  console.log("BlogPostList: Component about to be mounted.");
});
</script>
<template>
  <BlogPagingList v-if="!isLoading" :pageStatus="pageStatus" :pageCounts="pageCounts" :currentPage="currentPage"
    @doPostDetail="doPostDetail" @toNumberPage="searchPaging" />
  <Loading v-if="isLoading" />
</template>