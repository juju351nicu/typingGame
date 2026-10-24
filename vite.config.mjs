import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import ui from "@nuxt/ui/vite";
import { uiTheme } from "./ui.theme.mjs";
import { cp } from "node:fs/promises";
import { fileURLToPath, URL } from "node:url";

/**
 * Copies blog article data into the production build output.
 *
 * GitHub Pages deploys only the generated dist directory, so root-level
 * blog_store files must be copied during build to keep blog list/detail
 * pages available on the public site.
 */
const copyBlogStorePlugin = () => ({
  name: "copy-blog-store",
  apply: "build",
  async closeBundle() {
    await cp(
      fileURLToPath(new URL("./blog_store", import.meta.url)),
      fileURLToPath(new URL("./dist/blog_store", import.meta.url)),
      {
        recursive: true,
        force: true,
        filter: (source) => !source.endsWith(".DS_Store"),
      }
    );
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/typingGame/" : "/",
  server: {
    host: true,
    port: 8081,
  },
  plugins: [
    vue(),
    ui({
      // 表示テーマは設定画面のストアで管理するため、Nuxt UIのcolor-mode連携は使わない。
      colorMode: false,
      // コンポーネントは各ファイルで明示的にimportし、自動import用の型ファイルを生成しない。
      components: false,
      autoImport: false,
      // GitHub Pagesの静的配信でもアイコンを表示できるよう、使用アイコンをビルドへ同梱する。
      icon: {
        clientBundle: {
          scan: true,
        },
      },
      ui: uiTheme,
    }),
    copyBlogStorePlugin(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    // storeのテストはvi.resetModules()後に動的importするため、初回変換が重い環境では
    // 既定の5秒を超えることがある。処理の遅延ではなく変換待ちで落ちないよう余裕を持たせる。
    testTimeout: 15_000,
  },
}));
