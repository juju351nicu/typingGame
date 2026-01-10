<script setup lang="js">
const copyRight = {
    title: "2025 CLIP All rights reserved.",
    icon: "©",
    date: new Date().toDateString().slice(-4),
};
const inquiry = { title: "プライバシーポリシー", link: "#" };
const privacyPolicy = { title: "お問い合わせ", link: "#" };
</script>
<template>
    <v-footer class="d-flex align-center justify-center" color="deep-purple" dark>
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
<style scoped>
a {
    text-decoration: none;
    color: black;
}
</style>