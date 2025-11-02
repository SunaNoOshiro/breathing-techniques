/**
 * User Preferences State
 * Manages user preferences state following Single Responsibility Principle
 */

import { StateManager } from './Observer.js';
import { AppError, ERROR_CODES } from '../errors/AppError.js';
import Logger from '../utils/Logger.js';

/**
 * User Preferences State class
 * Manages user preferences and settings
 */
export class UserPreferencesState extends StateManager {
  constructor() {
    super({
      soundEnabled: true,
      soundVolume: 0.25,
      vibrationEnabled: false,
      currentTheme: 'dark',
      currentLanguage: 'en',
      selectedTechniqueId: 'box4',
      showSettings: false,
      autoStart: false,
      notificationsEnabled: true,
      reducedMotion: false,
      highContrast: false,
      fontSize: 'medium',
      colorBlindMode: false,
      accessibilityMode: false
    });
    
    this.storageKey = 'breathing-app-preferences';
  }

  /**
   * Set sound enabled state
   * @param {boolean} enabled - Whether sound is enabled
   */
  setSoundEnabled(enabled) {
    this.setState({ soundEnabled: enabled });
  }

  /**
   * Set sound volume
   * @param {number} volume - Volume level (0-1)
   */
  setSoundVolume(volume) {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.setState({ soundVolume: clampedVolume });
  }

  /**
   * Set vibration enabled state
   * @param {boolean} enabled - Whether vibration is enabled
   */
  setVibrationEnabled(enabled) {
    this.setState({ vibrationEnabled: enabled });
  }

  /**
   * Set current theme
   * @param {string} theme - Theme key
   */
  setCurrentTheme(theme) {
    Logger.debug('UserPreferencesState.setCurrentTheme called with:', theme);
    Logger.debug('Current state before update:', this.state);
    this.setState({ currentTheme: theme });
    Logger.debug('Current state after update:', this.state);
  }

  /**
   * Set current language
   * @param {string} language - Language code
   */
  setCurrentLanguage(language) {
    this.setState({ currentLanguage: language });
  }

  /**
   * Set selected technique ID
   * @param {string} techniqueId - Technique ID
   */
  setSelectedTechniqueId(techniqueId) {
    this.setState({ selectedTechniqueId: techniqueId });
  }

  /**
   * Get selected technique ID
   * @returns {string} - Selected technique ID
   */
  getSelectedTechniqueId() {
    return this.state.selectedTechniqueId || 'box4';
  }

  /**
   * Set show settings state
   * @param {boolean} show - Whether to show settings
   */
  setShowSettings(show) {
    this.setState({ showSettings: show });
  }

  /**
   * Set auto start state
   * @param {boolean} autoStart - Whether to auto start sessions
   */
  setAutoStart(autoStart) {
    this.setState({ autoStart: autoStart });
  }

  /**
   * Set notifications enabled state
   * @param {boolean} enabled - Whether notifications are enabled
   */
  setNotificationsEnabled(enabled) {
    this.setState({ notificationsEnabled: enabled });
  }

  /**
   * Set reduced motion preference
   * @param {boolean} reduced - Whether to reduce motion
   */
  setReducedMotion(reduced) {
    this.setState({ reducedMotion: reduced });
  }

  /**
   * Set high contrast mode
   * @param {boolean} enabled - Whether high contrast is enabled
   */
  setHighContrast(enabled) {
    this.setState({ highContrast: enabled });
  }

  /**
   * Set font size
   * @param {string} size - Font size ('small', 'medium', 'large')
   */
  setFontSize(size) {
    const validSizes = ['small', 'medium', 'large'];
    if (!validSizes.includes(size)) {
      throw new AppError(
        `Invalid font size: ${size}`,
        ERROR_CODES.CONFIGURATION_INVALID,
        { size, validSizes }
      );
    }
    this.setState({ fontSize: size });
  }

  /**
   * Set color blind mode
   * @param {boolean} enabled - Whether color blind mode is enabled
   */
  setColorBlindMode(enabled) {
    this.setState({ colorBlindMode: enabled });
  }

