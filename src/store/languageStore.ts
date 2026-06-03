import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Locale = 'en' | 'ja' | 'it';

function detectSystemLocale(): Locale {
  if (typeof navigator === 'undefined') return 'ja';
  const lang = (navigator.languages?.[0] ?? navigator.language ?? 'ja').toLowerCase();
  const code = lang.split('-')[0];
  if (code === 'en') return 'en';
  if (code === 'it') return 'it';
  return 'ja';
}

interface LanguageStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      locale: detectSystemLocale(),
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'language-storage',
    }
  )
);
