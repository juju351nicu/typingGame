<script setup lang="js">
import { useGameScoresStore } from "@/stores/gameScores.js";
import { ref, onMounted } from "vue";
import Const from "@/constants/const.js";

//インポートした関数を呼び出してストアをインスタンス化して変数に代入
const gameScoresStore = useGameScoresStore();
/** data-tableの1ページあたりの表示件数（デフォルト）*/
const itemsPerPage = Const.NUMBER_OF_ITEMS;
/** data-tableの表示件数の選択リスト */
const pages = Const.DATA_TABLE_PAGES;
/** テーブルの関連するラベル・プロパティ等の情報 */
const headers = Const.OPTIONS_OF_HEADERS;

const items = ref([]);
/** 現在のゲーム難易度に該当するゲームスコアリストを取得する */
onMounted(() => {
    items.value = gameScoresStore.getGameScoreList;
});
</script>
<template>
    <v-container>
        <p class="text-h3">スコア表</p>
        <v-data-table v-model:items-per-page="itemsPerPage" :headers="headers" :items="items"
            :items-per-page-options="pages" items-per-page-text="表示行数" class="elevation-1"></v-data-table>
    </v-container>
</template>