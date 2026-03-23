'use client';

import { useState, useEffect, useCallback } from 'react';

type Locale = 'en' | 'ja' | 'it';

interface TranslationMessages {
  [key: string]: string | TranslationMessages;
}

const translations: Record<Locale, () => Promise<TranslationMessages>> = {
  en: () => import('../../messages/en.json').then(m => m.default),
  ja: () => import('../../messages/ja.json').then(m => m.default),
  it: () => import('../../messages/it.json').then(m => m.default),
};

import { useLanguageStore } from '@/store/languageStore';

export function useTranslation(localeOverride?: Locale) {
  const { locale: storeLocale } = useLanguageStore();
  const locale = localeOverride || storeLocale || 'en';

  const [messages, setMessages] = useState<TranslationMessages>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading(true);
      try {
        const msgs = await translations[locale]();
        setMessages(msgs);
      } catch {
        // Fallback to English
        const fallback = await translations.en();
        setMessages(fallback);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [locale]);

  const t = useCallback((key: string, fallback?: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: string | TranslationMessages = messages;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        value = fallback || key;
        break;
      }
    }

    let result = typeof value === 'string' ? value : fallback || key;

    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        result = result.replace(new RegExp(`{${key}}`, 'g'), String(val));
      });
    }

    return result;
  }, [messages]);

  return { t, isLoading, locale };
}

export const locales: Locale[] = ['en', 'ja', 'it'];

export const languageNames: Record<Locale, string> = {
  en: 'English',
  ja: '日本語',
  it: 'Italiano',
};
