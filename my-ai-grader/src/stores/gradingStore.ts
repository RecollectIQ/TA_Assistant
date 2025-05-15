import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useGradingStore = defineStore('grading', () => {
  const imageUrl = ref<string | null>(null); // Explicitly type as string or null

  function setImageUrl(url: string | null) {
    imageUrl.value = url;
  }

  // Placeholder for future state and actions related to grading
  // e.g., problem profile, grading results, loading states, etc.

  return {
    imageUrl,
    setImageUrl,
  };
});