  /**
   * Set accessibility mode
   * @param {boolean} enabled - Whether accessibility mode is enabled
   */
  setAccessibilityMode(enabled) {
    this.setState({ accessibilityMode: enabled });
  }

  /**
   * Get sound preferences
   * @returns {object} - Sound preferences
   */
  getSoundPreferences() {
    return {
      enabled: this.state.soundEnabled,
      volume: this.state.soundVolume
    };
  }

  /**
   * Get vibration preferences
   * @returns {object} - Vibration preferences
   */
  getVibrationPreferences() {
    return {
      enabled: this.state.vibrationEnabled
    };
  }

  /**
   * Get theme preferences
   * @returns {object} - Theme preferences
   */
  getThemePreferences() {
    return {
      currentTheme: this.state.currentTheme,
      highContrast: this.state.highContrast,
      colorBlindMode: this.state.colorBlindMode
    };
  }

  /**
   * Get language preferences
   * @returns {object} - Language preferences
   */
  getLanguagePreferences() {
    return {
      currentLanguage: this.state.currentLanguage
    };
  }

  /**
   * Get accessibility preferences
   * @returns {object} - Accessibility preferences
   */
  getAccessibilityPreferences() {
    return {
      reducedMotion: this.state.reducedMotion,
      highContrast: this.state.highContrast,
      fontSize: this.state.fontSize,
      colorBlindMode: this.state.colorBlindMode,
      accessibilityMode: this.state.accessibilityMode
    };
  }

  /**
   * Get UI preferences
   * @returns {object} - UI preferences
   */
  getUIPreferences() {
    return {
      showSettings: this.state.showSettings,
      autoStart: this.state.autoStart,
      notificationsEnabled: this.state.notificationsEnabled
    };
  }

  /**
   * Get all preferences
   * @returns {object} - All preferences
   */
  getAllPreferences() {
    return {
      sound: this.getSoundPreferences(),
      vibration: this.getVibrationPreferences(),
      theme: this.getThemePreferences(),
      language: this.getLanguagePreferences(),
      accessibility: this.getAccessibilityPreferences(),
      ui: this.getUIPreferences()
    };
  }

  /**
   * Update multiple preferences at once
   * @param {object} preferences - Preferences object
   */
  updatePreferences(preferences) {
    const validKeys = [
      'soundEnabled', 'soundVolume', 'vibrationEnabled', 'currentTheme',
      'currentLanguage', 'selectedTechniqueId', 'showSettings', 'autoStart', 'notificationsEnabled',
      'reducedMotion', 'highContrast', 'fontSize', 'colorBlindMode',
      'accessibilityMode'
    ];

    const updates = {};
    
    Object.keys(preferences).forEach(key => {
      if (validKeys.includes(key)) {
        updates[key] = preferences[key];
      } else {
        Logger.warn(`Invalid preference key: ${key}`);
      }
    });

    this.setState(updates);
  }

  /**
   * Reset preferences to defaults
   */
  resetToDefaults() {
    this.setState({
      soundEnabled: true,
      soundVolume: 0.25,
      vibrationEnabled: false,
      currentTheme: 'dark',
      currentLanguage: 'en',
      showSettings: false,
      autoStart: false,
      notificationsEnabled: true,
      reducedMotion: false,
      highContrast: false,
      fontSize: 'medium',
      colorBlindMode: false,
      accessibilityMode: false
    });
  }

  /**
   * Check if sound is enabled
   * @returns {boolean} - True if sound is enabled
   */
  isSoundEnabled() {
    return this.state.soundEnabled;
  }

  /**
   * Check if vibration is enabled
   * @returns {boolean} - True if vibration is enabled
   */
  isVibrationEnabled() {
    return this.state.vibrationEnabled;
  }

  /**
   * Check if notifications are enabled
   * @returns {boolean} - True if notifications are enabled
   */
  areNotificationsEnabled() {
    return this.state.notificationsEnabled;
  }

  /**
   * Check if reduced motion is preferred
   * @returns {boolean} - True if reduced motion is preferred
   */
  prefersReducedMotion() {
    return this.state.reducedMotion;
  }

