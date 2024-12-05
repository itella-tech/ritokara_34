import { create } from 'zustand';
import { AudioLanguage } from '@/types/pdf';

interface LanguageState {
  currentLanguage: AudioLanguage;
  setLanguage: (language: AudioLanguage) => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  currentLanguage: 'en',
  setLanguage: (language) => set({ currentLanguage: language }),
})); 