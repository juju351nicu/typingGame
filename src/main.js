import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';
import router from './router';

const pinia = createPinia();
pinia.use(createPersistedState());

createApp(App).use(router).use(pinia).mount('#app');
