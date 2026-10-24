import { createApp } from "vue";
import App from "@/App.vue";
import { createPinia } from "pinia";
import { createPersistedState } from "pinia-plugin-persistedstate";
import router from "@/router";
import ui from "@nuxt/ui/vue-plugin";
import "@fontsource/roboto/latin-400.css";
import "@fontsource/roboto/latin-500.css";
import "@fontsource/roboto/latin-700.css";
import "@/assets/styles/main.css";
const pinia = createPinia();
pinia.use(createPersistedState());
// routerの画面遷移ガードで認証ストアを使うため、先にPiniaを登録する。
createApp(App).use(pinia).use(router).use(ui).mount("#app");
