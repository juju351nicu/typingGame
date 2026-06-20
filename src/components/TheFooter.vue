<script setup lang="ts">
import type { CopyRightType } from "@/types/interfaces";
const copyRight: CopyRightType = {
  company: "CLIP Corporation.",
  copyRight: "All Rights Reserved.",
  dateStr: new Date().toDateString().slice(-4),
};
</script>
<template>
  <v-footer
    class="d-flex align-center justify-center footer"
    color="deep-purple"
    dark
  >
    <span class="m-0 p-0 mr-2"> {{ copyRight.dateStr }} &copy; </span>
    <span class="m-0 p-0">{{ copyRight.company }}</span
    >&nbsp;&nbsp;
    <span class="m-0 p-0">{{ copyRight.copyRight }}</span>
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
