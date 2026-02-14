<script setup lang="ts">
import { computed } from 'vue';
import { BreadcrumbItem } from 'vuetify/lib/components/VBreadcrumbs/VBreadcrumbs';

/** Propsインタフェース定義 */
interface Props {
    items: BreadcrumbItem[];
}

/** Propsオブジェクトの設定 */
const props = defineProps<Props>();

/** メッセージ情報 */
const items = computed((): BreadcrumbItem[] => {
    return props.items;
});
</script>
<template>
    <div>
        <v-breadcrumbs :items="items">
            <template v-slot:divider>
                <v-icon icon="mdi-chevron-right"></v-icon>
            </template>
        </v-breadcrumbs>
    </div>
</template>