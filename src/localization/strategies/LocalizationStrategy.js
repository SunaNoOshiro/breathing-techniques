/**
 * Localization Strategy Pattern
 * Provides different strategies for loading and managing translations
 */

import Logger from '../../utils/Logger.js';

/**
 * Base Localization Strategy Interface
 */
export class LocalizationStrategy {
  constructor() {
    this.name = 'BaseLocalizationStrategy';
  }

  /**
   * Load translations for a language
   * @param {string} language - Language code
   * @returns {Promise<object>} - Translations object
   */
  async loadTranslations(language) {
    throw new Error('loadTranslations method must be implemented');
  }

  /**
   * Get translation for a key
   * @param {string} key - Translation key
   * @param {object} params - Parameters for interpolation
   * @returns {string} - Translated string
   */
  translate(key, params = {}) {
    throw new Error('translate method must be implemented');
  }

  /**
   * Check if translations are loaded
   * @param {string} language - Language code
   * @returns {boolean} - True if loaded
   */
  isLoaded(language) {
    throw new Error('isLoaded method must be implemented');
  }

  /**
   * Get available languages
   * @returns {Array<string>} - Available language codes
   */
  getAvailableLanguages() {
    throw new Error('getAvailableLanguages method must be implemented');
  }
}

/**
 * JSON File Strategy
 * Loads translations from JSON files
 */
export class JsonFileStrategy extends LocalizationStrategy {
  constructor() {
    super();
    this.name = 'JsonFileStrategy';
    this.translations = new Map();
    this.loadingPromises = new Map();
  }

  async loadTranslations(language) {
    if (this.translations.has(language)) {
      return this.translations.get(language);
    }

    if (this.loadingPromises.has(language)) {
      return this.loadingPromises.get(language);
    }

    const loadingPromise = this.loadFromFile(language);
    this.loadingPromises.set(language, loadingPromise);

    try {
      const translations = await loadingPromise;
      this.translations.set(language, translations);
      this.loadingPromises.delete(language);
      return translations;
    } catch (error) {
      this.loadingPromises.delete(language);
      throw error;
    }
  }

  async loadFromFile(language) {
    try {
      const response = await fetch(`/locales/${language}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${language}`);
      }
      return await response.json();
    } catch (error) {
      Logger.error("strategy", `Error loading translations for ${language}:`, error);
      // Fallback to English if available
      if (language !== 'en') {
        return this.loadFromFile('en');
      }
      throw error;
    }
  }

  translate(key, params = {}) {
    const [language, ...keyParts] = key.split('.');
    const translationKey = keyParts.join('.');
    
    const translations = this.translations.get(language);
    if (!translations) {
      return key; // Return key if translations not loaded
    }

    const value = this.getNestedValue(translations, translationKey);
    if (value === undefined) {
      return key; // Return key if translation not found
    }

    return this.interpolate(value, params);
  }

  isLoaded(language) {
    return this.translations.has(language);
  }

  getAvailableLanguages() {
    return Array.from(this.translations.keys());
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  interpolate(template, params) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match;
    });
  }
}

/**
 * Async Module Strategy
 * Loads translations from dynamic imports
 */
export class AsyncModuleStrategy extends LocalizationStrategy {
  constructor() {
    super();
    this.name = 'AsyncModuleStrategy';
    this.translations = new Map();
    this.loadingPromises = new Map();
  }

  async loadTranslations(language) {
    if (this.translations.has(language)) {
      return this.translations.get(language);
    }

    if (this.loadingPromises.has(language)) {
      return this.loadingPromises.get(language);
    }

    const loadingPromise = this.loadFromModule(language);
    this.loadingPromises.set(language, loadingPromise);

    try {
      const translations = await loadingPromise;
      this.translations.set(language, translations);
      this.loadingPromises.delete(language);
      return translations;
    } catch (error) {
      this.loadingPromises.delete(language);
      throw error;
    }
  }

  async loadFromModule(language) {
    try {
      const module = await import(`../locales/${language}.js`);
      return module.default || module;
    } catch (error) {
      Logger.error("strategy", `Error loading translations module for ${language}:`, error);
      // Fallback to English if available
      if (language !== 'en') {
        return this.loadFromModule('en');
      }
      throw error;
    }
  }

  translate(key, params = {}) {
    const [language, ...keyParts] = key.split('.');
    const translationKey = keyParts.join('.');
    
    const translations = this.translations.get(language);
    if (!translations) {
      return key;
    }

    const value = this.getNestedValue(translations, translationKey);
    if (value === undefined) {
      return key;
    }

    return this.interpolate(value, params);
  }

  isLoaded(language) {
    return this.translations.has(language);
  }

  getAvailableLanguages() {
    return Array.from(this.translations.keys());
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  interpolate(template, params) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match;
    });
  }
}

/**
 * Inline Strategy
 * Uses inline translations (for small apps or testing)
 */
export class InlineStrategy extends LocalizationStrategy {
  constructor(translations = {}) {
    super();
    this.name = 'InlineStrategy';
    this.translations = translations;
  }

  async loadTranslations(language) {
    return this.translations[language] || {};
  }

  translate(key, params = {}) {
    const [language, ...keyParts] = key.split('.');
    const translationKey = keyParts.join('.');
    
    const translations = this.translations[language];
    if (!translations) {
      return key;
    }

    const value = this.getNestedValue(translations, translationKey);
    if (value === undefined) {
      return key;
    }

    return this.interpolate(value, params);
  }

  isLoaded(language) {
    return !!this.translations[language];
  }

  getAvailableLanguages() {
    return Object.keys(this.translations);
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  interpolate(template, params) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match;
    });
  }
}

/**
 * Localization Strategy Manager
 * Manages different localization strategies
 */
export class LocalizationStrategyManager {
  constructor(defaultStrategy = 'json') {
    this.strategies = new Map();
    this.currentStrategy = null;
    this.defaultStrategy = defaultStrategy;
    
    this.registerDefaultStrategies();
  }

  registerDefaultStrategies() {
    this.registerStrategy('json', new JsonFileStrategy());
    this.registerStrategy('async', new AsyncModuleStrategy());
    this.registerStrategy('inline', new InlineStrategy());
  }

  registerStrategy(name, strategy) {
    this.strategies.set(name, strategy);
  }

  setStrategy(name) {
    const strategy = this.strategies.get(name);
    if (!strategy) {
      throw new Error(`Strategy '${name}' not found`);
    }
    this.currentStrategy = strategy;
  }

  getCurrentStrategy() {
    if (!this.currentStrategy) {
      this.setStrategy(this.defaultStrategy);
    }
    return this.currentStrategy;
  }

  async loadTranslations(language) {
    return this.getCurrentStrategy().loadTranslations(language);
  }

  translate(key, params = {}) {
    return this.getCurrentStrategy().translate(key, params);
  }

  isLoaded(language) {
    return this.getCurrentStrategy().isLoaded(language);
  }

  getAvailableLanguages() {
    return this.getCurrentStrategy().getAvailableLanguages();
  }
}
