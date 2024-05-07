// The rest of your main.js file
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

const vueApp = createApp(App);
const pinia = createPinia();

vueApp.use(pinia);
vueApp.use(router);
vueApp.mount('#app');