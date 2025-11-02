/**
 * Hook for reactive preferences management
 * Provides reactive access to user preferences
 */

import { useState, useEffect, useCallback } from 'react';
import { useServices } from '../contexts/ServicesContext.jsx';
import { StateObserver } from '../state/Observer.js';
import Logger from '../utils/Logger.js';

/**
 * Hook for preferences management
 * @returns {object} - Preferences state and actions
 */
export const usePreferences = () => {
  const services = useServices();
  const { preferencesState } = services;
  
  // Initialize state with values from preferencesState if available, otherwise use defaults
  const getInitialPreferences = () => {
    if (preferencesState && 
        typeof preferencesState.isSoundEnabled === 'function' &&
        typeof preferencesState.getCurrentTheme === 'function') {
      try {
        return {
          soundEnabled: preferencesState.isSoundEnabled(),
          soundVolume: preferencesState.getSoundVolume(),
          vibrationEnabled: preferencesState.isVibrationEnabled(),
          currentTheme: preferencesState.getCurrentTheme(),
          currentLanguage: preferencesState.getCurrentLanguage(),
          selectedTechniqueId: preferencesState.getSelectedTechniqueId(),
          showSettings: preferencesState.getShowSettings(),
          autoStart: preferencesState.getAutoStart(),
          notificationsEnabled: preferencesState.getNotificationsEnabled(),
          reducedMotion: preferencesState.getReducedMotion(),
          highContrast: preferencesState.getHighContrast(),
          fontSize: preferencesState.getFontSize(),
          colorBlindMode: preferencesState.getColorBlindMode(),
          accessibilityMode: preferencesState.getAccessibilityMode()
        };
      } catch (error) {
        Logger.warn("hook", 'Failed to load preferences from state, using defaults:', error);
      }
    }
    
    // Default values as fallback
    return {
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
    };
  };

  // Local state to track preferences changes
  const [preferences, setPreferences] = useState(getInitialPreferences);

  // Update preferences when preferencesState becomes available
  useEffect(() => {
    if (preferencesState && 
        typeof preferencesState.isSoundEnabled === 'function' &&
        typeof preferencesState.getShowSettings === 'function' &&
        typeof preferencesState.getCurrentLanguage === 'function' &&
        typeof preferencesState.getSelectedTechniqueId === 'function') {
      try {
        setPreferences({
          soundEnabled: preferencesState.isSoundEnabled(),
          soundVolume: preferencesState.getSoundVolume(),
          vibrationEnabled: preferencesState.isVibrationEnabled(),
          currentTheme: preferencesState.getCurrentTheme(),
          currentLanguage: preferencesState.getCurrentLanguage(),
          selectedTechniqueId: preferencesState.getSelectedTechniqueId(),
          showSettings: preferencesState.getShowSettings(),
          autoStart: preferencesState.getAutoStart(),
          notificationsEnabled: preferencesState.getNotificationsEnabled(),
          reducedMotion: preferencesState.getReducedMotion(),
          highContrast: preferencesState.getHighContrast(),
          fontSize: preferencesState.getFontSize(),
          colorBlindMode: preferencesState.getColorBlindMode(),
          accessibilityMode: preferencesState.getAccessibilityMode()
        });
      } catch (error) {
        Logger.warn("hook", 'Failed to load preferences from state:', error);
      }
    }
  }, [preferencesState]);

  // Subscribe to preferences changes
  useEffect(() => {
    if (!preferencesState || typeof preferencesState.addObserver !== 'function') {
      Logger.warn("hook", 'usePreferences: preferencesState not available or addObserver not a function');
      return;
    }

    Logger.debug("hook", 'usePreferences: Setting up observer...');

    // Create observer to listen for state changes
    const observer = new StateObserver((data) => {
      Logger.debug("hook", 'Preferences observer update received:', data);
      if (data && data.currentState) {
        Logger.debug("hook", 'Updating preferences state with:', data.currentState);
        setPreferences({
          soundEnabled: data.currentState.soundEnabled,
          soundVolume: data.currentState.soundVolume,
          vibrationEnabled: data.currentState.vibrationEnabled,
          currentTheme: data.currentState.currentTheme,
          currentLanguage: data.currentState.currentLanguage,
          selectedTechniqueId: data.currentState.selectedTechniqueId,
          showSettings: data.currentState.showSettings,
          autoStart: data.currentState.autoStart,
          notificationsEnabled: data.currentState.notificationsEnabled,
          reducedMotion: data.currentState.reducedMotion,
          highContrast: data.currentState.highContrast,
          fontSize: data.currentState.fontSize,
          colorBlindMode: data.currentState.colorBlindMode,
          accessibilityMode: data.currentState.accessibilityMode
        });
      }
    });

    // Subscribe to changes
    preferencesState.addObserver(observer);
    Logger.debug("hook", 'usePreferences: Observer added, count:', preferencesState.getObserverCount());

    // Cleanup
    return () => {
      Logger.debug("hook", 'usePreferences: Removing observer...');
      preferencesState.removeObserver(observer);
    };
  }, [preferencesState]);

  // Actions
  const setSoundEnabled = useCallback((enabled) => {
    Logger.debug("hook", 'usePreferences.setSoundEnabled called with:', enabled);
    if (preferencesState && typeof preferencesState.setSoundEnabled === 'function') {
      Logger.debug("hook", 'Calling preferencesState.setSoundEnabled...');
      preferencesState.setSoundEnabled(enabled);
      Logger.debug("hook", 'Sound enabled set successfully');
    } else {
      Logger.warn("hook", 'preferencesState.setSoundEnabled not available');
    }
  }, [preferencesState]);

  const setSoundVolume = useCallback((volume) => {
    Logger.debug("hook", 'usePreferences.setSoundVolume called with:', volume);
    if (preferencesState && typeof preferencesState.setSoundVolume === 'function') {
      preferencesState.setSoundVolume(volume);
    }
  }, [preferencesState]);

  const setVibrationEnabled = useCallback((enabled) => {
    Logger.debug("hook", 'usePreferences.setVibrationEnabled called with:', enabled);
    if (preferencesState && typeof preferencesState.setVibrationEnabled === 'function') {
      Logger.debug("hook", 'Calling preferencesState.setVibrationEnabled...');
      preferencesState.setVibrationEnabled(enabled);
      Logger.debug("hook", 'Vibration enabled set successfully');
    } else {
      Logger.warn("hook", 'preferencesState.setVibrationEnabled not available');
    }
  }, [preferencesState]);

  const setCurrentTheme = useCallback((theme) => {
    Logger.debug("hook", 'usePreferences.setCurrentTheme called with:', theme);
    if (preferencesState && typeof preferencesState.setCurrentTheme === 'function') {
      Logger.debug("hook", 'Calling preferencesState.setCurrentTheme...');
      preferencesState.setCurrentTheme(theme);
      Logger.debug("hook", 'Current theme set successfully');
    } else {
      Logger.warn("hook", 'preferencesState.setCurrentTheme not available');
    }
  }, [preferencesState]);

  const setCurrentLanguage = useCallback((language) => {
    if (preferencesState && typeof preferencesState.setCurrentLanguage === 'function') {
      preferencesState.setCurrentLanguage(language);
    }
  }, [preferencesState]);

  const setSelectedTechniqueId = useCallback((techniqueId) => {
    if (preferencesState && typeof preferencesState.setSelectedTechniqueId === 'function') {
      preferencesState.setSelectedTechniqueId(techniqueId);
    }
  }, [preferencesState]);

  const setShowSettings = useCallback((show) => {
    if (preferencesState && typeof preferencesState.setShowSettings === 'function') {
      preferencesState.setShowSettings(show);
    }
  }, [preferencesState]);

  const setAutoStart = useCallback((autoStart) => {
    if (preferencesState && typeof preferencesState.setAutoStart === 'function') {
      preferencesState.setAutoStart(autoStart);
    }
  }, [preferencesState]);

  const setNotificationsEnabled = useCallback((enabled) => {
    if (preferencesState && typeof preferencesState.setNotificationsEnabled === 'function') {
      preferencesState.setNotificationsEnabled(enabled);
    }
  }, [preferencesState]);

  const setReducedMotion = useCallback((reduced) => {
    if (preferencesState && typeof preferencesState.setReducedMotion === 'function') {
      preferencesState.setReducedMotion(reduced);
    }
  }, [preferencesState]);

  const setHighContrast = useCallback((high) => {
    if (preferencesState && typeof preferencesState.setHighContrast === 'function') {
      preferencesState.setHighContrast(high);
    }
  }, [preferencesState]);

  const setFontSize = useCallback((size) => {
    if (preferencesState && typeof preferencesState.setFontSize === 'function') {
      preferencesState.setFontSize(size);
    }
  }, [preferencesState]);

  const setColorBlindMode = useCallback((enabled) => {
    if (preferencesState && typeof preferencesState.setColorBlindMode === 'function') {
      preferencesState.setColorBlindMode(enabled);
    }
  }, [preferencesState]);

  const setAccessibilityMode = useCallback((enabled) => {
    if (preferencesState && typeof preferencesState.setAccessibilityMode === 'function') {
      preferencesState.setAccessibilityMode(enabled);
    }
  }, [preferencesState]);

  const updatePreferences = useCallback((updates) => {
    if (preferencesState && typeof preferencesState.updatePreferences === 'function') {
      preferencesState.updatePreferences(updates);
    }
  }, [preferencesState]);

  const resetToDefaults = useCallback(() => {
    if (preferencesState && typeof preferencesState.resetToDefaults === 'function') {
      preferencesState.resetToDefaults();
    }
  }, [preferencesState]);

  return {
    // State
    ...preferences,
    
    // Actions
    setSoundEnabled: setSoundEnabled || (() => {}),
    setSoundVolume: setSoundVolume || (() => {}),
    setVibrationEnabled: setVibrationEnabled || (() => {}),
    setCurrentTheme: setCurrentTheme || (() => {}),
    setCurrentLanguage: setCurrentLanguage || (() => {}),
    setSelectedTechniqueId: setSelectedTechniqueId || (() => {}),
    setShowSettings: setShowSettings || (() => {}),
    setAutoStart: setAutoStart || (() => {}),
    setNotificationsEnabled: setNotificationsEnabled || (() => {}),
    setReducedMotion: setReducedMotion || (() => {}),
    setHighContrast: setHighContrast || (() => {}),
    setFontSize: setFontSize || (() => {}),
    setColorBlindMode: setColorBlindMode || (() => {}),
    setAccessibilityMode: setAccessibilityMode || (() => {}),
    updatePreferences: updatePreferences || (() => {}),
    resetToDefaults: resetToDefaults || (() => {})
  };
};
