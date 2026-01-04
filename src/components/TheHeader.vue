<script setup lang="js">
const title = "タイピング練習";
</script>
<template>
    <v-app-bar :style="{ height: '80px' }" elevation="0" class="px-4 pt-1">
        <template v-slot:prepend>
            <v-btn color="#55c500" variant="flat">
                <p class="text-white font-weight-bold">{{ title }}</p>
            </v-btn>
        </template>
        <template v-slot:title>
            <v-app-bar-title>{{ title }}</v-app-bar-title>
        </template>
    </v-app-bar>
</template>
