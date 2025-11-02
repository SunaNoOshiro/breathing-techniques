/**
 * Custom Hooks
 * Provides reusable hooks for common functionality following Composition pattern
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useServices } from '../contexts/ServicesContext.jsx';
import { useBreathing } from '../contexts/BreathingContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useLocalization } from '../contexts/LocalizationContext.jsx';
import { BREAKPOINT_UTILS } from '../design/breakpoints.js';
import { AppError, ERROR_CODES } from '../errors/AppError.js';
import Logger from '../utils/Logger.js';

/**
 * Hook for breathing session management
 * @returns {object} - Breathing session state and actions
 */
export const useBreathingSession = () => {
  const breathing = useBreathing();
  const [sessionState, setSessionState] = useState({
    isRunning: false,
    isPaused: false,
    isActive: false,
    currentPhase: null,
    sessionStats: {},
    progress: 0,
    cycleProgress: 0
  });
  
  // Subscribe to session state changes
  useEffect(() => {
    if (!breathing || !breathing.sessionState) {
      Logger.warn("hook", 'useBreathingSession: breathing or sessionState not available');
      return;
    }
    
    const updateState = () => {
      try {
        const newState = {
          isRunning: breathing.isSessionRunning(),
          isPaused: breathing.isSessionPaused(),
          isActive: breathing.isSessionActive(),
          currentPhase: breathing.getCurrentPhase(),
          sessionStats: breathing.getSessionStats(),
          progress: breathing.getSessionProgress(),
          cycleProgress: breathing.getCycleProgress()
        };
        Logger.debug("hook", 'useBreathingSession: Updating state:', newState);
        setSessionState(newState);
      } catch (error) {
        Logger.error("hook", 'useBreathingSession: Error updating state:', error);
      }
    };
    
    // Update immediately
    updateState();
    
    // Subscribe to changes
    const unsubscribe = breathing.sessionState.subscribe(() => {
      Logger.debug("hook", 'useBreathingSession: Received state update from sessionState');
      updateState();
    });
    
    return () => {
      Logger.debug("hook", 'useBreathingSession: Cleaning up subscription');
      unsubscribe();
    };
  }, [breathing]);
  
  return {
    // State
    ...sessionState,
    
    // Actions
    start: breathing?.startSession,
    pause: breathing?.pauseSession,
    resume: breathing?.resumeSession,
    stop: breathing?.stopSession,
    reset: breathing?.resetSession,
    changeTechnique: breathing?.changeTechnique,
    
    // Undo/Redo
    undo: breathing?.undo,
    redo: breathing?.redo,
    canUndo: breathing?.canUndo(),
    canRedo: breathing?.canRedo(),
    
    // History
    commandHistory: breathing?.getCommandHistory()
  };
};

/**
 * Hook for technique management
 * @returns {object} - Technique state and actions
 */
