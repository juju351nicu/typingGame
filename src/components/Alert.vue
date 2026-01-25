<script setup lang="js">
import { ref, computed } from 'vue';

const props = defineProps({
    message: String,
    type: String
});

/** メッセージ情報 */
const message = computed(() => {
    return props.message;
});

const alertFlag = ref(true);

setTimeout(() => {
    alertFlag.value = false
}, 4000);
</script>
<template>
    <v-alert v-model="alertFlag" :type=type dense class="alert" closable>
        {{ message }}
    </v-alert>
</template>
<style scoped>
.alert {
    position: fixed;
    top: 16px;
    left: 50%;
    width: 90%;
    max-width: 500px;
    z-index: 9999;
}
.bg-error {
    background-color: #F44336 !important
}
</style>