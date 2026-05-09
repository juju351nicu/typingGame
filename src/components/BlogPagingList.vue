<script setup lang="ts">
import { computed, ref } from "vue";
import Const from "@/constants/const";
/** Propsインタフェース定義 */
interface Props {
  pageStatus: any;
  pageCounts: number;
  currentPage: number;
}
/** Emitsインタフェース定義 */
interface Emits {
  (event: "doPostDetail", section: string, id: string): void;
  (event: "toNumberPage", pageNumber: number): void;
}
/** Propsインタフェース定義 */
const props = defineProps<Props>();
/** Emitの設定 */
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
const showPaging = ref(true);
/** 総ページ数 */
const totalPages = computed((): number => {
  if (totalCount.value % Const.NUMBER_OF_BLOGS == 0) {
    return totalCount.value / Const.NUMBER_OF_BLOGS;
  } else {
    return Math.ceil(totalCount.value / Const.NUMBER_OF_BLOGS);
  }
});
/**検索結果件数を表示する。前半部 */
const firstRowsCounts = computed(() => {
  const start = (currentPage.value - 1) * Const.NUMBER_OF_BLOGS;
  if (start + 1 < totalCount.value) {
    return start + 1;
  } else {
    return totalCount.value;
  }
});
/**検索結果件数を表示する。後半部 */
const lastRowsCounts = computed(() => {
  const end = currentPage.value * Const.NUMBER_OF_BLOGS;
  if (end < totalCount.value) {
    return end;
  } else {
    return totalCount.value;
  }
});
const listHeader = computed(() => {
  const nowDisplaying =
    props.pageCounts === 0
      ? ""
      : `(${firstRowsCounts.value}件~${lastRowsCounts.value}件を表示)`;
  const total = `検索結果件数: ${totalCount.value}件`;
  return `${total}${nowDisplaying}`;
});
/**
 *
 * @param entry
 */
const doPostDetail = (entry: { section: string; id: string }): void => {
  emit("doPostDetail", entry.section, entry.id);
};
/** ページングの数字ボタン押下時または、ページ番号入力時のイベント */
const toNumberPage = (pageNumber: number) => {
  emit("toNumberPage", pageNumber);
};
</script>
<template>
  <v-container fluid>
    <span>{{ listHeader }}</span>
    <v-row dense>
      <v-col v-for="entry in pageStatus" :key="entry.id" cols="12">
        <v-card class="mx-auto" max-width="800" max-height="160" hover>
          <v-card-item>
            <v-card-title @click="doPostDetail(entry)">
              {{ entry.title }}
            </v-card-title>
            <v-card-subtitle style="text-align: right">
              {{ entry.date }}
            </v-card-subtitle>
          </v-card-item>
          <!-- 記事（POST)イントロダクション -->
          <v-card-text style="color: blue">
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
