// src/stores/dictionaryStore.js
import { defineStore } from 'pinia';

export const useDictionaryStore = defineStore('dictionary', {
    state: () => ({
        words: []
    }),
    actions: {
        addWord(word) {
            this.words.push(word);
        },
        clearWords() {
            this.words = [];
        }
    }
});