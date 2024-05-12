<template>
  <MainLayout>
    <div>
      <h2>Dictionary</h2>
      <div>
        <h3>Add new word</h3>
        <input type="text" v-model="newWord" placeholder="Enter a word or phrase" required/>
        <button @click="addWord">Add</button>
      </div>
      <div>
        <h3>Word list</h3>
        <ul>
          <li v-for="(word, index) in dictionaryStore.words" :key="index">
            <p>Word: {{ word.text }}</p>
            <p>Translation: {{ word.translation }}</p>
            <p>Example sentence: {{ word.example }}</p>
          </li>
        </ul>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import axios from 'axios';
import {useDictionaryStore} from '../stores/dictionaryStore';
import {getAuth} from 'firebase/auth';
import {getFirestore, addDoc, collection, serverTimestamp, query, where, getDocs} from 'firebase/firestore';
import MainLayout from "@/layouts/MainLayout.vue";

const newWord = ref('');
const dictionaryStore = useDictionaryStore();
const db = getFirestore();
const wordsCollection = collection(db, 'words');

const auth = getAuth();
const user = auth.currentUser;

async function addWord() {
  try {
    const response = await axios.post('http://localhost:3001/translate', {
      text: newWord.value
    });
    const word = {
      text: newWord.value,
      translation: response.data.translation,
      example: response.data.example || 'No', // Set a default value if example is undefined
      userId: user.uid // Добавить идентификатор пользователя
    };
    dictionaryStore.addWord(word);
    newWord.value = '';

    // Check for all necessary fields
    if (word.text && word.translation && word.example) {
      // Add word to Firestore
      const firestoreWord = {
        ...word,
        timestamp: serverTimestamp()
      };
      await addDoc(wordsCollection, firestoreWord);
    } else {
      console.error('Error: Missing word fields:', word);
    }
  } catch (error) {
    console.error('Error translating word:', error);
  }
}

async function fetchWords() {
  // Создать запрос для получения только слов текущего пользователя
  const q = query(wordsCollection, where("userId", "==", user.uid));

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    console.log(doc.id, " => ", doc.data());
  });
}

onMounted(fetchWords);

</script>

<style scoped>
/* Здесь вы можете добавить свои стили */
</style>