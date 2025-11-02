/**
 * Enhanced Localization Context
 * Provides localization functionality with Strategy pattern and error handling
 */

import React, { createContext, useContext, useMemo, useEffect, useCallback, useState } from 'react';
import { useServices } from './ServicesContext.jsx';
import { AppError, ERROR_CODES } from '../errors/AppError.js';
import Logger from '../utils/Logger.js';

/**
 * Localization Strategy interface
 */
class LocalizationStrategy {
  /**
   * Load translations for language
   * @param {string} languageCode - Language code
   * @returns {Promise<object>} - Translations object
   */
  async loadTranslations(languageCode) {
    throw new Error('loadTranslations method must be implemented by strategy');
  }

  /**
   * Get strategy name
   * @returns {string} - Strategy name
   */
  getName() {
    throw new Error('getName method must be implemented by strategy');
  }

  /**
   * Check if strategy supports language
   * @param {string} languageCode - Language code
   * @returns {boolean} - True if supported
   */
  supportsLanguage(languageCode) {
    throw new Error('supportsLanguage method must be implemented by strategy');
  }
}

/**
 * YAML Localization Strategy
 * Loads translations from YAML files
 */
class YAMLLocalizationStrategy extends LocalizationStrategy {
  constructor() {
    super();
    this.name = 'yaml';
    this.supportedLanguages = ['en', 'uk'];
    this.cache = new Map();
  }

