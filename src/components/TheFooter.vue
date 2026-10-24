<script setup lang="ts">
import type { CopyRightType } from "@/types/interfaces";
const copyRight: CopyRightType = {
  company: "CLIP",
  copyRight: "All Rights Reserved.",
  dateStr: new Date().toDateString().slice(-4),
};
</script>
<template>
  <footer class="footer">
    <span class="m-0 p-0 mr-2"> {{ copyRight.dateStr }} &copy; </span>
    <span class="m-0 p-0">{{ copyRight.company }}</span
    >&nbsp;&nbsp;
    <span class="m-0 p-0">{{ copyRight.copyRight }}</span>
  </footer>
</template>
<style scoped>
.footer {
  align-items: center;
  background: #673ab7;
  color: #ffffff;
  display: flex;
  flex: 1 1 auto;
  justify-content: center;
  max-height: 60px;
  padding: 8px 16px;
}

a {
  text-decoration: none;
  color: black;
}
</style>
