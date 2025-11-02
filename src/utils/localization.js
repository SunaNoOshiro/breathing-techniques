/**
 * Localization system for breathing techniques app
 * Supports multiple languages without fallbacks
 * Loads translations from YAML files
 * Returns label ID if translation not found
 */

import yaml from 'js-yaml';
import Logger from './Logger.js';

// Cache for loaded translations
const translationCache = new Map();


// Language detection utilities
export const detectLanguage = async () => {
  // Check localStorage first
  const storedLang = localStorage.getItem('breathing-app-language');
  if (storedLang && await isLanguageAvailable(storedLang)) {
    return storedLang;
  }
  
  // Check browser language
  const browserLang = navigator.language || navigator.userLanguage;
  const langCode = browserLang.split('-')[0];
  
  // Check if we support this language
  if (await isLanguageAvailable(langCode)) {
    return langCode;
  }
  
  // Return null if no language is available
  return null;
};

// Check if language is available
const isLanguageAvailable = async (langCode) => {
  try {
    await loadTranslations(langCode);
    return true;
  } catch {
    return false;
  }
};

// Load translations from YAML file
export const loadTranslations = async (langCode) => {
  // Return cached translations if available
  if (translationCache.has(langCode)) {
    return translationCache.get(langCode);
  }

  try {
    // Try different paths for development and production
    let response;
    try {
      response = await fetch(`/locales/${langCode}.yaml`);
    } catch {
      try {
        response = await fetch(`./locales/${langCode}.yaml`);
      } catch {
        // Final fallback for different environments
        response = await fetch(`/src/locales/${langCode}.yaml`);
      }
    }
    
    if (!response.ok) {
      throw new Error(`Failed to load translations for ${langCode}`);
    }
    
    const yamlText = await response.text();
    const translations = yaml.load(yamlText);
    
    // Cache the translations
    translationCache.set(langCode, translations);
    
    return translations;
  } catch (error) {
    Logger.warn("util", `Failed to load translations for ${langCode}:`, error);
    throw error;
  }
};

// Save language preference
export const saveLanguage = (language) => {
  localStorage.setItem('breathing-app-language', language);
};

// Translation function
export const t = async (key, language = null) => {
  const currentLang = language || await detectLanguage();
  
  if (!currentLang) {
    return key;
  }
  
  try {
    const translation = await loadTranslations(currentLang);
    
    if (!translation) {
      Logger.warn("util", `Translation not found for language: ${currentLang}`);
      return key;
    }
    
    const result = getNestedValue(translation, key);
    if (result !== undefined) {
      return result;
    }
    
    return key;
  } catch (error) {
    Logger.warn("util", `Translation error for key ${key}:`, error);
    return key;
  }
};

// Helper function to get nested values from object
const getNestedValue = (obj, key) => {
  const keys = key.split('.');
  let result = obj;
  
  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k];
    } else {
      return undefined;
    }
  }
  
  return result;
};

// Get available languages
export const getAvailableLanguages = async () => {
  const languages = [];
  
  // Try to load each language file
  const languageCodes = ['en', 'uk'];
  
  for (const code of languageCodes) {
    try {
      const translations = await loadTranslations(code);
      if (translations && translations.languageName) {
        languages.push({
          code,
          name: translations.languageName
        });
      }
    } catch (error) {
      Logger.warn("util", `Failed to load language ${code}:`, error);
    }
  }
  
  return languages;
};

// Synchronous version for React components (no fallbacks)
export const tSync = (key, language = null) => {
  if (!language) {
    return key;
  }
  
  const translations = translationCache.get(language);
  if (translations) {
    const result = getNestedValue(translations, key);
    if (result !== undefined) {
      return result;
    }
  }
  
  // Fallback to English if current language is not English
  if (language !== 'en') {
    const englishTranslations = translationCache.get('en');
    if (englishTranslations) {
      const result = getNestedValue(englishTranslations, key);
      if (result !== undefined) {
        return result;
      }
    }
  }
  
  return key;
};

// Preload translations for better performance
export const preloadTranslations = async (languageCodes = ['en', 'uk']) => {
  const promises = languageCodes.map(code => loadTranslations(code));
  await Promise.allSettled(promises);
};

export default {
  detectLanguage,
  saveLanguage,
  t,
  tSync,
  getAvailableLanguages,
  preloadTranslations,
  loadTranslations
};
