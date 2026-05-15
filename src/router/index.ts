import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import DashBoard from "@/views/DashBoard.vue";
import ScoresBoard from "@/views/ScoresBoard.vue";
import SettingBoard from "@/views/SettingBoard.vue";
import BlogPostList from "@/views/BlogPostList.vue";
import BlogPost from "@/views/BlogPost.vue";
import AboutUs from "@/views/AboutUs.vue";
import NotFound from "@/views/NotFound.vue";
const routeSetting: RouteRecordRaw[] = [
  {
    /** トップページ */
    path: "/",
    name: "DashBoard",
    component: DashBoard,
  },
  {
    /** スコア一覧 */
    path: "/scoresBoard",
    name: "ScoresBoard",
    component: ScoresBoard,
  },
  {
    /** 設定画面 */
    path: "/settingBoard",
    name: "SettingBoard",
    component: SettingBoard,
  },
  {
    /** ブログ記事一覧 */
    path: "/blogPostList",
    name: "BlogPostList",
    component: BlogPostList,
  },
  {
    /** ブログ詳細情報 */
    path: "/:section/:id",
    name: "BlogPost",
    component: BlogPost,
    props: true,
  },
  {
    /** 当サイトについて */
    path: "/aboutUs",
    name: "AboutUs",
    component: AboutUs,
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
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routeSetting,
});
export default router;
