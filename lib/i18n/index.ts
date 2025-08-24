import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from '../languages/en';
import { vi } from '../languages/vi';

const LANGUAGE_STORAGE_KEY = '@app_language';

// Resources for all languages
const resources = {
  vi: {
    translation: vi,
  },
  en: {
    translation: en,
  },
};

// Get stored language or default to Vietnamese
const getStoredLanguage = async (): Promise<string> => {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    return stored && (stored === 'vi' || stored === 'en') ? stored : 'vi';
  } catch (error) {
    console.error('Error loading stored language:', error);
    return 'vi';
  }
};

// Initialize i18n
const initializeI18n = async () => {
  const storedLanguage = await getStoredLanguage();
  
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: storedLanguage, // Default language
      fallbackLng: 'vi',   // Fallback to Vietnamese if translation missing
      
      // Interpolation options
      interpolation: {
        escapeValue: false, // React already escapes values
      },
      
      // React i18next options
      react: {
        useSuspense: false, // Disable Suspense for React Native
      },
      
      // Debug options (set to false in production)
      debug: __DEV__,
      
      // Cache options
      cache: {
        enabled: true,
        expirationTime: 7 * 24 * 60 * 60 * 1000, // 7 days
      },
    });
};

// Initialize immediately
initializeI18n();

// Function to change language and save to storage
export const changeLanguage = async (language: 'vi' | 'en') => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    await i18n.changeLanguage(language);
  } catch (error) {
    console.error('Error changing language:', error);
  }
};

// Function to get current language
export const getCurrentLanguage = (): string => {
  return i18n.language;
};

// Function to get available languages
export const getAvailableLanguages = () => {
  return Object.keys(resources);
};

export default i18n;