  /**
   * Check if high contrast is enabled
   * @returns {boolean} - True if high contrast is enabled
   */
  isHighContrastEnabled() {
    return this.state.highContrast;
  }

  /**
   * Check if color blind mode is enabled
   * @returns {boolean} - True if color blind mode is enabled
   */
  isColorBlindModeEnabled() {
    return this.state.colorBlindMode;
  }

  /**
   * Check if accessibility mode is enabled
   * @returns {boolean} - True if accessibility mode is enabled
   */
  isAccessibilityModeEnabled() {
    return this.state.accessibilityMode;
  }

  /**
   * Get current theme
   * @returns {string} - Current theme key
   */
  getCurrentTheme() {
    return this.state.currentTheme;
  }

  /**
   * Get current language
   * @returns {string} - Current language code
   */
  getCurrentLanguage() {
    return this.state.currentLanguage;
  }

  /**
   * Get sound volume
   * @returns {number} - Sound volume (0-1)
   */
  getSoundVolume() {
    return this.state.soundVolume;
  }

  /**
   * Get font size
   * @returns {string} - Font size
   */
  getFontSize() {
    return this.state.fontSize;
  }

  /**
   * Get show settings state
   * @returns {boolean} - Whether to show settings
   */
  getShowSettings() {
    return this.state.showSettings;
  }

  /**
   * Get auto start state
   * @returns {boolean} - Whether to auto start
   */
  getAutoStart() {
    return this.state.autoStart;
  }

  /**
   * Get notifications enabled state
   * @returns {boolean} - Whether notifications are enabled
   */
  getNotificationsEnabled() {
    return this.state.notificationsEnabled;
  }

  /**
   * Get reduced motion state
   * @returns {boolean} - Whether reduced motion is enabled
   */
  getReducedMotion() {
    return this.state.reducedMotion;
  }

  /**
   * Get high contrast state
   * @returns {boolean} - Whether high contrast is enabled
   */
  getHighContrast() {
    return this.state.highContrast;
  }

  /**
   * Get color blind mode state
   * @returns {boolean} - Whether color blind mode is enabled
   */
  getColorBlindMode() {
    return this.state.colorBlindMode;
  }

  /**
   * Get accessibility mode state
   * @returns {boolean} - Whether accessibility mode is enabled
   */
  getAccessibilityMode() {
    return this.state.accessibilityMode;
  }

  /**
   * Get font size multiplier
   * @returns {number} - Font size multiplier
   */
  getFontSizeMultiplier() {
    const multipliers = {
      small: 0.875,
      medium: 1,
      large: 1.125
    };
    return multipliers[this.state.fontSize] || 1;
  }

  /**
   * Validate preferences
   * @returns {boolean} - True if preferences are valid
   */
  validatePreferences() {
    try {
      // Validate sound volume
      if (typeof this.state.soundVolume !== 'number' || 
          this.state.soundVolume < 0 || 
          this.state.soundVolume > 1) {
        throw new AppError(
          'Sound volume must be between 0 and 1',
          ERROR_CODES.CONFIGURATION_INVALID,
          { volume: this.state.soundVolume }
        );
      }

      // Validate font size
      const validFontSizes = ['small', 'medium', 'large'];
      if (!validFontSizes.includes(this.state.fontSize)) {
        throw new AppError(
          'Invalid font size',
          ERROR_CODES.CONFIGURATION_INVALID,
          { fontSize: this.state.fontSize, validSizes: validFontSizes }
        );
      }

      // Validate boolean properties
      const booleanProps = [
        'soundEnabled', 'vibrationEnabled', 'showSettings', 'autoStart',
        'notificationsEnabled', 'reducedMotion', 'highContrast',
        'colorBlindMode', 'accessibilityMode'
      ];

      for (const prop of booleanProps) {
        if (typeof this.state[prop] !== 'boolean') {
          throw new AppError(
            `${prop} must be boolean`,
            ERROR_CODES.CONFIGURATION_INVALID,
            { property: prop, value: this.state[prop] }
          );
        }
      }

      return true;
    } catch (error) {
      Logger.error('Preferences validation failed:', error);
      return false;
    }
  }

