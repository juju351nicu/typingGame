
<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import Loading from "@/components/Loading.vue";
import BlogPagingList from "@/components/BlogPagingList.vue";
import { useRouter } from "vue-router";
import { useBlogPostsStore } from "@/stores/BlogPosts"
import Fetcher from "@/utils/rest";
const router = useRouter();

/** 最初のページ */
const currentPage = ref<number>(1);
/**
 * 記事の詳細ページに遷移する
 * @param section
 * @param id
 */
const doPostDetail = (section: string, id: string): void => {
  router.push({ name: "BlogPost", params: { section: section, id: id } });
};

const blogPostsStore = useBlogPostsStore();
/** 記事の一覧情報 */
const pageStatus = ref();
/** 記事の取得件数 */
const pageCounts = ref<number>(0);
/** データ取得中フラグ */
const isLoading = ref(false);
/** ページ遷移 */
const searchPaging = async (pageNumber: number) => {
  currentPage.value = pageNumber;
  isLoading.value = true;
  const response = await Fetcher.getRequest("blog_store/posts_index.json").then(response => {
    return response.json();
  });
  const postsIndex = response;
  pageStatus.value = postsIndex.slice(pageNumber, pageNumber + 5);
  isLoading.value = false;
  console.log(pageNumber);
};
/** 記事の一覧情報をセットする。 */
onBeforeMount(async () => {
  isLoading.value = true;
  blogPostsStore.recievePostIndex();
  const response = await Fetcher.getRequest("blog_store/posts_index.json").then(response => {
    return response.json();
  });
  const postsIndex = response;
  pageStatus.value = postsIndex.slice(1, 5);
  isLoading.value = false;
  console.log("BlogPostList: Component about to be mounted.");
  pageCounts.value = postsIndex.length;
});
</script>
<template>
  <!-- <PatchMeta :title="section ? section : 'Minimal Vue3 + Markdown blog engine'" /> -->
  <BlogPagingList v-if="!isLoading" :pageStatus="pageStatus" :pageCounts="pageCounts" :currentPage="currentPage"
    @doPostDetail="doPostDetail" @toNumberPage="searchPaging" />
  <Loading v-if="isLoading" />
</template>