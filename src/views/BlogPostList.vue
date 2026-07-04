<script setup lang="ts">
import Loading from "@/components/Loading.vue";
import AppStateMessage from "@/components/AppStateMessage.vue";
import BlogPagingList from "@/components/BlogPagingList.vue";
import { computed, onBeforeMount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useBlogPostsStore } from "@/stores/blogPosts";
import { useBlogPostListPageState } from "@/composables/useBlogPostListPageState";

/** 現在のURLクエリを参照するためのルート情報 */
const route = useRoute();
/** 記事詳細ページへ遷移するためのルーター */
const router = useRouter();

/** ブログ記事一覧と取得状態を管理するストア */
const blogPostsStore = useBlogPostsStore();

/** ブログ一覧ページのページング状態と遷移先生成処理 */
const {
  createPostDetailRoute,
  currentPage,
  loadCurrentPage,
  pageStatus,
  setPage,
  setPageFromQuery,
} = useBlogPostListPageState(blogPostsStore);

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

/**
 * 記事の詳細ページに遷移する。
 *
 * 遷移前に現在ページをストアへ保存し、詳細ページから一覧へ戻る際の
 * ページ復元に利用する。
 *
 * @param section 記事セクション
 * @param id 記事ID
 */
const doPostDetail = (section: string, id: string): void => {
  router.push(createPostDetailRoute(section, id));
};

/**
 * ページ番号を指定して表示記事を切り替える。
 *
 * @param pageNumber 表示するページ番号
 */
const searchPaging = (pageNumber: number) => {
  setPage(pageNumber);
};

/**
 * ブログ一覧画面の初期表示を準備する。
 *
 * URLクエリからページ番号を復元してから記事一覧を取得し、
 * 現在ページに対応する記事だけを画面へ反映する。
 */
onBeforeMount(async () => {
  document.title = "ブログの一覧";
  setPageFromQuery(route.query.pageNumber);
  await blogPostsStore.receivePostIndex();
  loadCurrentPage();
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
