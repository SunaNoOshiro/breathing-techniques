/**
 * Theme Service
 * Manages application themes following Single Responsibility Principle
 */

import { ServiceError, ERROR_CODES } from '../errors/AppError.js';
import { errorHandler } from '../errors/ErrorHandler.js';
import { StorageAdapter } from '../adapters/StorageAdapter.js';

/**
 * Theme Service class
 * Manages theme data, switching, and persistence
 */
export class ThemeService {
  constructor(storageAdapter) {
    this.storageAdapter = storageAdapter;
    this.currentTheme = 'dark';
    this.themes = new Map();
    this.defaultThemes = this.createDefaultThemes();
    this.initializeThemes();
  }

  /**
   * Create default themes
   * @returns {Map} - Map of default themes
   */
  createDefaultThemes() {
    const themes = new Map();
    
    themes.set('dark', {
      name: 'Dark',
      colors: {
        bg: '#0b1020',
        panel: '#0f172a',
        text: '#e5e7eb',
        stroke: '#9CA3AF',
        diaphragm: '#4B5563',
        green: '#34D399',
        blue: '#60A5FA',
        red: '#F87171',
        orange: '#F59E0B',
        accent: '#60A5FA',
        border: '#374151',
        shadow: 'rgba(0, 0, 0, 0.1)'
      }
    });

    themes.set('ocean', {
      name: 'Ocean',
      colors: {
        bg: '#0c1445',
        panel: '#1a237e',
        text: '#e8eaf6',
        stroke: '#7986cb',
        diaphragm: '#5c6bc0',
        green: '#4fc3f7',
        blue: '#29b6f6',
        red: '#ef5350',
        orange: '#ff9800',
        accent: '#29b6f6',
        border: '#3949ab',
        shadow: 'rgba(0, 0, 0, 0.2)'
      }
    });

    themes.set('forest', {
      name: 'Forest',
      colors: {
        bg: '#1b2e1b',
        panel: '#2d4a2d',
        text: '#e8f5e8',
        stroke: '#81c784',
        diaphragm: '#66bb6a',
        green: '#4caf50',
        blue: '#2196f3',
        red: '#f44336',
        orange: '#ff9800',
        accent: '#4caf50',
        border: '#388e3c',
        shadow: 'rgba(0, 0, 0, 0.15)'
      }
    });

    themes.set('sunset', {
      name: 'Sunset',
      colors: {
        bg: '#2d1b1b',
        panel: '#4a2d2d',
        text: '#f5e8e8',
        stroke: '#e57373',
        diaphragm: '#ef5350',
        green: '#66bb6a',
        blue: '#42a5f5',
        red: '#f44336',
        orange: '#ff7043',
        accent: '#ff7043',
        border: '#d32f2f',
        shadow: 'rgba(0, 0, 0, 0.2)'
      }
    });

    themes.set('purple', {
      name: 'Purple',
      colors: {
        bg: '#2d1b2d',
        panel: '#4a2d4a',
        text: '#f5e8f5',
        stroke: '#ba68c8',
        diaphragm: '#ab47bc',
        green: '#66bb6a',
        blue: '#42a5f5',
        red: '#f44336',
        orange: '#ff9800',
        accent: '#ab47bc',
        border: '#8e24aa',
        shadow: 'rgba(0, 0, 0, 0.2)'
      }
    });

    themes.set('light', {
      name: 'Light',
      colors: {
        bg: '#f8fafc',
        panel: '#ffffff',
        text: '#1e293b',
        stroke: '#475569',
        diaphragm: '#64748b',
        green: '#059669',
        blue: '#2563eb',
        red: '#dc2626',
        orange: '#d97706',
        accent: '#2563eb',
        border: '#cbd5e1',
        shadow: 'rgba(0, 0, 0, 0.1)'
      }
    });

    return themes;
  }

  /**
   * Initialize themes
   */
  initializeThemes() {
    // Copy default themes
    for (const [key, theme] of this.defaultThemes) {
      this.themes.set(key, { ...theme });
    }

    // Load custom themes from storage
    this.loadCustomThemes().catch(error => {
      errorHandler.handleError(error);
    });
  }

  /**
   * Load custom themes from storage
   * @returns {Promise<void>}
   */
  async loadCustomThemes() {
    try {
      const customThemes = await this.storageAdapter.safeGet('custom-themes');
      if (customThemes) {
        for (const [key, theme] of Object.entries(customThemes)) {
          this.themes.set(key, theme);
        }
      }
    } catch (error) {
      // Custom themes loading failed, continue with defaults
      errorHandler.handleError(
        new ServiceError(
          'Failed to load custom themes',
          'ThemeService',
          { originalError: error.message }
        )
      );
    }
  }