  /**
   * Export preferences
   * @returns {object} - Preferences for export
   */
  exportPreferences() {
    return {
      preferences: this.getAllPreferences(),
      timestamp: Date.now(),
      version: '1.0'
    };
  }

  /**
   * Import preferences
   * @param {object} data - Preferences data to import
   */
  importPreferences(data) {
    if (data.preferences) {
      this.updatePreferences(data.preferences);
    }
  }

  /**
   * Get preferences summary
   * @returns {object} - Preferences summary
   */
  getPreferencesSummary() {
    return {
      soundEnabled: this.state.soundEnabled,
      vibrationEnabled: this.state.vibrationEnabled,
      theme: this.state.currentTheme,
      language: this.state.currentLanguage,
      accessibilityMode: this.state.accessibilityMode,
      fontSize: this.state.fontSize
    };
  }

  /**
   * Load preferences from localStorage
   * @returns {Promise<void>}
   */
  async loadPreferences() {
    try {
      const savedPreferences = localStorage.getItem(this.storageKey);
      if (savedPreferences) {
        const preferences = JSON.parse(savedPreferences);
        
        // Normalize preferences to handle old data structures
        const normalized = this.normalizePreferences(preferences);
        
        this.updatePreferences(normalized);
      }
    } catch (error) {
      Logger.warn('Failed to load preferences from localStorage:', error);
    }
  }

  /**
   * Normalize preferences to handle different data structures
   * @param {object} preferences - Raw preferences data
   * @returns {object} - Normalized preferences
   */
  normalizePreferences(preferences) {
    const normalized = {};
    
    // Handle currentTheme - it should be a string, not an object
    if (preferences.currentTheme) {
      if (typeof preferences.currentTheme === 'string') {
        normalized.currentTheme = preferences.currentTheme;
      } else if (typeof preferences.currentTheme === 'object') {
        // If it's an object, try to extract the theme key
        normalized.currentTheme = preferences.currentTheme.currentTheme || 
                                   preferences.currentTheme.key || 
                                   'dark';
      }
    }
    
    // Handle nested theme object (old structure)
    if (preferences.theme && typeof preferences.theme === 'object') {
      normalized.currentTheme = preferences.theme.currentTheme || 'dark';
    }
    
    // Handle other boolean and primitive values
    const simpleKeys = [
      'soundEnabled', 'soundVolume', 'vibrationEnabled', 'currentLanguage',
      'selectedTechniqueId', 'showSettings', 'autoStart', 'notificationsEnabled',
      'reducedMotion', 'highContrast', 'fontSize', 'colorBlindMode', 'accessibilityMode'
    ];
    
    simpleKeys.forEach(key => {
      if (preferences[key] !== undefined) {
        normalized[key] = preferences[key];
      }
    });
    
    return normalized;
  }

  /**
   * Save preferences to localStorage
   * @returns {Promise<void>}
   */
  async savePreferences() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (error) {
      Logger.warn('Failed to save preferences to localStorage:', error);
    }
  }

  /**
   * Initialize preferences state
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      await this.loadPreferences();
      
      // Validate loaded preferences
      if (!this.validatePreferences()) {
        Logger.warn('Loaded preferences are invalid, resetting to defaults');
        this.resetToDefaults();
      }
    } catch (error) {
      Logger.error('Failed to initialize preferences, using defaults:', error);
      this.resetToDefaults();
    }
  }

  /**
   * Override setState to auto-save preferences
   * @param {object} newState - New state to set
   */
  setState(newState) {
    Logger.debug('UserPreferencesState.setState called with:', newState);
    Logger.debug('Current state before setState:', this.state);
    super.setState(newState);
    Logger.debug('Current state after setState:', this.state);
    // Auto-save preferences when state changes
    this.savePreferences().catch(error => {
      Logger.warn('Failed to auto-save preferences:', error);
    });
  }
}
