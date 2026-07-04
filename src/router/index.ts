import { createRouter, createWebHistory } from "vue-router";
import { routeSetting } from "@/router/routes";

const router = createRouter({
  // Viteの環境変数でimport.meta.env.BASE_URL = vite.config.tsのbase
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routeSetting,
});

export default router;
