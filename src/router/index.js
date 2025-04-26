import { createRouter, createWebHistory } from "vue-router";
import DashBoard from "../views/DashBoard.vue";
const routes = [{ path: "/", name: "dashBoard", component: DashBoard }];

const router = createRouter({
  // Viteの環境変数でimport.meta.env.BASE_URL = vite.config.tsのbase
  history: createWebHistory(),
  routes,
});

export default router;
