<template>
  <div>
    <h2>Register</h2>
    <form @submit.prevent="handleRegister">
      <input type="email" v-model="email" placeholder="Email" required />
      <input type="password" v-model="password" placeholder="Password" minlength="8" required />
      <button type="submit">Register</button>
    </form>
    <p>Already have an account? <router-link to="/login">Login</router-link></p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { createUserWithEmailAndPassword, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { useRouter } from 'vue-router';
import { auth } from '../firebase'; // Import auth from your firebase.js file

const email = ref('');
const password = ref('');
const router = useRouter();

async function handleRegister() {
  try {
    await setPersistence(auth, browserSessionPersistence);
    await createUserWithEmailAndPassword(auth, email.value, password.value);
    router.push('/chat');
  } catch (error) {
    console.error('Error signing up:', error);
  }
}
</script>