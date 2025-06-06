import { createRouter, createWebHistory } from "vue-router";
import DashBoard from "../views/DashBoard.vue";
import ScoreResults from "../views/ScoreResults.vue";
import VuetifyList from "../views/VuetifyList.vue";
import NotFound from "../views/NotFound.vue";
const routes = [
  {
    /** トップページ */
    path: "/",
    name: "DashBoard",
    component: DashBoard,
  },
  {
    /** スコア一覧 */
    path: "/ScoreResults",
    name: "ScoreResults",
    component: ScoreResults,
  },
  {
    /** VuetifyList */
    path: "/vuetify",
    name: "vuetify",
    component: VuetifyList,
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
