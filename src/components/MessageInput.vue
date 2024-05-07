<template>
  <div class="input-container">
    <textarea v-model="inputText" @keyup.enter="sendAndClear" placeholder="Type your message here..." />
    <button @click="sendAndClear">Send</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const inputText = ref('');

// Эмитируем событие с сообщением для родительского компонента
const emit = defineEmits(['sendMessage']);

function sendAndClear() {
  if (inputText.value.trim() !== '') {
    emit('sendMessage', inputText.value);
    inputText.value = '';
  }
}
</script>

<style scoped>
.input-container {
  display: flex;
  justify-content: space-between;
  padding: 10px;
}

textarea {
  flex-grow: 1;
  margin-right: 10px;
}
</style>