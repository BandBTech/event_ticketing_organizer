'use client';

import { useCallback } from 'react';
import { useLanguageStore } from '@/store/languageStore';
import en from '../../messages/en.json';
import ja from '../../messages/ja.json';
import it from '../../messages/it.json';

type Locale = 'en' | 'ja' | 'it';

interface TranslationMessages {
  [key: string]: any;
}

const messagesMap: Record<Locale, TranslationMessages> = {
  en,
  ja,
  it,
};

export function useTranslation(localeOverride?: Locale) {
  const { locale: storeLocale } = useLanguageStore();
  const locale = localeOverride || storeLocale || 'ja';
  const messages = messagesMap[locale as Locale] || messagesMap['ja'];

  const t = useCallback((key: string, fallback?: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = messages;

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

  return { t, isLoading: false, locale };
}

export const locales: Locale[] = ['en', 'ja', 'it'];

export const languageNames: Record<Locale, string> = {
  en: 'English',
  ja: '日本語',
  it: 'Italiano',
};
