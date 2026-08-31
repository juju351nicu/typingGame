import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";
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
  plugins: [vue(), vuetify(), copyBlogStorePlugin()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    // jsdomのコンポーネントテストでもVuetifyのCSS importをViteに処理させる。
    server: {
      deps: {
        inline: [/vuetify/],
      },
    },
  },
}));
