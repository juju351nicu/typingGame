<script setup lang="ts">
import { computed } from "vue";
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
</script>
<template>
  <div
    v-for="(alert, index) in alerts"
    :key="alert.id ?? `${alert.type}-${index}`"
  >
    <div class="d-flex justify-end">
      <v-alert
        v-if="visibleAlerts[index]"
        :style="getTopStyle(index)"
        :type="alert.type"
        dense
        class="alert"
        closable
        role="alert"
        aria-live="assertive"
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
