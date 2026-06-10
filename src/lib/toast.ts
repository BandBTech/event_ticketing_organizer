import { toast as sonnerToast } from 'sonner';
import { useLanguageStore } from '@/store/languageStore';

/**
 * Translation-aware toast utility
 * Displays toasts that update when language changes
 */

// Import all translation files
import enMessages from '../../messages/en.json';
import jaMessages from '../../messages/ja.json';
import itMessages from '../../messages/it.json';

const translations = {
  en: enMessages,
  ja: jaMessages,
  it: itMessages,
};

// Store active toast IDs with their translation keys
const activeToasts = new Map<string | number, { key: string; type: 'success' | 'error' | 'info'; fallback?: string }>();

// Helper to get translation
const getTranslation = (key: string, locale: string, fallback?: string): string => {
  try {
    const messages = translations[locale as keyof typeof translations];
    const keys = key.split('.');
    let value: unknown = messages;
    
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
      if (value === undefined) break;
    }
    
    return (typeof value === 'string' ? value : undefined) || fallback || key;
  } catch {
    return 'Something went wrong. Please try again.';
  }
};

// Subscribe to language changes and update active toasts
if (typeof window !== 'undefined') {
  useLanguageStore.subscribe((state) => {
    const locale = state.locale;

    // Update all active toasts with new translations
    activeToasts.forEach(({ key, type, fallback }, toastId) => {
      const message = getTranslation(key, locale, fallback);
      
      if (type === 'success') {
        sonnerToast.success(message, { id: toastId });
      } else if (type === 'error') {
        sonnerToast.error(message, { id: toastId });
      } else {
        sonnerToast.info(message, { id: toastId });
      }
    });
  });
}

export interface ToastOptions {
  onDismiss?: (toast: { id: string | number }) => void;
  onAutoClose?: (toast: { id: string | number }) => void;
}

export const toast = {
  success: (
    translationKey: string,
    fallback?: string,
    description?: string,
    options?: ToastOptions
  ) => {
    const locale = useLanguageStore.getState().locale;
    const message = getTranslation(translationKey, locale, fallback);
    const descriptionMessage = description ? getTranslation(description, locale, description) : undefined;
    const toastId = sonnerToast.success(message, {
      description: descriptionMessage,
      onDismiss: options?.onDismiss,
      onAutoClose: options?.onAutoClose,
    });
    
    activeToasts.set(toastId, { key: translationKey, type: 'success', fallback });

    // Clean up after toast is dismissed
    setTimeout(() => {
      activeToasts.delete(toastId);
    }, 5000);

    return toastId;
  },

  error: (
    translationKey: string,
    fallback?: string,
    description?: string,
    options?: ToastOptions
  ) => {

    const locale = useLanguageStore.getState().locale;
    const message = getTranslation(translationKey, locale, fallback);
    const descriptionMessage = description ? getTranslation(description, locale, description) : undefined;
    const toastId = sonnerToast.error(message, {
      description: descriptionMessage,
      onDismiss: options?.onDismiss,
      onAutoClose: options?.onAutoClose,
    });
    
    activeToasts.set(toastId, { key: translationKey, type: 'error', fallback });

    setTimeout(() => {
      activeToasts.delete(toastId);
    }, 5000);

    return toastId;
  },

  info: (translationKey: string, fallback?: string, description?: string) => {
    const locale = useLanguageStore.getState().locale;
    const message = getTranslation(translationKey, locale, fallback);
    const toastId = sonnerToast.info(message, {
      description: description,
    });
    
    activeToasts.set(toastId, { key: translationKey, type: 'info', fallback });

    setTimeout(() => {
      activeToasts.delete(toastId);
    }, 5000);

    return toastId;
  },

  // For dynamic messages (non-translation keys)
  message: (message: string, type: 'success' | 'error' | 'info' | 'default' = 'default') => {
    if (type === 'success') return sonnerToast.success(message);
    if (type === 'error') return sonnerToast.error(message);
    if (type === 'info') return sonnerToast.info(message);
    return sonnerToast(message);
  },

  // Dismiss specific toast
  dismiss: (toastId?: string | number) => {
    if (toastId) {
      activeToasts.delete(toastId);
    }
    sonnerToast.dismiss(toastId);
  },
};
