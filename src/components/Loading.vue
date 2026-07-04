<script setup lang="ts">
interface Props {
  /** ローディングオーバーレイを表示するか */
  isLoading: boolean;
}

const props = defineProps<Props>();
</script>
<template>
  <div class="text-center">
    <v-overlay
      class="align-center justify-center"
      :model-value="props.isLoading"
      :opacity="0.8"
    >
      <v-progress-circular
        :size="70"
        :width="8"
        color="deep-purple"
        indeterminate
      ></v-progress-circular>
    </v-overlay>
  </div>
</template>
<style scoped>
.v-progress-circular {
  margin: 1rem;
}
</style>
