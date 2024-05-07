<template>
  <div class="message-display">
    <div v-for="message in messages" :key="message.id" :class="{'tutor-message': message.sender === 'assistant', 'user-message': message.sender === 'user'}">
      <div v-if="message.text === 'Loading...'">
        <span class="loading-dots"></span>
        <span class="loading-dots"></span>
        <span class="loading-dots"></span>
      </div>
      <div v-else>
        {{ message.text }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  messages: Array
});
</script>

<style scoped>
.message-display {
  overflow-y: auto;
  height: 400px; /* Adjust height as per your design */
}

.tutor-message, .user-message {
  padding: 10px;
  margin: 5px;
  border-radius: 10px;
}

.tutor-message {
  text-align: left;
  background-color: #f0f0f0;
}

.user-message {
  text-align: right;
  background-color: blue;
  color: white;
}

.loading-dots {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 2px;
  border-radius: 50%;
  background-color: black;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style>