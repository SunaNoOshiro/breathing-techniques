/**
 * React hook for localization
 * Provides synchronous access to translations with async loading
 * Returns label ID if translation not found
 */

import { useState, useEffect, useCallback } from 'react';
import { detectLanguage, saveLanguage, tSync, preloadTranslations, loadTranslations, getAvailableLanguages } from '../utils/localization.js';
import Logger from '../utils/Logger.js';

export const useLocalization = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(true);
  const [availableLanguages, setAvailableLanguages] = useState([]);

  // Initialize localization
  useEffect(() => {
    const initializeLocalization = async () => {
      try {
        // Preload translations
        await preloadTranslations(['en', 'uk']);
        
        // Detect current language
        const detectedLang = await detectLanguage();
        setCurrentLanguage(detectedLang || 'en');
        
        // Load available languages
        const languages = await getAvailableLanguages();
        setAvailableLanguages(languages);
      } catch (error) {
        Logger.error("hook", 'Failed to initialize localization:', error);
        setCurrentLanguage('en');
        setAvailableLanguages([]);
      } finally {
        setIsLoading(false);
      }
    };

    initializeLocalization();
  }, []);

  // Translation function
  const t = useCallback((key, language = null) => {
    const lang = language || currentLanguage;
    return tSync(key, lang);
  }, [currentLanguage]);

  // Language change handler
  const changeLanguage = useCallback(async (newLanguage) => {
    try {
      // Ensure translations are loaded
      await loadTranslations(newLanguage);
      setCurrentLanguage(newLanguage);
      saveLanguage(newLanguage);
    } catch (error) {
      Logger.error("hook", `Failed to change language to ${newLanguage}:`, error);
    }
  }, []);

  return {
    t,
    currentLanguage,
    changeLanguage,
    availableLanguages,
    isLoading
  };
};
