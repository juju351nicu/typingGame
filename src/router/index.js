import { createRouter, createWebHistory } from "vue-router";
import DashBoard from "@/views/DashBoard.vue";
import ScoresBoard from "@/views/ScoresBoard.vue";
import SettingBoard from "@/views/SettingBoard.vue";
import NotFound from "@/views/NotFound.vue";
const routes = [
  {
    /** トップページ */
    path: "/",
    name: "DashBoard",
    component: DashBoard,
  },
  {
    /** スコア一覧 */
    path: "/ScoresBoard",
    name: "ScoresBoard",
    component: ScoresBoard,
  },
  {
    /** 設定画面 */
    path: "/SettingBoard",
    name: "SettingBoard",
    component: SettingBoard,
  },
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
