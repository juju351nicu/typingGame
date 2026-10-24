<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
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
  <div class="app-container">
    <h1>404: Not Found</h1>
    <p>ページが見つかりません。</p>
    <UButton class="mt-2" color="success" size="lg" @click="goGamePage">
      トップページに戻る
    </UButton>
  </div>
</template>
