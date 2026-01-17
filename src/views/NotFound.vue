<script setup lang="js">
import { useRouter } from "vue-router";
const router = useRouter();
/**
 * トップページに戻る
 */
const goDashBoard = () => {
    router.push({ name: "DashBoard" });
};
</script>
<template>
    <h1>404: Not Found</h1>
    <p>ページが見つかりません。</p>
    <v-btn class="mt-2" color="success" @click="goDashBoard" size="large" width="150px">
        &laquo; トップページに戻る
    </v-btn>
</template>
