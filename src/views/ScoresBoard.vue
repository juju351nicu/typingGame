<script setup lang="ts">
import { useGameScoresStore } from "@/stores/gameScores";
import { ref, onMounted } from "vue";
import Const from "@/constants/const";
import Util from "@/utils/util";
import { GameScore } from "@/types/interfaces";
//インポートした関数を呼び出してストアをインスタンス化して変数に代入
const gameScoresStore = useGameScoresStore();
/** data-tableの1ページあたりの表示件数（デフォルト）*/
const itemsPerPage = ref(Const.NUMBER_OF_ITEMS);
/** data-tableの表示件数の選択リスト */
const pages = Const.DATA_TABLE_PAGES;
/** テーブルの関連するラベル・プロパティ等の情報 */
const headers = Const.OPTIONS_OF_HEADERS;

/** スコアのスコアを日付降順に取得する */
const reverseGameScoresByDate = (gameScores: GameScore[]) => {
  return gameScores.sort((a, b) => b.date.localeCompare(a.date));
};

const items = ref<GameScore[]>([]);
/** 現在のゲーム難易度に該当するゲームスコアリストを取得する */
onMounted(() => {
  items.value = reverseGameScoresByDate(gameScoresStore.getGameScoreList);
});
</script>
<template>
  <v-container>
    <p class="text-h3">スコア表</p>
    <v-data-table
      v-model:items-per-page="itemsPerPage"
      :headers="headers"
      :items="items"
      :items-per-page-options="pages"
      items-per-page-text="表示行数"
      class="elevation-1"
    >
      <template v-slot:item.mode="{ value }">
        <v-chip :color="Util.getColor(value)">
          {{ Util.getLevel(value) }}
        </v-chip>
      </template>
    </v-data-table>
  </v-container>
</template>