  async loadTranslations(languageCode) {
    if (this.cache.has(languageCode)) {
      return this.cache.get(languageCode);
    }

    try {
      // Try different paths for development and production
      let response;
      try {
        response = await fetch(`/breathing-techniques/locales/${languageCode}.yaml`);
      } catch {
        try {
          response = await fetch(`./locales/${languageCode}.yaml`);
        } catch {
          response = await fetch(`/src/locales/${languageCode}.yaml`);
        }
      }
      
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${languageCode}`);
      }

      const yamlText = await response.text();
      const yaml = await import('js-yaml');
      const translations = yaml.load(yamlText);

      this.cache.set(languageCode, translations);
      return translations;
    } catch (error) {
      throw new AppError(
        `Failed to load YAML translations for ${languageCode}`,
        ERROR_CODES.LOCALIZATION_LOAD_FAILED,
        { languageCode, originalError: error.message }
      );
    }
  }

  getName() {
    return this.name;
  }

  supportsLanguage(languageCode) {
    return this.supportedLanguages.includes(languageCode);
  }
}

/**
 * JSON Localization Strategy
 * Loads translations from JSON files
 */
class JSONLocalizationStrategy extends LocalizationStrategy {
  constructor() {
    super();
    this.name = 'json';
    this.supportedLanguages = ['en', 'uk'];
    this.cache = new Map();
  }

  async loadTranslations(languageCode) {
    if (this.cache.has(languageCode)) {
      return this.cache.get(languageCode);
    }

    try {
      const response = await fetch(`/src/locales/${languageCode}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${languageCode}`);
      }

      const translations = await response.json();
      this.cache.set(languageCode, translations);
      return translations;
    } catch (error) {
      throw new AppError(
        `Failed to load JSON translations for ${languageCode}`,
        ERROR_CODES.LOCALIZATION_LOAD_FAILED,
        { languageCode, originalError: error.message }
      );
    }
  }

  getName() {
    return this.name;
  }

  supportsLanguage(languageCode) {
    return this.supportedLanguages.includes(languageCode);
  }
}

/**
 * Localization Strategy Manager
 */
class LocalizationStrategyManager {
  constructor() {
    this.strategies = new Map();
    this.currentStrategy = null;
    this.registerDefaultStrategies();
  }

  registerDefaultStrategies() {
    this.registerStrategy(new YAMLLocalizationStrategy());
    this.registerStrategy(new JSONLocalizationStrategy());
    this.currentStrategy = this.strategies.get('yaml');
  }

  registerStrategy(strategy) {
    this.strategies.set(strategy.getName(), strategy);
  }

  setCurrentStrategy(strategyName) {
    const strategy = this.strategies.get(strategyName);
    if (!strategy) {
      throw new AppError(
        `Localization strategy '${strategyName}' not found`,
        ERROR_CODES.CONFIGURATION_INVALID,
        { strategyName, availableStrategies: Array.from(this.strategies.keys()) }
      );
    }
    this.currentStrategy = strategy;
  }

  getCurrentStrategy() {
    return this.currentStrategy;
  }

  async loadTranslations(languageCode) {
    if (!this.currentStrategy) {
      throw new AppError(
        'No localization strategy selected',
        ERROR_CODES.CONFIGURATION_INVALID
      );
    }

    return await this.currentStrategy.loadTranslations(languageCode);
  }
}

/**
 * Localization Context
 */
const LocalizationContext = createContext(null);

/**
 * Localization Provider Component
 */
export const LocalizationProvider = ({ children }) => {
  const services = useServices();
  const { storageService, preferencesState } = services;

  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [translations, setTranslations] = useState(new Map());
  const [availableLanguages, setAvailableLanguages] = useState([]);

  const strategyManager = useMemo(() => new LocalizationStrategyManager(), []);

  // Initialize localization
  useEffect(() => {
    const initializeLocalization = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Detect current language
        const detectedLang = await detectLanguage();
        const language = detectedLang || 'en';
        setCurrentLanguage(language);

        // Load translations
        await loadTranslations(language);

        // Load available languages
        await loadAvailableLanguages();

        // Update preferences
        if (preferencesState) {
          preferencesState.setCurrentLanguage(language);
        }
      } catch (err) {
        setError(err.message);
        Logger.error("context", 'Failed to initialize localization:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeLocalization();
  }, [preferencesState]);

  // Detect language
  const detectLanguage = useCallback(async () => {
    try {
      // Check storage first
      if (storageService) {
        const storedLang = await storageService.get('breathing-app-language');
        if (storedLang && await isLanguageAvailable(storedLang)) {
          return storedLang;
        }
      }

      // Check browser language
      const browserLang = navigator.language || navigator.userLanguage;
      const langCode = browserLang.split('-')[0];

      if (await isLanguageAvailable(langCode)) {
        return langCode;
      }

      return null;
    } catch (error) {
      Logger.warn("context", 'Failed to detect language:', error);
      return null;
    }
  }, [storageService]);

  // Check if language is available
  const isLanguageAvailable = useCallback(async (languageCode) => {
    try {
      await strategyManager.loadTranslations(languageCode);
      return true;
    } catch {
      return false;
    }
  }, [strategyManager]);

  // Load translations
  const loadTranslations = useCallback(async (languageCode) => {
    try {
      const translations = await strategyManager.loadTranslations(languageCode);
      setTranslations(prev => new Map(prev).set(languageCode, translations));
      return translations;
    } catch (error) {
      throw new AppError(
        `Failed to load translations for ${languageCode}`,
        ERROR_CODES.LOCALIZATION_LOAD_FAILED,
        { languageCode, originalError: error.message }
      );
    }
  }, [strategyManager]);

  // Load available languages
  const loadAvailableLanguages = useCallback(async () => {
    const languages = [];
    const languageCodes = ['en', 'uk'];

    for (const code of languageCodes) {
      try {
        const translations = await strategyManager.loadTranslations(code);
        if (translations && translations.languageName) {
          languages.push({
            code,
            name: translations.languageName
          });
        }
      } catch (error) {
        Logger.warn("context", `Failed to load language ${code}:`, error);
      }
    }

    setAvailableLanguages(languages);
  }, [strategyManager]);

  // Change language
  const changeLanguage = useCallback(async (newLanguage) => {
    try {
      setIsLoading(true);
      setError(null);

      // Load translations
      await loadTranslations(newLanguage);

      // Update state
      setCurrentLanguage(newLanguage);

      // Save to storage
      if (storageService) {
        await storageService.set('breathing-app-language', newLanguage);
      }

      // Update preferences
      if (preferencesState) {
        preferencesState.setCurrentLanguage(newLanguage);
      }
    } catch (error) {
      setError(error.message);
      throw new AppError(
        `Failed to change language to ${newLanguage}`,
        ERROR_CODES.LOCALIZATION_LOAD_FAILED,
        { newLanguage, originalError: error.message }
      );
    } finally {
      setIsLoading(false);
    }
  }, [loadTranslations, storageService, preferencesState]);

  // Get nested value from object
  const getNestedValue = useCallback((obj, key) => {
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
  }, []);

  // Translation function
  const t = useCallback((key, language = null) => {
    const lang = language || currentLanguage;
    const translationData = translations.get(lang);
    
    if (!translationData) {
      return key;
    }

    const result = getNestedValue(translationData, key);
    return result !== undefined ? result : key;
  }, [currentLanguage, translations, getNestedValue]);

  // Preload translations
  const preloadTranslations = useCallback(async (languageCodes = ['en', 'uk']) => {
    try {
      const promises = languageCodes.map(code => loadTranslations(code));
      await Promise.allSettled(promises);
    } catch (error) {
      Logger.warn("context", 'Failed to preload translations:', error);
    }
  }, [loadTranslations]);

  // Set localization strategy
  const setStrategy = useCallback((strategyName) => {
    try {
      strategyManager.setCurrentStrategy(strategyName);
    } catch (error) {
      throw new AppError(
        'Failed to set localization strategy',
        ERROR_CODES.CONFIGURATION_INVALID,
        { strategyName, originalError: error.message }
      );
    }
  }, [strategyManager]);

  // Get current strategy
  const getCurrentStrategy = useCallback(() => {
    return strategyManager.getCurrentStrategy();
  }, [strategyManager]);

  // Get capabilities
  const getCapabilities = useCallback(() => {
    return {
      currentLanguage,
      availableLanguages: availableLanguages.length,
      loadedLanguages: Array.from(translations.keys()),
      currentStrategy: getCurrentStrategy()?.getName(),
      isLoading,
      hasError: !!error
    };
  }, [currentLanguage, availableLanguages, translations, getCurrentStrategy, isLoading, error]);

  const contextValue = useMemo(() => ({
    // State
    currentLanguage,
    isLoading,
    error,
    availableLanguages,
    translations,
    
    // Actions
    changeLanguage,
    loadTranslations,
    preloadTranslations,
    
    // Translation
    t,
    
    // Strategy management
    setStrategy,
    getCurrentStrategy,
    
    // Utilities
    detectLanguage,
    isLanguageAvailable,
    
    // Capabilities
    getCapabilities
  }), [
    currentLanguage,
    isLoading,
    error,
    availableLanguages,
    translations,
    changeLanguage,
    loadTranslations,
    preloadTranslations,
    t,
    setStrategy,
    getCurrentStrategy,
    detectLanguage,
    isLanguageAvailable,
    getCapabilities
  ]);

  return (
    <LocalizationContext.Provider value={contextValue}>
      {children}
    </LocalizationContext.Provider>
  );
};

/**
 * Hook to use localization context
 * @returns {object} - Localization context value
 */
export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  
  if (!context) {
    throw new AppError(
      'useLocalization must be used within a LocalizationProvider',
      ERROR_CODES.DEPENDENCY_INJECTION_FAILED
    );
  }
  
  return context;
};

/**
 * Hook to use translation function
 * @returns {Function} - Translation function
 */
export const useTranslation = () => {
  const { t } = useLocalization();
  return t;
};

/**
 * Hook to use language state
 * @returns {object} - Language state and actions
 */
export const useLanguage = () => {
  const localization = useLocalization();
  
  return {
    currentLanguage: localization.currentLanguage,
    availableLanguages: localization.availableLanguages,
    isLoading: localization.isLoading,
    error: localization.error,
    changeLanguage: localization.changeLanguage,
    capabilities: localization.getCapabilities()
  };
};

export default LocalizationContext;
