import { createRouter, createWebHistory } from 'vue-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase'; // Импортируйте auth из firebase.js
import ChatScreen from '../components/ChatScreen.vue';
import DictionaryScreen from '../components/DictionaryScreen.vue';
import Login from '../components/Login.vue';
import Register from '../components/Register.vue';

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: { requiresAuth: false }
    },
    {
        path: '/register',
        name: 'Register',
        component: Register,
        meta: { requiresAuth: false }
    },
    {
        path: '/chat',
        name: 'Chat',
        component: ChatScreen,
        meta: { requiresAuth: true }
    },
    {
        path: '/dictionary',
        name: 'Dictionary',
        component: DictionaryScreen,
        meta: { requiresAuth: true }
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.VITE_BASE_URL),
    routes
});

let authReady = false;

onAuthStateChanged(auth, () => {
    if (!authReady) {
        authReady = true;
    }
});

router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const currentUser = auth.currentUser;

    if (!authReady) {
        next();
    } else if (requiresAuth && !currentUser) {
        next('/login');
    } else if (!requiresAuth && currentUser) {
        next('/chat');
    } else {
        next();
    }
});

export default router;