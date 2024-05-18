<template>
  <div class="register-form">
    <input v-model="email" type="email" placeholder="Your E-Mail" />
    <input v-model="password" type="password" placeholder="Your Password" minlength="8" />
    <div class="button-container">
      <button @click="handleRegister">Register</button>
    </div>
    <p class="already-have-account">Already have an account? <router-link to="/login" class="login-link">Login</router-link></p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { getAuth, createUserWithEmailAndPassword, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { useRouter } from 'vue-router';

const auth = getAuth();
const email = ref('');
const password = ref('');
const router = useRouter();

const handleRegister = async () => {
  try {
    await setPersistence(auth, browserSessionPersistence);
    await createUserWithEmailAndPassword(auth, email.value, password.value);
    router.push('/chat');
  } catch (error) {
    console.error('Error signing up:', error);
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500&display=swap');

.register-form {
  font-family: 'Outfit', sans-serif;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.8) 50%, transparent 100%),
  linear-gradient(to left top, rgba(255, 204, 128, 0.5), rgba(255, 255, 255, 0.8)),
  linear-gradient(to top, rgba(144, 238, 144, 1), transparent);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
}

input {
  font-family: 'Outfit', sans-serif;
  font-weight: 300;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  box-shadow: inset 0 2px 3px rgba(0, 0, 0, 0.06);
  background: rgba(255, 255, 255, 0.8);
  color: #636e72;
  font-size: 16px;
  margin: 0 10px;
}

input::placeholder {
  color: #b2bec3;
  font-size: 15px;
}

button {
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  font-size: 16px;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background-color: #dfe4ea;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
  color: #2f3542;
  text-shadow: 0 -1px rgba(255, 255, 255, 0.5);
  margin: 0 10px;
}

.already-have-account {
  font-weight: 400;
  color: #636e72;
  text-align: center;
  font-size: 14px;
}

.login-link {
  color: #007bff;
  text-decoration: none;
}

.login-link:hover {
  text-decoration: underline;
}

.button-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

@media (min-width: 600px) {
  .button-container {
    flex-direction: row;
    justify-content: space-between;
  }
}
</style>
