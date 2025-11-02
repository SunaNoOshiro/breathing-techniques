/**
 * Theme Context
 * Provides theme management functionality
 */

import React, { createContext, useContext, useMemo, useEffect, useCallback, useState } from 'react';
import { useServices } from './ServicesContext.jsx';
import { AppError, ERROR_CODES } from '../errors/AppError.js';
import Logger from '../utils/Logger.js';

/**
 * Theme Context
 */
const ThemeContext = createContext(null);

/**
 * Theme Provider Component
 * Provides theme management functionality
 */
export const ThemeProvider = ({ children }) => {
  Logger.debug('ThemeProvider rendering...');
  
  const services = useServices();
  Logger.debug('ThemeProvider: services loaded:', services);
  
  const {
    themeService,
    preferencesState,
    commandInvoker,
    themeStrategyManager
  } = services;
  
  Logger.debug('ThemeProvider: services destructured:', {
    themeService: !!themeService,
    preferencesState: !!preferencesState,
    commandInvoker: !!commandInvoker,
    themeStrategyManager: !!themeStrategyManager
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Initialize with default dark theme colors to prevent empty state
  const [currentThemeColors, setCurrentThemeColors] = useState({
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
  });

  // Initialize theme service
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        Logger.debug('ThemeContext: Initializing theme service...');
        
        if (themeService) {
          await themeService.loadCurrentTheme();
          Logger.debug('ThemeContext: Theme service loaded, current theme:', themeService.getCurrentTheme());
          
          // Apply the loaded theme using strategy manager
          const currentTheme = themeService.getCurrentTheme();
          if (themeStrategyManager && currentTheme) {
            Logger.debug('ThemeContext: Applying loaded theme:', currentTheme);
            themeStrategyManager.applyTheme(currentTheme, {
              rootElement: document.documentElement,
              preferences: preferencesState?.getAllPreferences()
            });
            
            // Update theme colors state
            const colors = themeService.getCurrentThemeColors();
            setCurrentThemeColors(colors);
            Logger.debug('ThemeContext: Theme colors state updated:', colors);
            Logger.debug('ThemeContext: Theme applied successfully');
          }
        }
      } catch (err) {
        Logger.error('ThemeContext: Failed to initialize theme:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    initializeTheme();
  }, [themeService, themeStrategyManager, preferencesState]);

  // Command execution context
  const commandContext = useMemo(() => ({
    preferencesState,
    themeService,
    themeStrategyManager
  }), [preferencesState, themeService, themeStrategyManager]);

  // Theme actions
  const changeTheme = useCallback(async (themeKey) => {
    try {
      setIsLoading(true);
      setError(null);

      const command = new (await import('../commands/Command.js')).ChangeThemeCommand(themeKey);
      const result = await commandInvoker.executeCommand(command, commandContext);
      
      return result;
    } catch (error) {
      setError(error.message);
      throw new AppError(
        'Failed to change theme',
        ERROR_CODES.COMMAND_EXECUTION_FAILED,
        { originalError: error.message }
      );
    } finally {
      setIsLoading(false);
    }
  }, [commandInvoker, commandContext]);

  const setTheme = useCallback(async (themeKey) => {
    try {
      Logger.debug('ThemeContext.setTheme called with:', themeKey, 'type:', typeof themeKey);
      
      // Normalize themeKey to ensure it's a string
      let normalizedThemeKey = themeKey;
      if (typeof themeKey === 'object' && themeKey !== null) {
        Logger.warn('Theme key is an object, attempting to normalize:', themeKey);
        normalizedThemeKey = themeKey.currentTheme || themeKey.key || 'dark';
      } else if (typeof themeKey !== 'string') {
        Logger.warn('Invalid theme key type, using default:', themeKey);
        normalizedThemeKey = 'dark';
      }
      
      Logger.debug('Normalized theme key:', normalizedThemeKey);
      
      if (preferencesState) {
        Logger.debug('Updating preferences state...');
        preferencesState.setCurrentTheme(normalizedThemeKey);
      }
      
      if (themeService) {
        Logger.debug('Updating theme service...');
        await themeService.setCurrentTheme(normalizedThemeKey);
      }

      // Update theme colors state
      const newColors = themeService?.getCurrentThemeColors() || themeStrategyManager?.getThemeColors(normalizedThemeKey) || {};
      setCurrentThemeColors(newColors);
      Logger.debug('Updated theme colors state:', newColors);

      // Apply theme using strategy manager
      if (themeStrategyManager) {
        Logger.debug('Applying theme via strategy manager...');
        themeStrategyManager.applyTheme(normalizedThemeKey, {
          rootElement: document.documentElement,
          preferences: preferencesState?.getAllPreferences()
        });
        Logger.debug('Theme applied successfully');
      } else {
        Logger.warn('Theme strategy manager not available');
      }
    } catch (error) {
      Logger.error('Failed to set theme:', error);
      throw new AppError(
        'Failed to set theme',
        ERROR_CODES.COMMAND_EXECUTION_FAILED,
        { originalError: error.message }
      );
    }
  }, [preferencesState, themeService, themeStrategyManager]);

  const resetTheme = useCallback(async () => {
    try {
      await changeTheme('dark');
    } catch (error) {
      throw new AppError(
        'Failed to reset theme',
        ERROR_CODES.COMMAND_EXECUTION_FAILED,
        { originalError: error.message }
      );
    }
  }, [changeTheme]);

  // Theme getters
  const getCurrentTheme = useCallback(() => {
    return preferencesState?.getCurrentTheme() || 'dark';
  }, [preferencesState]);

  const getCurrentThemeColors = useCallback(() => {
    return currentThemeColors;
  }, [currentThemeColors]);

  const getAllThemes = useCallback(() => {
    return themeService?.getAllThemes() || [];
  }, [themeService]);

  const getThemeNames = useCallback(() => {
    return themeService?.getThemeNames() || [];
  }, [themeService]);

  const getTheme = useCallback((themeKey) => {
    return themeService?.getTheme(themeKey) || null;
  }, [themeService]);

  // Theme validation
  const validateTheme = useCallback((themeKey) => {
    return themeService?.getTheme(themeKey) !== null;
  }, [themeService]);

  // Theme capabilities
  const getThemeCapabilities = useCallback(() => {
    return {
      themeService: themeService?.getCapabilities() || {},
      strategyManager: themeStrategyManager?.getCapabilities() || {},
      currentTheme: getCurrentTheme(),
      availableThemes: getAllThemes().length
    };
  }, [themeService, themeStrategyManager, getCurrentTheme, getAllThemes]);

  // Undo/Redo functionality
  const undoThemeChange = useCallback(async () => {
    try {
      return await commandInvoker.undo(commandContext);
    } catch (error) {
      throw new AppError(
        'Failed to undo theme change',
        ERROR_CODES.COMMAND_EXECUTION_FAILED,
        { originalError: error.message }
      );
    }
  }, [commandInvoker, commandContext]);

  const redoThemeChange = useCallback(async () => {
    try {
      return await commandInvoker.redo(commandContext);
    } catch (error) {
      throw new AppError(
        'Failed to redo theme change',
        ERROR_CODES.COMMAND_EXECUTION_FAILED,
        { originalError: error.message }
      );
    }
  }, [commandInvoker, commandContext]);

  // Custom theme management
  const addCustomTheme = useCallback(async (key, theme) => {
    try {
      if (themeService) {
        await themeService.addCustomTheme(key, theme);
      }
    } catch (error) {
      throw new AppError(
        'Failed to add custom theme',
        ERROR_CODES.COMMAND_EXECUTION_FAILED,
        { originalError: error.message }
      );
    }
  }, [themeService]);

  const removeCustomTheme = useCallback(async (key) => {
    try {
      if (themeService) {
        await themeService.removeCustomTheme(key);
      }
    } catch (error) {
      throw new AppError(
        'Failed to remove custom theme',
        ERROR_CODES.COMMAND_EXECUTION_FAILED,
        { originalError: error.message }
      );
    }
  }, [themeService]);

  const updateThemeColors = useCallback(async (themeKey, colors) => {
    try {
      if (themeService) {
        await themeService.updateThemeColors(themeKey, colors);
      }
    } catch (error) {
      throw new AppError(
        'Failed to update theme colors',
        ERROR_CODES.COMMAND_EXECUTION_FAILED,
        { originalError: error.message }
      );
    }
  }, [themeService]);

  // Theme strategy management
  const setThemeStrategy = useCallback((strategyName) => {
    try {
      if (themeStrategyManager) {
        themeStrategyManager.setCurrentStrategy(strategyName);
      }
    } catch (error) {
      throw new AppError(
        'Failed to set theme strategy',
        ERROR_CODES.COMMAND_EXECUTION_FAILED,
        { originalError: error.message }
      );
    }
  }, [themeStrategyManager]);

  const getCurrentThemeStrategy = useCallback(() => {
    return themeStrategyManager?.getCurrentStrategy() || null;
  }, [themeStrategyManager]);

  const getAllThemeStrategies = useCallback(() => {
    return themeStrategyManager?.getAllStrategies() || [];
  }, [themeStrategyManager]);

  const contextValue = useMemo(() => {
    // Ensure we always return a valid context object
    const value = {
      // State
      isLoading,
      error,
      
      // Theme service
      themeService,
      themeStrategyManager,
      
      // Theme actions
      changeTheme,
      setTheme,
      resetTheme,
      
      // Theme getters
      getCurrentTheme,
      getCurrentThemeColors,
      getAllThemes,
      getThemeNames,
      getTheme,
      validateTheme,
      
      // Theme capabilities
      getThemeCapabilities,
      
      // Undo/Redo
      undoThemeChange,
      redoThemeChange,
      
      // Custom theme management
      addCustomTheme,
      removeCustomTheme,
      updateThemeColors,
      
      // Theme strategy management
      setThemeStrategy,
      getCurrentThemeStrategy,
      getAllThemeStrategies
    };
    
    Logger.debug('ThemeProvider contextValue created:', value);
    return value;
  }, [
    isLoading,
    error,
    currentThemeColors,
    themeService,
    themeStrategyManager,
    changeTheme,
    setTheme,
    resetTheme,
    getCurrentTheme,
    getCurrentThemeColors,
    getAllThemes,
    getThemeNames,
    getTheme,
    validateTheme,
    getThemeCapabilities,
    undoThemeChange,
    redoThemeChange,
    addCustomTheme,
    removeCustomTheme,
    updateThemeColors,
    setThemeStrategy,
    getCurrentThemeStrategy,
    getAllThemeStrategies
  ]);

  Logger.debug('ThemeProvider: About to render Provider with value:', contextValue);
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to use theme context
 * @returns {object} - Theme context value
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  Logger.debug('useTheme called, context:', context);
  Logger.debug('ThemeContext:', ThemeContext);
  
  if (!context) {
    Logger.error('ThemeContext is null or undefined!');
    throw new AppError(
      'useTheme must be used within a ThemeProvider',
      ERROR_CODES.DEPENDENCY_INJECTION_FAILED
    );
  }
  
  return context;
};

/**
 * Hook to use theme state
 * @returns {object} - Theme state and actions
 */
export const useThemeState = () => {
  const theme = useTheme();
  
  return {
    // State
    currentTheme: theme.getCurrentTheme(),
    currentColors: theme.getCurrentThemeColors(),
    isLoading: theme.isLoading,
    error: theme.error,
    
    // Actions
    changeTheme: theme.changeTheme,
    setTheme: theme.setTheme,
    resetTheme: theme.resetTheme,
    
    // Theme data
    allThemes: theme.getAllThemes(),
    themeNames: theme.getThemeNames(),
    
    // Validation
    validateTheme: theme.validateTheme,
    
    // Capabilities
    capabilities: theme.getThemeCapabilities()
  };
};

/**
 * Hook to use theme colors
 * @returns {object} - Current theme colors
 */
export const useThemeColors = () => {
  const theme = useTheme();
  const colors = theme.getCurrentThemeColors();
  
  // Fallback to default dark theme colors if not available
  if (!colors || Object.keys(colors).length === 0) {
    return {
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
    };
  }
  
  return colors;
};

/**
 * Hook to use theme management
 * @returns {object} - Theme management functions
 */
export const useThemeManagement = () => {
  const theme = useTheme();
  
  return {
    // Custom themes
    addCustomTheme: theme.addCustomTheme,
    removeCustomTheme: theme.removeCustomTheme,
    updateThemeColors: theme.updateThemeColors,
    
    // Strategy management
    setThemeStrategy: theme.setThemeStrategy,
    getCurrentThemeStrategy: theme.getCurrentThemeStrategy,
    getAllThemeStrategies: theme.getAllThemeStrategies,
    
    // Undo/Redo
    undoThemeChange: theme.undoThemeChange,
    redoThemeChange: theme.redoThemeChange
  };
};

export default ThemeContext;
