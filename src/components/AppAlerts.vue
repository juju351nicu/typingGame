<script setup lang="ts">
import { computed } from "vue";
import UAlert from "@nuxt/ui/components/Alert.vue";
import Const from "@/constants/const";
import type { Alert } from "@/types/interfaces";
import { useAppAlertVisibility } from "@/composables/useAppAlertVisibility";

interface Props {
  /** 画面上部に表示するアラート一覧 */
  alerts: Alert[];
}

const props = defineProps<Props>();

/** メッセージ情報 */
const alerts = computed((): Alert[] => {
  return props.alerts;
});

const { visibleAlerts, hideAlert, getTopStyle } = useAppAlertVisibility(alerts);

/**
 * アラート種別に応じたNuxt UIの色名を取得する。
 *
 * @param type アラート種別
 * @returns Nuxt UIの色名。未指定の場合はinfo
 */
const getAlertColor = (type: Alert["type"]): NonNullable<Alert["type"]> => {
  return type ?? Const.ALERT_TYPE.INFO;
};
</script>
<template>
  <div
    v-for="(alert, index) in alerts"
    :key="alert.id ?? `${alert.type}-${index}`"
  >
    <div class="flex justify-end">
      <UAlert
        v-if="visibleAlerts[index]"
        :style="getTopStyle(index)"
        :color="getAlertColor(alert.type)"
        :icon="Const.ALERT_ICON[getAlertColor(alert.type)]"
        variant="solid"
        class="alert"
        :class="{ 'alert--error': alert.type === Const.ALERT_TYPE.ERROR }"
        close
        role="alert"
        aria-live="assertive"
        @update:open="hideAlert(index)"
      >
        <template #description>
          {{ alert.message }}
        </template>
      </UAlert>
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

/*
 * 左端を画面中央に置くと、幅500pxのアラートは画面幅1000px未満で右にはみ出す。
 * その幅では画面の中央にそろえる。
 */
@media (max-width: 999px) {
  .alert {
    left: 0;
    margin-left: auto;
    margin-right: auto;
    right: 0;
  }
}

/* 共通アラートのエラーは、テーマのerror色より明るい赤で表示する。 */
.alert--error {
  background-color: #f44336;
}
</style>
