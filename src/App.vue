<script setup lang="ts">
import TheHeader from "@/components/TheHeader.vue";
import TheFooter from "@/components/TheFooter.vue";
</script>
<template>
  <v-app>
    <v-main>
      <TheHeader />
      <router-view />
    </v-main>
    <TheFooter />
  </v-app>
</template>
