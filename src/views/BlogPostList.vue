<script setup lang="ts">
import Loading from "@/components/Loading.vue";
import AppStateMessage from "@/components/AppStateMessage.vue";
import BlogPagingList from "@/components/BlogPagingList.vue";
import { computed, onBeforeMount, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useBlogPostsStore } from "@/stores/blogPosts";
import { PostIndex } from "@/types/interfaces";

const router = useRouter();

/** ブログのストア情報取得 */
const blogPostsStore = useBlogPostsStore();

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

/** エラーメッセージ */
const errorMessage = computed((): string => {
  return blogPostsStore.getErrorMessage;
});

/** 現在のページ */
const currentPage = ref<number>(1);

/**
 * 記事の詳細ページに遷移する
 * @param section
 * @param id
 */
const doPostDetail = (section: string, id: string): void => {
  blogPostsStore.savePrevPageNo(currentPage.value);
  router.push({ name: "BlogPost", params: { section: section, id: id } });
};

/** ページ遷移 */
const searchPaging = (pageNumber: number) => {
  currentPage.value = pageNumber;
  pageStatus.value = blogPostsStore.getPostRangeByPage(pageNumber);
  console.info(pageNumber);
};

/** 記事の一覧情報をセットする。 */
onBeforeMount(async () => {
  document.title = "ブログの一覧";
  const route = useRoute();
  const queryName = route.query.pageNumber;
  if (queryName !== null && queryName !== undefined) {
    currentPage.value = Number(queryName);
    console.info("ここを通りました。" + route.query.pageNumber);
  }
  await blogPostsStore.receivePostIndex();
  pageStatus.value = blogPostsStore.getPostRangeByPage(currentPage.value);
  console.info("BlogPostList: Component about to be mounted.");
});
</script>
<template>
  <BlogPagingList
    v-if="!isLoading && !errorMessage && pageCounts > 0"
    :pageStatus="pageStatus"
    :pageCounts="pageCounts"
    :currentPage="currentPage"
    @doPostDetail="doPostDetail"
    @toNumberPage="searchPaging"
  />
  <AppStateMessage
    v-else-if="!isLoading && errorMessage"
    type="error"
    title="記事一覧を表示できません"
    :message="errorMessage"
  />
  <AppStateMessage
    v-else-if="!isLoading"
    type="empty"
    title="記事がありません"
    message="記事を追加するとここに一覧が表示されます。"
  />
  <Loading :isLoading="isLoading" />
</template>
