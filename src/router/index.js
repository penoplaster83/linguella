import { createRouter, createWebHistory } from 'vue-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import ChatScreen from '../components/ChatScreen.vue';
import Login from '../components/Login.vue';
import Register from '../components/Register.vue';

const routes = [
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/chat', component: ChatScreen, meta: { requiresAuth: true } },
    { path: '/', redirect: '/login' }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
        if (requiresAuth && !user) {
            next('/login');
        } else {
            next();
        }
    });
});

export default router;