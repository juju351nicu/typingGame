import { createRouter, createWebHistory } from "vue-router";
import Const from "@/constants/const";
import { routeSetting } from "@/router/routes";
import { resolveRouteAccess } from "@/router/guards";
import { useAuthStore } from "@/stores/auth";

const router = createRouter({
  // Viteの環境変数でimport.meta.env.BASE_URL = vite.config.tsのbase
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routeSetting,
});

router.beforeEach((to) => {
  return resolveRouteAccess(to, {
    isBackendApiEnabled: Const.BACKEND_API.ENABLED,
    getAuthStore: useAuthStore,
  });
});

export default router;
