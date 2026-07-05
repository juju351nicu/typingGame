import type { RouteRecordRaw } from "vue-router";

export const routeSetting: RouteRecordRaw[] = [
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
    /** ログイン画面 */
    path: "/login",
    name: "LoginPage",
    meta: {
      requiresBackendApi: true,
    },
    component: () => import("@/views/LoginPage.vue"),
  },
  {
    /** ブログ記事一覧 */
    path: "/blogPostList",
    name: "BlogPostList",
    component: () => import("@/views/BlogPostList.vue"),
  },
  {
    /** 当サイトについて */
    path: "/aboutUs",
    name: "AboutUs",
    component: () => import("@/views/AboutUs.vue"),
  },
  {
    /** ブログ詳細情報 */
    path: "/:section/:id",
    name: "BlogPost",
    component: () => import("@/views/BlogPost.vue"),
    props: true,
  },
  {
    /** 存在しないURLにアクセスした場合 */
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFound.vue"),
  },
];