export const useTechnique = () => {
  const { sessionState, visualizationStrategyManager, preferencesState } = useServices();
  
  const [currentTechnique, setCurrentTechnique] = useState(null);
  const [visualizationPoints, setVisualizationPoints] = useState([]);
  
  // Update current technique when session state or preferences change
  useEffect(() => {
    const updateTechnique = async () => {
      try {
        let technique = null;
        let techniqueId = null;
        
        Logger.debug("hook", 'useTechnique: Updating technique...');
        Logger.debug("hook", 'useTechnique: sessionState.technique:', sessionState?.state.technique);
        Logger.debug("hook", 'useTechnique: sessionState.currentTechniqueId:', sessionState?.state.currentTechniqueId);
        
        // First try to get technique from session state (when session is active)
        if (sessionState?.state.technique) {
          technique = sessionState.state.technique;
          Logger.debug("hook", 'useTechnique: Using technique from sessionState:', technique.getId());
        } 
        // If no session technique, try to get from session state's currentTechniqueId
        else if (sessionState?.state.currentTechniqueId) {
          techniqueId = sessionState.state.currentTechniqueId;
          Logger.debug("hook", 'useTechnique: Loading technique from sessionState ID:', techniqueId);
          const { techniqueRegistry } = await import('../techniques/TechniqueRegistry.js');
          technique = techniqueRegistry.getTechnique(techniqueId);
        }
        // If still no technique, get from preferences
        else if (preferencesState?.getSelectedTechniqueId) {
          techniqueId = preferencesState.getSelectedTechniqueId();
          Logger.debug("hook", 'useTechnique: Loading technique from preferences:', techniqueId);
          const { techniqueRegistry } = await import('../techniques/TechniqueRegistry.js');
          technique = techniqueRegistry.getTechnique(techniqueId);
        }
        // Last resort: default technique
        else {
          Logger.debug("hook", 'useTechnique: Using default technique box4');
          const { techniqueRegistry } = await import('../techniques/TechniqueRegistry.js');
          technique = techniqueRegistry.getTechnique('box4');
        }
        
        if (technique) {
          Logger.debug("hook", 'useTechnique: Setting technique:', technique.getId());
          setCurrentTechnique(technique);
          
          // Generate visualization points
          if (visualizationStrategyManager) {
            const points = visualizationStrategyManager.generatePoints(technique);
            setVisualizationPoints(points);
          }
        }
      } catch (error) {
        Logger.error("hook", 'Failed to update technique:', error);
        // Try to get default technique as fallback
        try {
          const { techniqueRegistry } = await import('../techniques/TechniqueRegistry.js');
          const defaultTechnique = techniqueRegistry.getTechnique('box4');
          if (defaultTechnique) {
            setCurrentTechnique(defaultTechnique);
          }
        } catch (fallbackError) {
          Logger.error("hook", 'Failed to load default technique:', fallbackError);
        }
      }
    };
    
    // Subscribe to session state changes
    if (sessionState) {
      const unsubscribe = sessionState.subscribe(() => {
        updateTechnique();
      });
      
      // Initial update
      updateTechnique();
      
      return unsubscribe;
    } else {
      updateTechnique();
    }
  }, [sessionState, preferencesState, visualizationStrategyManager]);
  
  const getCurrentTechnique = useCallback(() => {
    return currentTechnique;
  }, [currentTechnique]);
  
  const getTechniqueId = useCallback(() => {
    return currentTechnique?.getId() || null;
  }, [currentTechnique]);
  
  const getTechniqueName = useCallback(() => {
    return currentTechnique?.getName() || '';
  }, [currentTechnique]);
  
  const getTechniqueDescription = useCallback(() => {
    return currentTechnique?.getDescription() || '';
  }, [currentTechnique]);
  
  const getTechniqueBenefits = useCallback(() => {
    return currentTechnique?.getBenefits() || '';
  }, [currentTechnique]);
  
  const getTechniquePattern = useCallback(() => {
    return currentTechnique?.getPattern() || '';
  }, [currentTechnique]);
  
  const getTechniquePhases = useCallback(() => {
    return currentTechnique?.getPhases() || [];
  }, [currentTechnique]);
  
  const getTechniqueDurations = useCallback(() => {
    return currentTechnique?.getDurationsSec() || [];
  }, [currentTechnique]);
  
  const getTotalDuration = useCallback(() => {
    return currentTechnique?.getTotalDuration() || 0;
  }, [currentTechnique]);
  
  const getCurrentPhase = useCallback((elapsedSeconds) => {
    return currentTechnique?.getCurrentPhase(elapsedSeconds) || null;
  }, [currentTechnique]);
  
  const validateTechnique = useCallback(() => {
    return currentTechnique?.validate() || false;
  }, [currentTechnique]);
  
  return {
    // State
    currentTechnique,
    visualizationPoints,
    
    // Getters
    getCurrentTechnique,
    getTechniqueId,
    getTechniqueName,
    getTechniqueDescription,
    getTechniqueBenefits,
    getTechniquePattern,
    getTechniquePhases,
    getTechniqueDurations,
    getTotalDuration,
    getCurrentPhase,
    
    // Validation
    validateTechnique
  };
};

/**
 * Hook for theme management
 * @returns {object} - Theme state and actions
 */
export const useThemeManager = () => {
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
 * Hook for responsive design
 * @returns {object} - Responsive state and utilities
 */
export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  const [currentBreakpoint, setCurrentBreakpoint] = useState(
    BREAKPOINT_UTILS.getCurrentBreakpoint()
  );
  
  // Update window size and breakpoint
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
      setCurrentBreakpoint(BREAKPOINT_UTILS.getCurrentBreakpoint());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const isMobile = useMemo(() => BREAKPOINT_UTILS.isMobile(), [windowSize.width]);
  const isTablet = useMemo(() => BREAKPOINT_UTILS.isTablet(), [windowSize.width]);
  const isDesktop = useMemo(() => BREAKPOINT_UTILS.isDesktop(), [windowSize.width]);
  
  const isBreakpoint = useCallback((breakpoint) => {
    return BREAKPOINT_UTILS.isBreakpoint(breakpoint);
  }, [windowSize.width]);
  
  const getResponsiveValue = useCallback((values) => {
    return BREAKPOINT_UTILS.getResponsiveValue(values);
  }, [currentBreakpoint]);
  
  return {
    // State
    windowSize,
    currentBreakpoint,
    
    // Device type checks
    isMobile,
    isTablet,
    isDesktop,
    
    // Utilities
    isBreakpoint,
    getResponsiveValue
  };
};

