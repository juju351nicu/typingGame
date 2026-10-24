<script setup lang="ts">
import AppProgressCircular from "@/components/AppProgressCircular.vue";

interface Props {
  /** ローディングオーバーレイを表示するか */
  isLoading: boolean;
}

const props = defineProps<Props>();
</script>
<template>
  <Teleport to="body">
    <Transition name="loading-fade">
      <div
        v-if="props.isLoading"
        class="loading-overlay"
        aria-busy="true"
        aria-live="polite"
      >
        <div class="loading-overlay__scrim" aria-hidden="true" />
        <AppProgressCircular
          class="loading-overlay__progress"
          :size="70"
          :width="8"
          color="#673ab7"
          aria-label="読み込み中"
        />
      </div>
    </Transition>
  </Teleport>
</template>
<style scoped>
.loading-overlay {
  align-items: center;
  display: flex;
  inset: 0;
  justify-content: center;
  position: fixed;
  z-index: 2000;
}

.loading-overlay__scrim {
  background: var(--app-scrim);
  inset: 0;
  opacity: 0.8;
  position: absolute;
}

.loading-overlay__progress {
  margin: 1rem;
}

.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.2s ease-in-out;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}
</style>
