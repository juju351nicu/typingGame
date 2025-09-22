<template>
    <SideMenu />
    <v-container>
        <p class="text-h3">DataTable</p>
        <v-data-table v-model:items-per-page="itemsPerPage" :headers="headers" :items="items"
            :items-per-page-options="pages" items-per-page-text="表示行数" class="elevation-1"></v-data-table>
    </v-container>
</template>

<script setup>
import SideMenu from "@/components/SideMenu.vue";
import { useGameScoresStore } from "@/stores/gameScores";
import { ref, onMounted } from "vue";

//インポートした関数を呼び出してストアをインスタンス化して変数に代入
const gameScoresStore = useGameScoresStore(); //setup() 内で useXxxxStore() を実行

const itemsPerPage = ref(5);

const pages = ref([
    { value: 5, title: '5' },
    { value: 10, title: '10' },
    { value: 20, title: '20' },
    { value: -1, title: '$vuetify.dataFooter.itemsPerPageAll' }
]);

const headers = ref([
    { title: 'ゲームの難易度', align: 'start', key: 'mode' },
    { title: 'タイム', align: 'start', key: 'time' },
    { title: 'スコア', align: 'end', key: 'score' },
    { title: '日付', align: 'end', key: 'date' },
]);

const items = ref([]);
/** 現在のゲーム難易度に該当するゲームスコアリストを取得する */
onMounted(() => {
    items.value = gameScoresStore.getGameScoreList;
});
</script>