<template>
    <footer class="footer">
        <ul class="footer__list">
            <li><a href="#" class="footer__link">{{ inquiry.title }}</a></li>
            <li><a href="#" class="footer__link">{{ privacyPolicy.title }}</a></li>
        </ul>
        <p class="footer__copyright">{{ copyright.title }}</p>
    </footer>
</template>
<script>
export default {
    name: "TheFooter",
    data() {
        return {
            inquiry: { title: "プライバシーポリシー", link: "#" },
            privacyPolicy: { title: "お問い合わせ", link: "#" },
            copyright: { title: "@ 2025 CLIP All rights reserved." },
        };
    },
};
</script>