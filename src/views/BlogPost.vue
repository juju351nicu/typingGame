<script setup lang="ts">
import Loading from "@/components/Loading.vue";
import AppStateMessage from "@/components/AppStateMessage.vue";
import { computed, onBeforeMount, onUnmounted } from "vue";
import { onBeforeRouteUpdate, useRouter } from "vue-router";
import { useBlogPostsStore } from "@/stores/blogPosts";
import type { PostIndex } from "@/types/interfaces";
import { getBlogPostNavigation } from "@/composables/useBlogPostNavigation";
import { useBlogPostPageState } from "@/composables/useBlogPostPageState";

/** ブログ詳細ページのルートパラメータ */
interface Props {
  section: string;
  id: string;
}

const props = defineProps<Props>();

const router = useRouter();

/** ブログのストア情報取得 */
const blogPostsStore = useBlogPostsStore();

const { createBlogPostRoute, loadPost, postHtml } =
  useBlogPostPageState(blogPostsStore);

/** データ取得中フラグ */
const isLoading = computed((): boolean => {
  return blogPostsStore.getLoading;
});

/** エラーメッセージ */
const errorMessage = computed((): string => {
  return blogPostsStore.getErrorMessage;
});

/** ブログ記事一覧ページに戻る。 */
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

/** 表示中の記事メタ情報 */
const currentPost = computed((): PostIndex | null => {
  return (
    posts.value.find(
      (post) => post.id === props.id && post.section === props.section
    ) ?? null
  );
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
  router.push(createBlogPostRoute(post));
};

/** 初期表示時に記事本文を読み込む。 */
onBeforeMount(async () => {
  await loadPost(props.section, props.id);
});

/** 詳細ページ間の遷移時に記事本文を読み直す。 */
onBeforeRouteUpdate(async (to) => {
  await loadPost(String(to.params.section), String(to.params.id));
});

onUnmounted(() => {
  blogPostsStore.$reset();
});
</script>
<template>
  <AppStateMessage
    v-if="!isLoading && errorMessage"
    type="error"
    title="記事を表示できません"
    :message="errorMessage"
  />
  <v-container v-else class="blog-post">
    <article class="article-shell">
      <header v-if="currentPost" class="article-header">
        <p class="article-eyebrow">DEVELOPMENT NOTE</p>
        <h1>{{ currentPost.title }}</h1>
        <div class="article-meta">
          <time :datetime="currentPost.date">
            <v-icon size="small" aria-hidden="true">mdi-calendar-blank-outline</v-icon>
            {{ currentPost.date }}
          </time>
          <span class="article-section">{{ currentPost.section }}</span>
          <span
            v-for="tag in currentPost.tags"
            :key="tag"
            class="article-tag"
          >
            {{ tag }}
          </span>
        </div>
        <p class="article-description">{{ currentPost.description }}</p>
      </header>

      <div class="markdown-body" v-html="postHtml" />

      <nav class="post-navigation" aria-label="前後の記事">
        <v-btn
          v-if="prevPost"
          class="post-navigation__button"
          variant="outlined"
          @click="goPost(prevPost)"
        >
          <span class="post-navigation__content">
            <span class="post-navigation__label">← 前の記事</span>
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
            <span class="post-navigation__label">次の記事 →</span>
            <span class="post-navigation__title">{{ nextPost.title }}</span>
          </span>
        </v-btn>
      </nav>
      <div class="post-actions">
        <v-btn
          variant="text"
          prepend-icon="mdi-format-list-bulleted"
          @click="goBlogList()"
        >
          記事一覧に戻る
        </v-btn>
      </div>
    </article>
  </v-container>
  <Loading :isLoading="isLoading" />
</template>
<style scoped>
.blog-post {
  color: var(--app-text);
  max-width: 960px;
  padding: 28px 20px 40px;
}

.article-shell {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 14px;
  box-shadow: var(--app-shadow);
  margin: 0 auto;
  padding: 48px 56px 32px;
}

.article-header,
.markdown-body,
.post-navigation,
.post-actions {
  margin-left: auto;
  margin-right: auto;
  max-width: 800px;
}

.article-header {
  border-bottom: 1px solid var(--app-border);
  margin-bottom: 36px;
  padding-bottom: 28px;
}

.article-eyebrow {
  color: #6741d9;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  margin: 0 0 12px;
}

.article-header h1 {
  color: var(--app-text);
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.35;
  margin: 0 0 18px;
}

.article-meta {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.article-meta time {
  align-items: center;
  color: var(--app-text-muted);
  display: inline-flex;
  font-size: 0.86rem;
  gap: 5px;
  margin-right: 4px;
}

.article-section,
.article-tag {
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1;
  padding: 7px 10px;
}

.article-section {
  background: #6741d9;
  color: #ffffff;
  text-transform: uppercase;
}

.article-tag {
  background: rgba(103, 65, 217, 0.1);
  color: #5f3dc4;
}

.article-description {
  color: var(--app-text-muted);
  font-size: 0.98rem;
  line-height: 1.75;
  margin: 18px 0 0;
}

/* 記事タイトルはメタ情報付きヘッダーへ表示する。 */
.markdown-body :deep(h1:first-child) {
  display: none;
}

.post-navigation {
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid var(--app-border);
}

.post-navigation__button {
  flex: 1 1 0;
  max-width: 380px;
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
  color: var(--app-text-muted);
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
  margin-top: 18px;
  text-align: center;
}

/* NOTE: VuetifyのCSS Resetで崩れる記事要素を読み物向けに調整する。 */
.markdown-body :deep(hr) {
  border: 0;
  border-top: 1px solid var(--app-border);
  margin: 36px 0;
}

.markdown-body :deep(p) {
  font-size: 1rem;
  line-height: 1.9;
  margin: 0 0 1.35em;
}

.markdown-body :deep(h2) {
  border-bottom: 1px solid var(--app-border);
  font-size: 1.65rem;
  line-height: 1.45;
  margin: 48px 0 20px;
  padding-bottom: 10px;
}

.markdown-body :deep(h3) {
  font-size: 1.3rem;
  line-height: 1.5;
  margin: 36px 0 16px;
}

.markdown-body :deep(h4),
.markdown-body :deep(h5),
.markdown-body :deep(h6) {
  margin: 28px 0 12px;
}

.markdown-body :deep(blockquote) {
  background: var(--app-surface-muted);
  border-left: 4px solid #7c5ce0;
  border-radius: 0 8px 8px 0;
  color: var(--app-text-muted);
  margin: 24px 0;
  padding: 16px 20px;
}

.markdown-body :deep(blockquote p:last-child) {
  margin-bottom: 0;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  line-height: 1.85;
  margin: 0 0 1.35em;
  padding-left: 1.7em;
}

.markdown-body :deep(ul ul),
.markdown-body :deep(ol ul),
.markdown-body :deep(ul ol),
.markdown-body :deep(ol ol) {
  margin-bottom: 0;
}

.markdown-body :deep(a) {
  color: #5f3dc4;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}

.markdown-body :deep(code) {
  background-color: var(--app-code-bg);
  border-radius: 4px;
  color: #d6336c;
  font-family: Consolas, Monaco, "SFMono-Regular", monospace;
  font-size: 0.9em;
  padding: 0.18em 0.4em;
}

.markdown-body :deep(pre) {
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 10px;
  color: #e6edf3;
  margin: 20px 0 28px;
  overflow-x: auto;
  padding: 18px 20px;
  tab-size: 2;
  word-break: normal;
}

.markdown-body :deep(pre code) {
  background: transparent;
  border-radius: 0;
  color: inherit;
  font-size: 0.9rem;
  line-height: 1.7;
  padding: 0;
  white-space: pre;
}

.markdown-body :deep(table) {
  border-collapse: collapse;
  display: block;
  margin: 24px 0 28px;
  overflow-x: auto;
  width: 100%;
}

.markdown-body :deep(th) {
  background: var(--app-surface-muted);
  border-bottom: 2px solid var(--app-border);
  padding: 10px 12px;
  text-align: left;
  white-space: nowrap;
}

.markdown-body :deep(tr:nth-child(odd) > td) {
  background-color: var(--app-row-alt-bg);
}

.markdown-body :deep(td) {
  border-top: 1px solid var(--app-border);
  padding: 10px 12px;
}

.markdown-body :deep(img) {
  border: 1px solid var(--app-border);
  border-radius: 10px;
  display: block;
  height: auto;
  margin: 28px auto;
  max-width: 100%;
}

:global(.app-shell--dark) .article-tag {
  background: rgba(185, 162, 255, 0.15);
  color: #cbbcff;
}

:global(.app-shell--dark) .article-eyebrow,
:global(.app-shell--dark) .markdown-body :deep(a) {
  color: #b9a2ff;
}

@media (max-width: 600px) {
  .blog-post {
    padding: 12px 8px 24px;
  }

  .article-shell {
    border-radius: 10px;
    padding: 28px 18px 22px;
  }

  .article-header {
    margin-bottom: 28px;
    padding-bottom: 22px;
  }

  .article-header h1 {
    font-size: 1.8rem;
  }

  .markdown-body :deep(p) {
    font-size: 0.96rem;
    line-height: 1.8;
  }

  .markdown-body :deep(h2) {
    font-size: 1.4rem;
    margin-top: 40px;
  }

  .markdown-body :deep(h3) {
    font-size: 1.2rem;
    margin-top: 30px;
  }

  .markdown-body :deep(pre) {
    border-radius: 8px;
    margin-left: -8px;
    margin-right: -8px;
    padding: 15px 16px;
  }

  .post-navigation {
    flex-direction: column;
  }

  .post-navigation__button {
    max-width: none;
  }

  .post-navigation__button--next {
    margin-left: 0;
  }

  .post-navigation__content--next {
    align-items: flex-start;
  }
}
</style>
