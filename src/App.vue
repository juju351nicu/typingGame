<script setup lang="js">
import SideMenu from "@/components/SideMenu.vue";
</script>
<template>
  <v-app>
    <v-main>
      <SideMenu />
      <router-view />
    </v-main>
  </v-app>
</template>
