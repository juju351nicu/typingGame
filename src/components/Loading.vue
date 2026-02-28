<script setup lang="ts">
import { computed } from 'vue'
/** Propsインタフェース定義 */
interface Props {
  isLoading: boolean;
}

/** Propsオブジェクトの設定 */
const props = defineProps<Props>();

/** データ取得中フラグ */
const isLoading = computed((): boolean => {
  return props.isLoading;
});
</script>
<template>
  <div class="text-center">
    <v-overlay class="align-center justify-center" :model-value="isLoading" :opacity="0.8">
      <v-progress-circular :size="70" :width="8" color="deep-purple" indeterminate></v-progress-circular>
    </v-overlay>
  </div>
</template>
<style scoped>
.v-progress-circular {
  margin: 1rem;
}
</style>