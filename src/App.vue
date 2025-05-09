<template>
  <router-view />
</template>

<script>
import { SidebarMenu } from 'vue-sidebar-menu'
import 'vue-sidebar-menu/dist/vue-sidebar-menu.css'
export default {
  name: "App",
  components: {
    SidebarMenu,
  },
};
</script>

