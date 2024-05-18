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
import {getAuth, onAuthStateChanged} from 'firebase/auth';
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
    // Добавить слово в хранилище
    dictionaryStore.addWord(doc.data());
  });
}

onAuthStateChanged(auth, (user) => {
  if (user && dictionaryStore.words.length === 0) {
    // User is signed in and the store is empty, call fetchWords
    fetchWords();
  } else if (!user) {
    // User is signed out, clear the store
    dictionaryStore.clearWords();
  }
});

onMounted(() => {
  if (dictionaryStore.words.length === 0) {
    fetchWords();
  }
});

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500&display=swap');

.container {
  font-family: 'Outfit', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f5f5;
}
* {
  font-family: 'Outfit', sans-serif;
}

h2 {
  color: #333;
  font-size: 2.5rem;
  margin-bottom: 2rem;
}

h3 {
  color: #666;
  font-size: 2rem;
  margin-bottom: 1rem;
}

input[type="text"] {
  font-family: 'Outfit', sans-serif;
  padding: 0.5rem;
  margin-left: 0.5rem;
  margin-right: 20%;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  font-weight: 500;
  padding: 0.5rem 1rem;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  background-color: #fff;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

p {
  margin: 0.5rem 0;
  color: #333;
}
</style>