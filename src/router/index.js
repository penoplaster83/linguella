import { createRouter, createWebHistory } from 'vue-router';
import ChatScreen from '../components/ChatScreen.vue';
import NewScreen from '../components/NewScreen.vue';

const routes = [
    { path: '/', name: 'ChatScreen', component: ChatScreen },
    { path: '/new-screen', name: 'NewScreen', component: NewScreen }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;