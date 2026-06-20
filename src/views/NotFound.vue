<script setup lang="ts">
import { useRouter } from "vue-router";
const router = useRouter();
/**
 * トップページに戻る
 */
const goGamePage = (): void => {
  router.push({ name: "GamePage" });
};
</script>
<template>
  <v-container>
    <h1>404: Not Found</h1>
    <p>ページが見つかりません。</p>
    <v-btn class="mt-2" color="success" @click="goGamePage" size="large">
      トップページに戻る
    </v-btn>
  </v-container>
</template>
