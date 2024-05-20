<!-- src/components/LogoutButton.vue -->
<template>
  <div class="logout-button" v-if="user">
    <button @click="logout">Logout</button>
  </div>
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
.logout-button {
  position: fixed;
  top: 10px;
  right: 10px;
  background-color: #f8f9fa;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}
.logout-button:hover {
  background-color: #e2e6ea;
}
</style>