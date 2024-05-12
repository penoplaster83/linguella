<template>
  <div class="login-form">
    <input v-model="email" type="email" placeholder="Your E-Mail" />
    <input v-model="password" type="password" placeholder="Your Password" />
    <p @click="resetPassword" class="forgot-password">Seems I forgot it</p>
    <div class="button-container">
      <button @click="login">Log In</button>
      <button class="secondary" @click="goToRegister">New here?</button>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue';
import {getAuth, signInWithEmailAndPassword, sendPasswordResetEmail} from 'firebase/auth';
import {useRouter} from 'vue-router';

const auth = getAuth();
const email = ref('');
const password = ref('');
const router = useRouter();

const login = async () => {
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
    await router.push('/chat'); // Перенаправляем пользователя на экран чата после успешного входа в систему
  } catch (error) {
    console.error('Error signing in:', error);
  }
};

const resetPassword = async () => {
  try {
    await sendPasswordResetEmail(auth, email.value);
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};

const goToRegister = () => {
  router.push('/register');
};

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500&display=swap');

.login-form {
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

button.secondary {
  background-color: #f8f9fa;
}

.forgot-password {
  font-weight: 400;
  color: #007bff;
  cursor: pointer;
  text-align: right;
  margin-top: -5px;
  margin-right: 10px;
  font-size: 14px;
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