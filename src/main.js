import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';
import VueSidebarMenu from 'vue-sidebar-menu'
import 'vue-sidebar-menu/dist/vue-sidebar-menu.css'
import router from './router';

const pinia = createPinia();
pinia.use(createPersistedState());

createApp(App).use(router).use(VueSidebarMenu).use(pinia).mount('#app');
