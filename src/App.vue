<script setup lang="ts">
import SideMenu from "@/components/SideMenu.vue";
import TheFooter from "@/components/TheFooter.vue";
</script>
<template>
  <v-app>
    <v-main>
      <SideMenu />
      <router-view />
    </v-main>
    <TheFooter />
  </v-app>
</template>
