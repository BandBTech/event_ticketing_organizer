import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CurrencyStore {
  currency: string;
  setCurrency: (currency: string) => void;
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set) => ({
      currency: 'jpy',
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: 'currency-storage',
    }
  )
);
