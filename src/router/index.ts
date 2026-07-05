import { createRouter, createWebHistory } from "vue-router";
import Const from "@/constants/const";
import { routeSetting } from "@/router/routes";

const router = createRouter({
  // Viteの環境変数でimport.meta.env.BASE_URL = vite.config.tsのbase
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routeSetting,
});

router.beforeEach((to) => {
  if (to.meta.requiresBackendApi && !Const.BACKEND_API.ENABLED) {
    return { name: "GamePage" };
  }

  return true;
});

export default router;
