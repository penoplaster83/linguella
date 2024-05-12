<template>
  <MainLayout>
    <div class="chat-container">
      <message-display :messages="chatStore.messages" />
      <message-input @sendMessage="handleSendMessage" />
    </div>
  </MainLayout>
</template>

<script setup>
import {useChatStore} from '../stores/chatStore';
import MessageDisplay from './MessageDisplay.vue';
import MessageInput from './MessageInput.vue';
import axios from 'axios'; // Import axios here
import { getFirestore, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import MainLayout from "@/layouts/MainLayout.vue";

const chatStore = useChatStore();
const db = getFirestore();
const messagesCollection = collection(db, 'messages');

async function handleSendMessage(newMessage) {
  const messageId = new Date().getTime();
  chatStore.addMessage({
    id: messageId,
    text: newMessage,
    sender: 'user'
  });

  const tempMessageId = new Date().getTime() + 1;
  chatStore.addMessage({
    id: tempMessageId,
    text: 'Loading...',
    sender: 'assistant'
  });

  const response = await fetchChatGPTResponse(newMessage);
  const messageIndex = chatStore.messages.findIndex(msg => msg.id === tempMessageId);
  if (messageIndex !== -1) {
    chatStore.messages[messageIndex].text = response;
  }

  // Добавление сообщения в Firestore
  const message = {
    id: messageId,
    content: newMessage,
    timestamp: serverTimestamp(),
    sender: 'user'
  };

  try {
    await addDoc(messagesCollection, message);
  } catch (error) {
    console.error('Error sending message:', error);
  }

  // Добавление ответа ассистента в Firestore
  const assistantMessage = {
    id: tempMessageId,
    content: response,
    timestamp: serverTimestamp(),
    sender: 'assistant'
  };

  try {
    await addDoc(messagesCollection, assistantMessage);
  } catch (error) {
    console.error('Error sending assistant message:', error);
  }
}

async function fetchChatGPTResponse(userInput) {
  try {
    const formattedMessages = chatStore.messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));

    const response = await axios.post('http://localhost:3001/chat', {
      messages: [
        {
          role: "system",
          content: "You are an english language tutor. You must try all your best to help russian user to learn English"
        },
        ...formattedMessages,
        {role: "user", content: userInput}
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