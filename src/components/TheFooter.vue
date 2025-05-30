<template>
    <v-footer class="d-flex align-center justify-center">
        <router-link :to="'/'" class="text-reset">
            <p class="m-0 p-0">{{ copyRight.title }}</p>
        </router-link>
        <br />
        <p class="m-0 p-0">
            Created with ❤️ by
            <a href="https://github.com/yeikiu/" target="_blank" class="text-reset">JQ</a> ©
            {{ copyRight.date }}
        </p>
        <ul class="footer__list">
            <li><a href="#" class="footer__link">{{ inquiry.title }}</a></li>
            <li><a href="#" class="footer__link">{{ privacyPolicy.title }}</a></li>
        </ul>
    </v-footer>
</template>

<script setup>
import { reactive } from "vue";

const copyRight = reactive({
    title: "2025 CLIP All rights reserved.",
    icon: "©",
    date: new Date().toDateString().slice(-4),
});
const inquiry = reactive({ title: "プライバシーポリシー", link: "#" });
const privacyPolicy = reactive({ title: "お問い合わせ", link: "#" });
</script>