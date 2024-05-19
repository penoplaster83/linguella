<template>
  <MainLayout>
    <div class="container">
      <h2>Dictionary</h2>
      <div class="add-word-section">
        <h3>Add new word</h3>
        <input type="text" v-model="newWord" placeholder="Enter a word or phrase" required />
        <input type="checkbox" v-model="generateImage" /> Generate image
        <button @click="addWord" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span v-else>Add</span>
        </button>
        <select v-model="sortType">
          <option value="alphabetical">Alphabetical</option>
          <option value="dateAdded">Date added</option>
        </select>
      </div>
      <div class="word-list-section">
        <h3>Word list</h3>
        <ul>
          <li v-for="(word, index) in sortedWords" :key="index">
            <div class="word-item">
              <img :src="word.image" alt="Word image" class="word-image" />
              <div class="word-details">
                <p>Word: {{ word.text }}</p>
                <p>Translation: {{ word.translation }}</p>
                <p>Example sentence: {{ word.example }}</p>
              </div>
              <button @click="deleteWord(word)">Delete</button>
              <input type="checkbox" v-model="word.learned" @change="markWordAsLearned(word)" /> Learned
            </div>
          </li>
        </ul>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useDictionaryStore } from '../stores/dictionaryStore';
import { getFirestore, doc, addDoc, getDocs, deleteDoc, collection, serverTimestamp, query, where, updateDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { auth } from '../firebase';
import { onAuthStateChanged } from "firebase/auth";
import MainLayout from "@/layouts/MainLayout.vue";

const newWord = ref('');
const dictionaryStore = useDictionaryStore();
const db = getFirestore();
const wordsCollection = collection(db, 'words');
const storage = getStorage();

let user = null;

const loading = ref(false);

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
    loading.value = true;
    const response = await axios.post('http://localhost:3001/translate', { text: newWord.value });
    console.log('Translation response:', response);

    let imageUrl = '';
    if (generateImage.value) {
      const imageResponse = await axios.post('http://localhost:3001/generate-image', { prompt: newWord.value });
      console.log('Image generation response:', imageResponse);

      const temporaryImageUrl = imageResponse.data.imageUrl;
      console.log('Temporary image URL:', temporaryImageUrl);

      try {
        const imageBlob = await axios.get(temporaryImageUrl, { responseType: 'blob' });
        console.log('Image blob:', imageBlob);

        const imageRef = storageRef(storage, `images/${user.uid}/${newWord.value}.png`);
        const uploadTask = uploadBytesResumable(imageRef, imageBlob.data);

        await new Promise((resolve, reject) => {
          uploadTask.on('state_changed',
              (snapshot) => {
                console.log('Upload progress:', snapshot);
              },
              (error) => {
                console.error('Error uploading image:', error);
                reject(error);
              },
              async () => {
                imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
                console.log('Image URL:', imageUrl);
                resolve();
              }
          );
        });
      } catch (error) {
        console.error('Error handling image:', error);
      }
    }

    const word = {
      text: newWord.value,
      translation: response.data.translation,
      example: response.data.example,
      userId: user.uid,
      image: imageUrl
    };

    console.log('Word:', word);

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
  } finally {
    loading.value = false;
  }
}

async function fetchWords() {
  const q = query(wordsCollection, where("userId", "==", user.uid));

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    const word = doc.data();
    word.id = doc.id; // Добавьте id документа в объект слова
    dictionaryStore.addWord(word);
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
  padding: 20px;
  background-color: #f5f5f5;
}

h2 {
  color: #333;
  font-size: 2.5rem;
  margin-bottom: 2rem;
}

.add-word-section {
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.add-word-section h3 {
  color: #666;
  font-size: 2rem;
  margin-bottom: 1rem;
}

.add-word-section input[type="text"],
.add-word-section select {
  font-family: 'Outfit', sans-serif;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
}

.add-word-section button {
  font-weight: 500;
  padding: 0.5rem 1rem;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.add-word-section button:hover {
  background-color: #0056b3;
}

.add-word-section .spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #007bff;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.word-list-section {
  width: 100%;
}

.word-list-section h3 {
  color: #666;
  font-size: 2rem;
  margin-bottom: 1rem;
}

ul {
  list-style-type: none;
  padding: 0;
  width: 100%;
}

li {
  background-color: #fff;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.word-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.word-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  margin-right: 1rem;
}

.word-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.word-details p {
  margin: 0.5rem 0;
  color: #333;
}
</style>
