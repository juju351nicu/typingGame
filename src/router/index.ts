import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
const routeSetting: RouteRecordRaw[] = [
  {
    /** トップページ */
    path: "/",
    name: "GamePage",
    component: () => import("@/views/GamePage.vue"),
  },
  {
    /** スコア一覧 */
    path: "/scoresBoard",
    name: "RankingPage",
    component: () => import("@/views/RankingPage.vue"),
  },
  {
    /** 設定画面 */
    path: "/settingBoard",
    name: "SettingsPage",
    component: () => import("@/views/SettingsPage.vue"),
  },
  {
    /** ブログ記事一覧 */
    path: "/blogPostList",
    name: "BlogPostList",
    component: () => import("@/views/BlogPostList.vue"),
  },
  {
    /** ブログ詳細情報 */
    path: "/:section/:id",
    name: "BlogPost",
    component: () => import("@/views/BlogPost.vue"),
    props: true,
  },
  {
    /** 当サイトについて */
    path: "/aboutUs",
    name: "AboutUs",
    component: () => import("@/views/AboutUs.vue"),
  },
  {
    /** 存在しないURLにアクセスした場合 */
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFound.vue"),
  },
];

const router = createRouter({
  // Viteの環境変数でimport.meta.env.BASE_URL = vite.config.tsのbase
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routeSetting,
});
export default router;
