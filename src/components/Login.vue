<template>
  <div>
    <h2>Login</h2>
    <form @submit.prevent="handleLogin">
      <input type="email" v-model="email" placeholder="Email" required />
      <input type="password" v-model="password" placeholder="Password" minlength="8" required />
      <button type="submit">Login</button>
    </form>
    <p>Don't have an account? <router-link to="/register">Register</router-link></p>
  </div>
</template>

<script setup>
import {ref} from 'vue';
import {signInWithEmailAndPassword, setPersistence, browserSessionPersistence} from 'firebase/auth';
import {useRouter} from 'vue-router';
import {auth} from '../firebase'; // Import auth from your firebase.js file

const email = ref('');
const password = ref('');
const router = useRouter();

async function handleLogin() {
  try {
    await setPersistence(auth, browserSessionPersistence);
    await signInWithEmailAndPassword(auth, email.value, password.value);
    router.push('/chat');
  } catch (error) {
    console.error('Error signing in:', error);
  }
}
</script>