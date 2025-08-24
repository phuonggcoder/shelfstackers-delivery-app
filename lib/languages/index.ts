import { en } from './en';
import { vi } from './vi';

export type Language = 'vi' | 'en';

export const languages = {
  vi,
  en,
};

export type LanguageKeys = keyof typeof vi;

// Helper function to get nested language value
export const getLanguageValue = (obj: any, path: string): string => {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path;
};

// Default language
export const DEFAULT_LANGUAGE: Language = 'vi';
