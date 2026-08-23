<script setup lang="ts">
import { computed } from "vue";
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
  <v-container fluid class="blog-list">
    <header class="blog-list__hero">
      <p class="blog-list__eyebrow">DEVELOPMENT BLOG</p>
      <h1>開発ノート</h1>
      <p>
        タイピングゲームの実装で起きた問題と、調査・改善の過程を記録しています。
      </p>
    </header>
    <p class="blog-list__header">{{ listHeader }}</p>
    <v-row dense class="blog-list__items">
      <v-col v-for="entry in pageStatus" :key="entry.id" cols="12">
        <v-card
          class="blog-card mx-auto"
          max-width="800"
          hover
          role="link"
          tabindex="0"
          @click="doPostDetail(entry)"
          @keydown.enter.prevent="doPostDetail(entry)"
        >
          <v-card-item>
            <v-card-title class="blog-card__title">
              {{ entry.title }}
            </v-card-title>
            <v-card-subtitle class="blog-card__date">
              <v-icon size="x-small" aria-hidden="true">
                mdi-calendar-blank-outline
              </v-icon>
              {{ entry.date }}
            </v-card-subtitle>
          </v-card-item>
          <!-- 記事（POST)イントロダクション -->
          <v-card-text class="blog-card__description">
            {{ entry.description }}
            <div v-if="entry.tags?.length" class="blog-card__tags">
              <span v-for="tag in entry.tags" :key="tag">{{ tag }}</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
  <div v-if="totalCount > 0">
    <div v-if="showPaging && totalCount > 0">
      <div class="text-center">
        <v-pagination
          :model-value="currentPage"
          :length="totalPages"
          color="indigo-darken-3"
          @update:model-value="toNumberPage"
        ></v-pagination>
      </div>
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

.blog-list__items {
  row-gap: 8px;
}

.blog-card {
  border: 1px solid var(--app-border);
  border-radius: 12px;
  box-shadow: var(--app-shadow);
  cursor: pointer;
  transition: border-color 160ms ease, transform 160ms ease;
}

.blog-card:hover,
.blog-card:focus-visible {
  border-color: rgba(103, 65, 217, 0.45);
  transform: translateY(-2px);
}

.blog-card__title {
  color: var(--app-text);
  line-height: 1.4;
  white-space: normal;
}

.blog-card__date {
  margin-top: 4px;
  align-items: center;
  color: var(--app-text-muted);
  display: flex;
  gap: 4px;
  justify-content: flex-end;
  text-align: right;
}

.blog-card__description {
  color: var(--app-text-muted);
  line-height: 1.65;
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

:global(.app-shell--dark) .blog-list__eyebrow,
:global(.app-shell--dark) .blog-card__tags span {
  color: #b9a2ff;
}

:global(.app-shell--dark) .blog-card__tags span {
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
