import { createRouter, createWebHistory } from "vue-router";
import DashBoard from "../views/DashBoard.vue";
import NotFound from "../views/NotFound.vue";
const routes = [
  { path: "/", name: "DashBoard", component: DashBoard },
  {
    /** 存在しないURLにアクセスした場合 */
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFound,
  },
];

const router = createRouter({
  // Viteの環境変数でimport.meta.env.BASE_URL = vite.config.tsのbase
  history: createWebHistory(),
  routes,
});

export default router;
