<template>
    <h1>404: Not Found</h1>
    <p>ページが見つかりません。</p>
    <button class="btn" @click="goHome()"> &laquo; トップページに戻る</button>
</template>

<script setup>
import { useRouter } from "vue-router";
const router = useRouter();
/**
 * ブログ記事一覧ページに戻る
 */
const goHome = () => {
    router.push({ name: "DashBoard" });
};
</script>