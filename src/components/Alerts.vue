<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Alert } from '@/interfaces';

/** Propsインタフェース定義 */
interface Props {
    alerts: Alert[];
}
const props = defineProps<Props>();

/** メッセージ情報 */
const alerts = computed(() => {
    return props.alerts;
});

const alertFlag = ref(true);

setTimeout(() => {
    alertFlag.value = false
}, 4000);
</script>
<template>
    <div v-for="(alert, index) in alerts" :key="index">
        <div class="d-flex justify-end">
            <v-alert v-model="alertFlag" :style="{ top: `${90 * index}px` }" :type=alert.type dense class="alert"
                closable>
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
    background-color: #F44336 !important
}
</style>