<template>
  <nav>
    <router-link to="/chat">Chat</router-link>
    <router-link to="/dictionary">Dictionary</router-link>
    <button class="logout-button" @click="logout">Logout</button>
  </nav>
</template>

<script setup>
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'vue-router';

const router = useRouter();

async function logout() {
  const auth = getAuth();
  await signOut(auth);
  await router.push('/login');
}
</script>

<style scoped>
nav {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background-color: #f8f9fa;
}

.logout-button {
  border: none;
  background-color: transparent;
  cursor: pointer;
}
</style>