/**
 * Hook for error handling
 * @returns {object} - Error handling utilities
 */
export const useErrorHandler = () => {
  const { errorHandler } = useServices();
  
  const handleError = useCallback((error, severity = 'medium', category = 'system') => {
    if (errorHandler) {
      return errorHandler.handleError(error, severity, category);
    }
    Logger.error("hook", 'Error handler not available:', error);
  }, [errorHandler]);
  
  const addErrorListener = useCallback((key, callback) => {
    if (errorHandler) {
      errorHandler.addListener(key, callback);
    }
  }, [errorHandler]);
  
  const removeErrorListener = useCallback((key) => {
    if (errorHandler) {
      errorHandler.removeListener(key);
    }
  }, [errorHandler]);
  
  const getErrorHistory = useCallback((limit = 10) => {
    return errorHandler?.getErrorHistory(limit) || [];
  }, [errorHandler]);
  
  const wrapAsync = useCallback((fn, context = {}) => {
    return errorHandler?.wrapAsync(fn, context) || fn;
  }, [errorHandler]);
  
  const wrapSync = useCallback((fn, context = {}) => {
    return errorHandler?.wrapSync(fn, context) || fn;
  }, [errorHandler]);
  
  return {
    handleError,
    addErrorListener,
    removeErrorListener,
    getErrorHistory,
    wrapAsync,
    wrapSync
  };
};

/**
 * Hook for timer management
 * @returns {object} - Timer state and actions
 */
export const useTimer = () => {
  const { timerService } = useServices();
  
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(null);
  
  // Set up timer listeners
  useEffect(() => {
    if (!timerService) return;
    
    const unsubscribeUpdate = timerService.addListener('update', (data) => {
      setCurrentTime(data.currentTime);
      setCurrentPhase(data.currentPhase);
    });
    
    const unsubscribeStart = timerService.addListener('start', () => {
      setIsRunning(true);
      setIsPaused(false);
    });
    
    const unsubscribePause = timerService.addListener('pause', () => {
      setIsRunning(false);
      setIsPaused(true);
    });
    
    const unsubscribeResume = timerService.addListener('resume', () => {
      setIsRunning(true);
      setIsPaused(false);
    });
    
    const unsubscribeStop = timerService.addListener('stop', () => {
      setIsRunning(false);
      setIsPaused(false);
    });
    
    const unsubscribeReset = timerService.addListener('reset', () => {
      setIsRunning(false);
      setIsPaused(false);
      setCurrentTime(0);
      setCurrentPhase(null);
    });
    
    return () => {
      unsubscribeUpdate();
      unsubscribeStart();
      unsubscribePause();
      unsubscribeResume();
      unsubscribeStop();
      unsubscribeReset();
    };
  }, [timerService]);
  
  const start = useCallback(async () => {
    if (timerService) {
      await timerService.start();
    }
  }, [timerService]);
  
  const pause = useCallback(() => {
    if (timerService) {
      timerService.pause();
    }
  }, [timerService]);
  
  const resume = useCallback(() => {
    if (timerService) {
      timerService.resume();
    }
  }, [timerService]);
  
  const stop = useCallback(() => {
    if (timerService) {
      timerService.stop();
    }
  }, [timerService]);
  
  const reset = useCallback(() => {
    if (timerService) {
      timerService.reset();
    }
  }, [timerService]);
  
  const setTechnique = useCallback((technique) => {
    if (timerService) {
      timerService.setTechnique(technique);
    }
  }, [timerService]);
  
  const getState = useCallback(() => {
    return timerService?.getState() || {};
  }, [timerService]);
  
  const getCapabilities = useCallback(() => {
    return timerService?.getCapabilities() || {};
  }, [timerService]);
  
  return {
    // State
    isRunning,
    isPaused,
    currentTime,
    currentPhase,
    
    // Actions
    start,
    pause,
    resume,
    stop,
    reset,
    setTechnique,
    
    // Getters
    getState,
    getCapabilities
  };
};

/**
 * Hook for audio management
 * @returns {object} - Audio state and actions
 */