  /**
   * Save custom themes to storage
   * @returns {Promise<void>}
   */
  async saveCustomThemes() {
    try {
      const customThemes = {};
      for (const [key, theme] of this.themes) {
        if (!this.defaultThemes.has(key)) {
          customThemes[key] = theme;
        }
      }
      await this.storageAdapter.safeSet('custom-themes', customThemes);
    } catch (error) {
      throw new ServiceError(
        'Failed to save custom themes',
        'ThemeService',
        { originalError: error.message }
      );
    }
  }

  /**
   * Get current theme
   * @returns {string} - Current theme key
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Set current theme
   * @param {string} themeKey - Theme key
   * @returns {Promise<void>}
   */
  async setCurrentTheme(themeKey) {
    if (!this.themes.has(themeKey)) {
      throw new ServiceError(
        `Theme '${themeKey}' not found`,
        'ThemeService',
        { themeKey, availableThemes: Array.from(this.themes.keys()) }
      );
    }

    this.currentTheme = themeKey;
    
    // Save to storage
    try {
      await this.storageAdapter.safeSet('breathing-app-theme', themeKey);
    } catch (error) {
      errorHandler.handleError(
        new ServiceError(
          'Failed to save current theme',
          'ThemeService',
          { themeKey, originalError: error.message }
        )
      );
    }
  }

  /**
   * Get theme by key
   * @param {string} themeKey - Theme key
   * @returns {object} - Theme object
   */
  getTheme(themeKey) {
    const theme = this.themes.get(themeKey);
    if (!theme) {
      throw new ServiceError(
        `Theme '${themeKey}' not found`,
        'ThemeService',
        { themeKey, availableThemes: Array.from(this.themes.keys()) }
      );
    }
    return { ...theme };
  }

  /**
   * Get current theme colors
   * @returns {object} - Current theme colors
   */
  getCurrentThemeColors() {
    return this.getTheme(this.currentTheme).colors;
  }

  /**
   * Get all available themes
   * @returns {Array} - Array of theme objects
   */
  getAllThemes() {
    return Array.from(this.themes.entries()).map(([key, theme]) => ({
      key,
      ...theme
    }));
  }

  /**
   * Get theme names for UI
   * @returns {Array} - Array of theme name objects
   */
  getThemeNames() {
    return Array.from(this.themes.entries()).map(([key, theme]) => ({
      key,
      name: theme.name
    }));
  }

  /**
   * Add custom theme
   * @param {string} key - Theme key
   * @param {object} theme - Theme object
   * @returns {Promise<void>}
   */
  async addCustomTheme(key, theme) {
    if (this.defaultThemes.has(key)) {
      throw new ServiceError(
        `Cannot override default theme '${key}'`,
        'ThemeService',
        { key, theme }
      );
    }

    this.themes.set(key, { ...theme });
    await this.saveCustomThemes();
  }

  /**
   * Remove custom theme
   * @param {string} key - Theme key
   * @returns {Promise<void>}
   */
  async removeCustomTheme(key) {
    if (this.defaultThemes.has(key)) {
      throw new ServiceError(
        `Cannot remove default theme '${key}'`,
        'ThemeService',
        { key }
      );
    }

    this.themes.delete(key);
    await this.saveCustomThemes();
  }

  /**
   * Update theme colors
   * @param {string} themeKey - Theme key
   * @param {object} colors - New colors
   * @returns {Promise<void>}
   */
  async updateThemeColors(themeKey, colors) {
    const theme = this.getTheme(themeKey);
    theme.colors = { ...theme.colors, ...colors };
    this.themes.set(themeKey, theme);

    if (!this.defaultThemes.has(themeKey)) {
      await this.saveCustomThemes();
    }
  }

  /**
   * Load current theme from storage
   * @returns {Promise<void>}
   */
  async loadCurrentTheme() {
    try {
      const savedTheme = await this.storageAdapter.safeGet('breathing-app-theme');
      if (savedTheme && this.themes.has(savedTheme)) {
        this.currentTheme = savedTheme;
      }
    } catch (error) {
      errorHandler.handleError(
        new ServiceError(
          'Failed to load current theme',
          'ThemeService',
          { originalError: error.message }
        )
      );
    }
  }

  /**
   * Reset to default theme
   */
  resetToDefault() {
    this.currentTheme = 'dark';
  }

  /**
   * Get theme capabilities
   * @returns {object} - Theme capabilities
   */
  getCapabilities() {
    return {
      currentTheme: this.currentTheme,
      themeCount: this.themes.size,
      defaultThemeCount: this.defaultThemes.size,
      customThemeCount: this.themes.size - this.defaultThemes.size,
      availableThemes: Array.from(this.themes.keys())
    };
  }

  /**
   * Dispose of theme service
   */
  dispose() {
    this.themes.clear();
    this.defaultThemes.clear();
  }
}
