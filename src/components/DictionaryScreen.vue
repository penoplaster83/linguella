<template>
  <MainLayout>
    <div>
      <h2>Dictionary</h2>
      <div>
        <h3>Add new word</h3>
        <input type="text" v-model="newWord" placeholder="Enter a word or phrase" required/>
        <input type="checkbox" v-model="generateImage" /> Generate image
        <button @click="addWord">Add</button>
        <select v-model="sortType">
          <option value="alphabetical">Alphabetical</option>
          <option value="dateAdded">Date added</option>
        </select>
      </div>
      <div>
        <h3>Word list</h3>
        <ul>
          <li v-for="(word, index) in sortedWords" :key="index">
            <div style="display: flex; align-items: center;">
              <img :src="word.image" alt="Word image" style="width: 100px; height: 100px; object-fit: cover; margin-right: 1rem;" />
              <div>
                <p>Word: {{ word.text }}</p>
                <p>Translation: {{ word.translation }}</p>
                <p>Example sentence: {{ word.example }}</p>
              </div>
            </div>
            <button @click="deleteWord(word)">Delete</button>
            <input type="checkbox" v-model="word.learned" @change="markWordAsLearned(word)" /> Learned
          </li>
        </ul>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue';
import axios from 'axios';
import {useDictionaryStore} from '../stores/dictionaryStore';
import {getFirestore, doc, addDoc, getDocs, deleteDoc, collection, serverTimestamp, query, where} from 'firebase/firestore';
import {auth} from '../firebase';
import MainLayout from "@/layouts/MainLayout.vue";
import {onAuthStateChanged} from "firebase/auth";

const newWord = ref('');
const dictionaryStore = useDictionaryStore();
const db = getFirestore();
const wordsCollection = collection(db, 'words');

let user = null;

onAuthStateChanged(auth, (currentUser) => {
  user = currentUser;
  if (user && dictionaryStore.words.length === 0) {
    fetchWords();
  }
});

const sortType = ref('alphabetical');
const generateImage = ref(true);

const sortedWords = computed(() => {
  let words = [...dictionaryStore.words];
  if (sortType.value === 'alphabetical') {
    words.sort((a, b) => a.text.localeCompare(b.text));
  } else if (sortType.value === 'dateAdded') {
    words.sort((a, b) => b.timestamp - a.timestamp);
  }
  return words;
});

async function deleteWord(word) {
  dictionaryStore.deleteWord(word);
  const wordRef = doc(db, 'words', word.id);
  await deleteDoc(wordRef);
}

async function markWordAsLearned(word) {
  const wordRef = doc(db, 'words', word.id);
  await updateDoc(wordRef, { learned: word.learned });
}



async function addWord() {
  try {
    const response = await axios.post('http://localhost:3001/translate', {
      text: newWord.value
    });

    let imageUrl = '';
    if (generateImage.value) {
      // Получение изображения с сервера
      const imageResponse = await axios.post('http://localhost:3001/generate-image', {
        prompt: newWord.value
      });
      imageUrl = imageResponse.data.imageUrl;
    }

    const word = {
      text: newWord.value,
      translation: response.data.translation,
      example: response.data.example,
      userId: user.uid,
      image: imageUrl
    };

    dictionaryStore.addWord(word);
    newWord.value = '';

    if (word.text && word.translation && word.example && word.userId) {
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
  const q = query(wordsCollection, where("userId", "==", user.uid));

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    console.log(doc.id, " => ", doc.data());
    dictionaryStore.addWord(doc.data());
  });
}

onMounted(() => {
  if (user && dictionaryStore.words.length === 0) {
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

img {
  width: 100px;
  height: 100px;
  object-fit: cover;
}
</style>