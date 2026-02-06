<script setup lang="ts">
import SideMenu from "@/components/SideMenu.vue";
import { ref } from "vue";

/** メニュータイトル */
const title = "タイピングゲーム";

/** サイドメニューフラグ */
const drawer = ref(false);
</script>
<template>
    <v-app-bar color="deep-purple" dark>
        <v-app-bar-nav-icon variant="text" @click="drawer = !drawer"></v-app-bar-nav-icon>
        <v-toolbar-title>{{ title }}</v-toolbar-title>
        <v-spacer />
        <div class="d-flex justify-end">
            <span class="mr-10">当サイトについて</span>
            <span class="mr-10">ブログ</span>
        </div>
    </v-app-bar>
    <SideMenu v-model:drawer="drawer" />
</template>
