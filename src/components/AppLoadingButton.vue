<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import AppProgressCircular from "@/components/AppProgressCircular.vue";

/*
 * UButtonの loading はスピナーを文字の前に足し、ボタンも無効表示にする。
 * 従来どおり、ボタンの大きさと色はそのままで、文字とアイコンを隠して
 * 中央にスピナーだけを表示するため、loading はUButtonへ渡さずここで描画する。
 */
defineOptions({ inheritAttrs: false });

interface Props {
  /** 処理中かどうか */
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});
</script>
<template>
  <UButton
    v-bind="$attrs"
    class="app-loading-btn"
    :class="{ 'app-loading-btn--loading': props.loading }"
    :aria-busy="props.loading || undefined"
  >
    <span class="app-loading-btn__content"><slot /></span>
    <span v-if="props.loading" class="app-loading-btn__loader">
      <AppProgressCircular :size="32" :width="2" />
    </span>
  </UButton>
</template>
<style scoped>
.app-loading-btn {
  position: relative;
}

.app-loading-btn--loading {
  pointer-events: none;
}

/* 先頭アイコンはUIconが描画するため、scoped属性の付かない要素も対象にする。 */
.app-loading-btn--loading > :deep(:not(.app-loading-btn__loader)) {
  opacity: 0;
}

.app-loading-btn__loader {
  align-items: center;
  display: flex;
  inset: 0;
  justify-content: center;
  position: absolute;
}

.app-loading-btn__loader :deep(.app-progress-circular) {
  height: 1.5em !important;
  width: 1.5em !important;
}
</style>
