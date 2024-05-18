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
        deleteWord(word) {
            const index = this.words.findIndex(w => w.text === word.text && w.userId === word.userId);
            if (index !== -1) {
                this.words.splice(index, 1);
            }
        },
        markWordAsLearned(word) {
            const index = this.words.findIndex(w => w.text === word.text && w.userId === word.userId);
            if (index !== -1) {
                this.words[index].learned = word.learned;
            }
        },
        clearWords() {
            this.words = [];
        }
    }
});