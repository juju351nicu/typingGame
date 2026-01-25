import { createApp } from "vue";
import App from "@/App.vue";
import { createPinia } from "pinia";
import { createPersistedState } from "pinia-plugin-persistedstate";
import router from "@/router";
import "@mdi/font/css/materialdesignicons.css";
// Vuetify
import "vuetify/styles";
import { createVuetify } from "vuetify";
const pinia = createPinia();
pinia.use(createPersistedState());
const vuetify = createVuetify({});
createApp(App).use(router).use(pinia).use(vuetify).mount("#app");
