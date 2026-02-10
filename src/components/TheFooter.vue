<script setup lang="ts">
import type { copyRight, PrivacyPolicy } from '@/types/interfaces';
const copyRight: copyRight = {
    title: "CLIP Corporation. All Rights Reserved.",
    icon: "©",
    dateStr: new Date().toDateString().slice(-4),
};
</script>
<template>
    <v-footer class="d-flex align-center justify-center footer" color="deep-purple" dark>
        <p class="m-0 p-0 mr-2">
            {{ copyRight.dateStr }} &copy;
        </p>
        <p class="m-0 p-0 ">{{ copyRight.title }}</p>
    </v-footer>
</template>
<style scoped>
.footer {
    max-height: 60px;
}

a {
    text-decoration: none;
    color: black;
}
</style>