export const useAudio = () => {
  const { audioService } = useServices();
  
  const [isEnabled, setIsEnabled] = useState(true);
  const [volume, setVolume] = useState(0.7);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Initialize audio service state
  useEffect(() => {
    if (audioService) {
      setIsEnabled(audioService.isEnabled());
      setVolume(audioService.getVolume());
    }
  }, [audioService]);
  
  const playSound = useCallback(async (soundType, options = {}) => {
    if (!audioService || !isEnabled) return;
    
    try {
      setIsPlaying(true);
      await audioService.playSound(soundType, options);
    } catch (error) {
      Logger.error("hook", 'Audio playback failed:', error);
    } finally {
      setIsPlaying(false);
    }
  }, [audioService, isEnabled]);
  
  const stopSound = useCallback(() => {
    if (audioService) {
      audioService.stopSound();
      setIsPlaying(false);
    }
  }, [audioService]);
  
  const setAudioEnabled = useCallback((enabled) => {
    if (audioService) {
      audioService.setEnabled(enabled);
      setIsEnabled(enabled);
    }
  }, [audioService]);
  
  const setAudioVolume = useCallback((newVolume) => {
    if (audioService) {
      audioService.setVolume(newVolume);
      setVolume(newVolume);
    }
  }, [audioService]);
  
  const getAudioCapabilities = useCallback(() => {
    return audioService?.getCapabilities() || {};
  }, [audioService]);
  
  return {
    // State
    isEnabled,
    volume,
    isPlaying,
    
    // Actions
    playSound,
    stopSound,
    setAudioEnabled,
    setAudioVolume,
    
    // Getters
    getAudioCapabilities
  };
};

/**
 * Hook for vibration management
 * @returns {object} - Vibration state and actions
 */
export const useVibration = () => {
  const { vibrationService } = useServices();
  
  const [isEnabled, setIsEnabled] = useState(true);
  const [isSupported, setIsSupported] = useState(false);
  const [isVibrating, setIsVibrating] = useState(false);
  
  // Initialize vibration service state
  useEffect(() => {
    if (vibrationService) {
      setIsEnabled(vibrationService.isEnabled());
      setIsSupported(vibrationService.isSupported());
    }
  }, [vibrationService]);
  
  const vibrate = useCallback(async (pattern = [200]) => {
    if (!vibrationService || !isEnabled || !isSupported) return;
    
    try {
      setIsVibrating(true);
      await vibrationService.vibrate(pattern);
    } catch (error) {
      Logger.error("hook", 'Vibration failed:', error);
    } finally {
      setIsVibrating(false);
    }
  }, [vibrationService, isEnabled, isSupported]);
  
  const stopVibration = useCallback(() => {
    if (vibrationService) {
      vibrationService.stopVibration();
      setIsVibrating(false);
    }
  }, [vibrationService]);
  
  const setVibrationEnabled = useCallback((enabled) => {
    if (vibrationService) {
      vibrationService.setEnabled(enabled);
      setIsEnabled(enabled);
    }
  }, [vibrationService]);
  
  const getVibrationCapabilities = useCallback(() => {
    return vibrationService?.getCapabilities() || {};
  }, [vibrationService]);
  
  return {
    // State
    isEnabled,
    isSupported,
    isVibrating,
    
    // Actions
    vibrate,
    stopVibration,
    setVibrationEnabled,
    
    // Getters
    getVibrationCapabilities
  };
};

/**
 * Hook for accessibility features
 * @returns {object} - Accessibility utilities
 */
export const useAccessibility = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);
  const [prefersColorScheme, setPrefersColorScheme] = useState('light');
  
  // Monitor accessibility preferences
  useEffect(() => {
    // Check for reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);
    
    const handleMotionChange = (e) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);
    
    // Check for high contrast preference
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    setPrefersHighContrast(contrastQuery.matches);
    
    const handleContrastChange = (e) => setPrefersHighContrast(e.matches);
    contrastQuery.addEventListener('change', handleContrastChange);
    
    // Check for color scheme preference
    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setPrefersColorScheme(colorSchemeQuery.matches ? 'dark' : 'light');
    
    const handleColorSchemeChange = (e) => setPrefersColorScheme(e.matches ? 'dark' : 'light');
    colorSchemeQuery.addEventListener('change', handleColorSchemeChange);
    
    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
      colorSchemeQuery.removeEventListener('change', handleColorSchemeChange);
    };
  }, []);
  
  const announce = useCallback((message, priority = 'polite') => {
    // Create or update live region for screen reader announcements
    let liveRegion = document.getElementById('live-region');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'live-region';
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      document.body.appendChild(liveRegion);
    }
    
    liveRegion.textContent = message;
    
    // Clear the message after announcement
    setTimeout(() => {
      if (liveRegion) {
        liveRegion.textContent = '';
      }
    }, 1000);
  }, []);
  
  const focusElement = useCallback((elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
    }
  }, []);
  
  const trapFocus = useCallback((containerElement) => {
    const focusableElements = containerElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };
    
    containerElement.addEventListener('keydown', handleTabKey);
    
    return () => {
      containerElement.removeEventListener('keydown', handleTabKey);
    };
  }, []);
  
  return {
    // Preferences
    prefersReducedMotion,
    prefersHighContrast,
    prefersColorScheme,
    
    // Actions
    announce,
    focusElement,
    trapFocus
  };
};

// Export all hooks
export { usePreferences } from './usePreferences.js';