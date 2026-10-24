<script setup lang="ts">
import { computed } from "vue";
import UButton from "@nuxt/ui/components/Button.vue";
import UIcon from "@nuxt/ui/components/Icon.vue";
import UPagination from "@nuxt/ui/components/Pagination.vue";
import { useBlogPagingState } from "@/composables/useBlogPagingState";
import type { PostIndex } from "@/types/interfaces";

interface Props {
  /** 現在ページに表示する記事一覧 */
  pageStatus: PostIndex[];
  /** 記事の総件数 */
  pageCounts: number;
  /** 表示中のページ番号 */
  currentPage: number;
}

interface Emits {
  (event: "doPostDetail", section: string, id: string): void;
  (event: "toNumberPage", pageNumber: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

/** 記事の一覧情報 */
const pageStatus = computed(() => {
  return props.pageStatus;
});
/** 総件数 */
const totalCount = computed((): number => {
  return props.pageCounts;
});
/** 最初のページ */
const currentPage = computed((): number => {
  return props.currentPage;
});

const { listHeader, showPaging, totalPages } = useBlogPagingState(
  pageStatus,
  totalCount,
  currentPage
);
/** 選択された記事の詳細ページ表示を親へ通知する */
const doPostDetail = (entry: { section: string; id: string }): void => {
  emit("doPostDetail", entry.section, entry.id);
};

/** ページ番号の変更を親へ通知する */
const toNumberPage = (pageNumber: number) => {
  emit("toNumberPage", pageNumber);
};
</script>
<template>
  <div class="app-container app-container--fluid blog-list">
    <header class="blog-list__hero">
      <p class="blog-list__eyebrow">DEVELOPMENT BLOG</p>
      <h1>開発ノート</h1>
      <p>
        タイピングゲームの実装で起きた問題と、調査・改善の過程を記録しています。
      </p>
    </header>
    <p class="blog-list__header">{{ listHeader }}</p>
    <div class="blog-list__items">
      <div v-for="entry in pageStatus" :key="entry.id" class="blog-list__col">
        <div
          class="blog-card"
          role="link"
          tabindex="0"
          @click="doPostDetail(entry)"
          @keydown.enter.prevent="doPostDetail(entry)"
        >
          <div class="blog-card__item">
            <div class="blog-card__title">
              {{ entry.title }}
            </div>
            <div class="blog-card__date">
              <UIcon
                name="i-lucide-calendar"
                class="blog-card__date-icon"
                aria-hidden="true"
              />
              {{ entry.date }}
            </div>
          </div>
          <!-- 記事（POST)イントロダクション -->
          <div class="blog-card__description">
            {{ entry.description }}
            <div v-if="entry.tags?.length" class="blog-card__tags">
              <span v-for="tag in entry.tags" :key="tag">{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-if="totalCount > 0">
    <div v-if="showPaging && totalCount > 0">
      <nav class="blog-pagination" aria-label="ページ送り">
        <UPagination
          :page="currentPage"
          :total="totalPages"
          :items-per-page="1"
          :sibling-count="1"
          :show-controls="false"
          :ui="{ list: 'blog-pagination__list' }"
          @update:page="toNumberPage"
        >
          <template #prev>
            <UButton
              class="blog-pagination__button"
              color="neutral"
              variant="ghost"
              icon="i-lucide-chevron-left"
            />
          </template>
          <template #item="{ item, page }">
            <!-- #itemスロットはページ番号の項目だけで呼ばれる -->
            <UButton
              class="blog-pagination__button"
              :class="{
                'blog-pagination__button--active':
                  item.type === 'page' && item.value === page,
              }"
              color="neutral"
              variant="ghost"
            >
              {{ item.type === "page" ? item.value : "" }}
            </UButton>
          </template>
          <template #next>
            <UButton
              class="blog-pagination__button"
              color="neutral"
              variant="ghost"
              icon="i-lucide-chevron-right"
            />
          </template>
        </UPagination>
      </nav>
    </div>
  </div>
</template>
<style scoped>
.blog-list {
  padding: 32px 16px 20px;
}

.blog-list__hero {
  margin: 0 auto 28px;
  max-width: 800px;
}

.blog-list__eyebrow {
  color: #6741d9;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  margin: 0 0 8px;
}

.blog-list__hero h1 {
  color: var(--app-text);
  font-size: clamp(2.3rem, 5vw, 3.2rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.2;
  margin: 0;
}

.blog-list__hero > p:last-child {
  color: var(--app-text-muted);
  font-size: 1rem;
  line-height: 1.7;
  margin: 10px 0 0;
}

.blog-list__header {
  max-width: 800px;
  margin: 0 auto 12px;
  color: var(--app-text-muted);
  font-size: 0.95rem;
}

/* 従来の一覧と同じ余白で並べる。 */
.blog-list__items {
  display: flex;
  flex: 1 1 auto;
  flex-wrap: wrap;
  margin: -4px;
  row-gap: 8px;
}

.blog-list__col {
  flex: 0 0 100%;
  max-width: 100%;
  padding: 4px;
  width: 100%;
}

.blog-card {
  background: var(--app-card-bg);
  color: var(--app-card-text);
  display: block;
  margin-left: auto;
  margin-right: auto;
  max-width: 800px;
  overflow: hidden;
  outline: none;
  position: relative;
  border: 1px solid var(--app-border);
  border-radius: 12px;
  box-shadow: var(--app-shadow);
  cursor: pointer;
  transition:
    border-color 160ms ease,
    transform 160ms ease;
}

.blog-card:hover,
.blog-card:focus-visible {
  border-color: rgba(103, 65, 217, 0.45);
  transform: translateY(-2px);
}

.blog-card__item {
  padding: 0.625rem 1rem;
}

.blog-card__title {
  font-size: 1.25rem;
  font-weight: 500;
  hyphens: auto;
  letter-spacing: 0.0125em;
  overflow-wrap: normal;
  word-break: normal;
  color: var(--app-text);
  line-height: 2rem;
  white-space: normal;
}

.blog-card__date {
  font-size: 0.875rem;
  font-weight: 400;
  letter-spacing: 0.0178571429em;
  line-height: 1.425;
  opacity: 0.6;
  margin-top: 4px;
  padding-bottom: 4px;
  align-items: center;
  color: var(--app-text-muted);
  display: flex;
  gap: 4px;
  justify-content: flex-end;
  text-align: right;
}

.blog-card__date-icon {
  height: 14px;
  width: 14px;
}

.blog-card__description {
  flex: 1 1 auto;
  font-size: 0.875rem;
  font-weight: 400;
  letter-spacing: 0.0178571429em;
  padding: 1rem;
  padding-top: 0;
  text-transform: none;
  color: var(--app-text-muted);
  line-height: 1.425;
}

.blog-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 14px;
}

.blog-card__tags span {
  background: rgba(103, 65, 217, 0.1);
  border-radius: 999px;
  color: #5f3dc4;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 5px 9px;
}

.blog-pagination {
  text-align: center;
}

.blog-pagination :deep(.blog-pagination__list) {
  align-items: center;
  display: inline-flex;
  gap: 0;
  justify-content: center;
  list-style: none;
  margin: 0;
}

.blog-pagination__button {
  border-radius: 4px;
  color: #283593;
  font-size: 1rem;
  height: 48px;
  justify-content: center;
  letter-spacing: normal;
  margin: 0.3rem;
  min-width: 48px;
  padding: 0;
  text-indent: 0;
  width: 48px;
}

.blog-pagination__button :deep(svg) {
  height: 24px;
  margin: 0;
  width: 24px;
}

.blog-pagination__button:disabled {
  opacity: 0.38;
}

.blog-pagination__button--active {
  background: rgba(40, 53, 147, 0.12);
}

:root.dark .blog-card__date {
  opacity: 0.7;
}

.app-shell--dark .blog-list__eyebrow,
.app-shell--dark .blog-card__tags span {
  color: #b9a2ff;
}

.app-shell--dark .blog-card__tags span {
  background: rgba(185, 162, 255, 0.15);
}

@media (max-width: 600px) {
  .blog-list {
    padding: 12px;
  }

  .blog-list__hero {
    margin-bottom: 20px;
  }
}
</style>
