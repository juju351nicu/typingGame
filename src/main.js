import { createApp } from "vue";
import App from "@/App.vue";
import { createPinia } from "pinia";
import { createPersistedState } from "pinia-plugin-persistedstate";
import VueSidebarMenu from "vue-sidebar-menu";
import "vue-sidebar-menu/dist/vue-sidebar-menu.css";
import router from "@/router";
import "@mdi/font/css/materialdesignicons.css";
// Vuetify
import "vuetify/styles";
import { createVuetify } from "vuetify";
const pinia = createPinia();
pinia.use(createPersistedState());
const vuetify = createVuetify({});
createApp(App)
  .use(router)
  .use(VueSidebarMenu)
  .use(pinia)
  .use(vuetify)
  .mount("#app");
