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
    <p class="blog-list__header">{{ listHeader }}</p>
    <v-row dense class="blog-list__items">
      <v-col v-for="entry in pageStatus" :key="entry.id" cols="12">
        <v-card
          class="blog-card mx-auto"
          max-width="800"
          hover
          @click="doPostDetail(entry)"
        >
          <v-card-item>
            <v-card-title class="blog-card__title">
              {{ entry.title }}
            </v-card-title>
            <v-card-subtitle class="blog-card__date">
              {{ entry.date }}
            </v-card-subtitle>
          </v-card-item>
          <!-- 記事（POST)イントロダクション -->
          <v-card-text class="blog-card__description">
            {{ entry.description }}
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
  padding-top: 16px;
}

.blog-list__header {
  max-width: 800px;
  margin: 0 auto 12px;
  color: #424242;
  font-size: 0.95rem;
}

.blog-list__items {
  row-gap: 8px;
}

.blog-card {
  cursor: pointer;
}

.blog-card__title {
  color: #212121;
  line-height: 1.4;
  white-space: normal;
}

.blog-card__date {
  margin-top: 4px;
  color: #757575;
  text-align: right;
}

.blog-card__description {
  color: #37474f;
  line-height: 1.65;
}

@media (max-width: 600px) {
  .blog-list {
    padding: 12px;
  }
}
</style>
