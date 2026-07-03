<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import type { Alert } from "@/types/interfaces";

/** Propsインタフェース定義 */
interface Props {
  alerts: Alert[];
}

/** Propsオブジェクトの設定 */
const props = defineProps<Props>();

/** メッセージ情報 */
const alerts = computed((): Alert[] => {
  return props.alerts;
});

/** アラートを自動で非表示にするまでの時間 */
const AUTO_HIDE_DELAY_MS = 4000;

/** アラートごとの表示状態 */
const visibleAlerts = ref<boolean[]>([]);

/** 自動非表示タイマー */
const hideTimerIds = ref<ReturnType<typeof setTimeout>[]>([]);

/**
 * 指定したアラートを非表示にする
 * @param index 非表示にするアラートのインデックス
 */
const hideAlert = (index: number): void => {
  visibleAlerts.value[index] = false;
};

/**
 * 指定したアラートを一定時間後に非表示にする
 * @param index 非表示タイマーを設定するアラートのインデックス
 */
const scheduleHideAlert = (index: number): void => {
  const timerId = setTimeout((): void => {
    hideAlert(index);
  }, AUTO_HIDE_DELAY_MS);
  hideTimerIds.value.push(timerId);
};

watch(
  () => props.alerts.length,
  (newLength, oldLength = 0) => {
    visibleAlerts.value = visibleAlerts.value.slice(0, newLength);

    for (let index = oldLength; index < newLength; index++) {
      visibleAlerts.value[index] = true;
      scheduleHideAlert(index);
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  hideTimerIds.value.forEach((timerId) => clearTimeout(timerId));
  hideTimerIds.value = [];
});

/**
 * アラートの高さを調整する
 * @param index インデックス
 */
const getTopStyle = (index: number) => {
  const topPosition = index * 90;
  return { top: `${topPosition}px` };
};
</script>
<template>
  <div v-for="(alert, index) in alerts" :key="`${alert.type}-${index}`">
    <div class="d-flex justify-end">
      <v-alert
        v-if="visibleAlerts[index]"
        :style="getTopStyle(index)"
        :type="alert.type"
        dense
        class="alert"
        closable
        @click:close="hideAlert(index)"
      >
        {{ alert.message }}
      </v-alert>
    </div>
  </div>
</template>
<style scoped>
.alert {
  position: fixed;
  margin-top: 16px;
  left: 50%;
  width: 90%;
  max-width: 500px;
  z-index: 9999;
}

.bg-error {
  background-color: #f44336 !important;
}
</style>
