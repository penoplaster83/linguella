<template>
  <div class="chat-container">
    <message-display :messages="messages" />
    <message-input @sendMessage="handleSendMessage" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import MessageDisplay from './MessageDisplay.vue';
import MessageInput from './MessageInput.vue';

const messages = ref([]);

async function handleSendMessage(newMessage) {
  // Сначала добавляем сообщение пользователя
  messages.value.push({
    id: new Date().getTime(),
    text: newMessage,
    sender: 'user'
  });

  // Добавляем временное сообщение ассистента с анимацией ожидания
  const tempMessageId = new Date().getTime() + 1; // Уникальный ID для временного сообщения
  messages.value.push({
    id: tempMessageId,
    text: 'Loading...',  // Показываем загрузку
    sender: 'assistant'
  });

  const response = await fetchChatGPTResponse(newMessage);
  const messageIndex = messages.value.findIndex(msg => msg.id === tempMessageId);
  if (messageIndex !== -1) {
    messages.value[messageIndex].text = response; // Обновляем текст сообщения ассистента
  }
}

async function fetchChatGPTResponse(userInput) {
  try {
    const formattedMessages = messages.value.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));

    const response = await axios.post('http://localhost:3001/chat', {
      messages: [
        { role: "system", content: "You are an english language tutor. You must try all your best to help russian user to learn English" },
        ...formattedMessages,
        { role: "user", content: userInput }
      ]
    });
    return response.data.message;
  } catch (error) {
    console.error('Error communicating with backend:', error);
    return "Sorry, there was an error processing your request.";
  }
}
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
}
</style>