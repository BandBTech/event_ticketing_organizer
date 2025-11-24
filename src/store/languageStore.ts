import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Locale = 'en' | 'ja' | 'it';

interface LanguageStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      locale: 'en',
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'language-storage',
    }
  )
);
