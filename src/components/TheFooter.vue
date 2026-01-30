<script setup lang="ts">
import type { copyRight, PrivacyPolicy } from '@/types/interfaces';
const copyRight : copyRight = {
    title: "2026 CLIP All rights reserved.",
    icon: "©",
    dateStr: new Date().toDateString().slice(-4),
};
const privacyPolicy: PrivacyPolicy = { title: "プライバシーポリシー", link: "#" };
</script>
<template>
    <v-footer class="d-flex align-center justify-center footer" color="deep-purple" dark>
        <router-link :to="'/'" class="text-reset">
            <p class="m-0 p-0">{{ copyRight.title }}</p>
        </router-link>
        <br />
        <p class="m-0 p-0">
            Created with ❤️ by
            <a href="https://github.com/yeikiu/" target="_blank" class="text-reset">JQ</a> ©
            {{ copyRight.dateStr }}
        </p>
        <ul class="footer__list">
            <li><a href="#" class="footer__link">{{ privacyPolicy.title }}</a></li>
        </ul>
    </v-footer>
</template>
<style scoped>
.footer{
    max-height: 60px;
}
a {
    text-decoration: none;
    color: black;
}
</style>