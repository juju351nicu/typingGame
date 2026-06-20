<script setup lang="ts">
import Loading from "@/components/Loading.vue";
import { computed, onBeforeMount, onUnmounted, ref } from "vue";
import { onBeforeRouteUpdate, useRouter } from "vue-router";
import { useBlogPostsStore } from "@/stores/blogPosts";
import type { PostIndex } from "@/types/interfaces";
import { getBlogPostNavigation } from "@/composables/useBlogPostNavigation";
import { renderMarkdown } from "@/composables/useMarkdownRenderer";

/** Propsインタフェース定義 */
interface Props {
  section: string;
  id: string;
}

/** Propsインタフェース定義 */
const props = defineProps<Props>();

const router = useRouter();

/** ブログのストア情報取得 */
const blogPostsStore = useBlogPostsStore();

/** データ取得中フラグ */
const isLoading = computed((): boolean => {
  return blogPostsStore.getLoading;
});

/**
 * ブログ記事一覧ページに戻る
 */
const goBlogList = () => {
  router.push({
    path: "/blogPostList",
    query: { pageNumber: blogPostsStore.getPrevPageNo },
  });
};

/** 記事一覧 */
const posts = computed((): PostIndex[] => {
  return blogPostsStore.getPostIndexList;
});

/** 前後記事ナビゲーション */
const postNavigation = computed(() => {
  return getBlogPostNavigation(posts.value, props.id, props.section);
});

/** 前の記事 */
const prevPost = computed((): PostIndex | null => {
  return postNavigation.value.prevPost;
});

/** 次の記事 */
const nextPost = computed((): PostIndex | null => {
  return postNavigation.value.nextPost;
});

/** 指定した記事へ移動する */
const goPost = (post: PostIndex) => {
  router.push({
    name: "BlogPost",
    params: {
      section: post.section,
      id: post.id,
    },
  });
};

/** Htmlに表示するマークダウン情報 */
const postHtml = ref("");

/** 記事を読み込む */
const loadPost = async (section: string, id: string) => {
  document.title = "ブログ記事";
  if (blogPostsStore.postCount === 0) {
    await blogPostsStore.recievePostIndex();
  }
  await blogPostsStore.recieveBlogPost(section, id);
  postHtml.value = renderMarkdown(blogPostsStore.getPostHtml);
};

/** Htmlに表示するマークダウン情報をセットする。 */
onBeforeMount(async () => {
  await loadPost(props.section, props.id);
});

onBeforeRouteUpdate(async (to) => {
  await loadPost(String(to.params.section), String(to.params.id));
});
onUnmounted(() => {
  blogPostsStore.$reset();
});
</script>
<template>
  <v-container class="blog-post">
    <div class="markdown-body" v-html="postHtml" />
    <div class="post-navigation">
      <v-btn
        v-if="prevPost"
        class="post-navigation__button"
        variant="outlined"
        @click="goPost(prevPost)"
      >
        <span class="post-navigation__content">
          <span class="post-navigation__label">前の記事</span>
          <span class="post-navigation__title">{{ prevPost.title }}</span>
        </span>
      </v-btn>
      <v-btn
        v-if="nextPost"
        class="post-navigation__button post-navigation__button--next"
        variant="outlined"
        @click="goPost(nextPost)"
      >
        <span class="post-navigation__content post-navigation__content--next">
          <span class="post-navigation__label">次の記事</span>
          <span class="post-navigation__title">{{ nextPost.title }}</span>
        </span>
      </v-btn>
    </div>
    <div class="post-actions">
      <v-btn variant="elevated" @click="goBlogList()">一覧ページに戻る</v-btn>
    </div>
  </v-container>
  <Loading :isLoading="isLoading" />
</template>
<style scoped>
.blog-post {
  background-color: #ffffff;
  padding: 24px 16px 32px;
}

.post-navigation {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin: 32px 0 16px;
}

.post-navigation__button {
  flex: 1 1 0;
  max-width: 460px;
  min-width: 0;
  height: auto;
  min-height: 56px;
  padding: 8px 12px;
  white-space: normal;
}

.post-navigation__button :deep(.v-btn__content) {
  width: 100%;
  min-width: 0;
}

.post-navigation__button--next {
  margin-left: auto;
}

.post-navigation__content {
  display: flex;
  min-width: 0;
  width: 100%;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.post-navigation__content--next {
  align-items: flex-end;
}

.post-navigation__label {
  color: #616161;
  font-size: 0.75rem;
  line-height: 1.2;
}

.post-navigation__title {
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-actions {
  margin-top: 16px;
}

/* NOTE: VuetifyのCSS Resetで崩れる＋調整の為 */
div :deep(hr) {
  margin: 20px 0;
}

div :deep(p) {
  margin: 0 0 10px 0;
}

div :deep(h1),
div :deep(h2),
div :deep(h3) {
  margin: 20px 0 10px 0;
}

div :deep(h4),
div :deep(h5),
div :deep(h6) {
  margin: 10px 0;
}

div :deep(blockquote) {
  margin: 0 0 20px 0;
  padding: 10px 20px;
  border-left: 5px solid #eeeeee;
}

div :deep(ul),
div :deep(ol) {
  margin: 0 0 10px 0;
  padding: 0 0 0 40px;
}

div :deep(ul ul),
div :deep(ol ul),
div :deep(ul ol),
div :deep(ol ol) {
  margin: 0;
}

div :deep(code) {
  padding: 2px 4px;
  font-size: 90%;
  color: #d73a49;
  background-color: #f9f2f4;
  border-radius: 4px;
}

div :deep(pre) {
  padding: 9.5px;
  margin: 0 0 10px 0;
  word-break: break-all;
  background-color: #f5f5f5;
  border: 1px solid #cccccc;
  border-radius: 4px;
}

div :deep(pre code) {
  padding: 0;
  font-size: inherit;
  color: inherit;
  white-space: pre-wrap;
}

div :deep(table) {
  width: 100%;
  margin: 0 0 20px 0;
  border-collapse: collapse;
}

div :deep(th) {
  padding: 8px;
  border-bottom: 2px solid #dddddd;
}

div :deep(tr:nth-child(odd) > td) {
  background-color: #f9f9f9;
}

div :deep(td) {
  padding: 8px;
  border-top: 1px solid #dddddd;
}

div :deep(img) {
  max-width: 35%;
  vertical-align: middle;
}

@media (max-width: 600px) {
  .post-navigation {
    flex-direction: column;
  }

  .post-navigation__button {
    max-width: none;
  }

  .post-navigation__button--next {
    margin-left: 0;
  }
}
</style>
