/**
 * Breathing Context
 * Provides breathing session state and functionality
 */

import React, { createContext, useContext, useMemo, useEffect, useCallback } from 'react';
import { useServices } from './ServicesContext.jsx';
import { AppError, ERROR_CODES } from '../errors/AppError.js';
import { BreathingSessionState } from '../state/BreathingSessionState.js';
import { CommandInvoker, StartBreathingCommand, PauseBreathingCommand, ChangeTechniqueCommand } from '../commands/Command.js';
import { StateObserver } from '../state/Observer.js';
import Logger from '../utils/Logger.js';

/**
 * Breathing Context
 */
const BreathingContext = createContext(null);

/**
 * Breathing Provider Component
 * Provides breathing session state and functionality
 */
export const BreathingProvider = ({ children }) => {
  const services = useServices();
  const {
    sessionState,
    timerService,
    commandInvoker,
    audioService,
    vibrationService,
    preferencesState
  } = services;

  // Initialize session state and timer service with technique from preferences
  useEffect(() => {
    const initializeSession = async () => {
      try {
        Logger.debug('context', 'Initializing session...');
        
        // Wait for preferences to be loaded
        if (!preferencesState) {
          Logger.warn('context', 'PreferencesState not available yet');
          return;
        }
        
        // Get selected technique from preferences
        const selectedTechniqueId = preferencesState.getSelectedTechniqueId?.() || 'box4';
        Logger.debug('context', 'Selected technique ID from preferences:', selectedTechniqueId);
        
        // Import technique registry
        const { techniqueRegistry } = await import('../techniques/TechniqueRegistry.js');
        const technique = techniqueRegistry.getTechnique(selectedTechniqueId);
        
        if (!technique) {
          Logger.error('context', 'Failed to load technique:', selectedTechniqueId);
          return;
        }
        
        Logger.debug('context', 'Loaded technique:', technique.getId());
        
        // Always initialize or re-initialize session state with technique
        // Get initial phase from technique
        const initialPhase = technique.getCurrentPhase(0);
        Logger.debug('context', 'Initial phase:', initialPhase);
        
        sessionState.setState({
          currentTechniqueId: selectedTechniqueId,
          technique: technique,
          currentPhase: initialPhase,
          phaseIndex: 0,
          timeInPhase: 0,
          timeLeft: initialPhase?.duration || 0
        });
        
        // Set technique in timer service
        if (timerService) {
          Logger.debug('context', 'Setting technique in timer service');
          timerService.setTechnique(technique);
        }
        
        Logger.debug('context', 'Session initialized successfully');
      } catch (error) {
        Logger.error('context', 'Failed to initialize session:', error);
        // Try fallback initialization
        try {
          const { techniqueRegistry } = await import('../techniques/TechniqueRegistry.js');
          const fallbackTechnique = techniqueRegistry.getTechnique('box4');
          if (fallbackTechnique && sessionState) {
            const initialPhase = fallbackTechnique.getCurrentPhase(0);
            sessionState.setState({
              currentTechniqueId: 'box4',
              technique: fallbackTechnique,
              currentPhase: initialPhase,
              phaseIndex: 0,
              timeInPhase: 0,
              timeLeft: initialPhase?.duration || 0
            });
            if (timerService) {
              timerService.setTechnique(fallbackTechnique);
            }
          }
        } catch (fallbackError) {
          Logger.error('context', 'Fallback initialization failed:', fallbackError);
        }
      }
    };
    
    // Only initialize once when all dependencies are ready
    if (sessionState && timerService && preferencesState) {
      initializeSession();
    }
  }, [timerService, sessionState, preferencesState]);

  // Update technique when selectedTechniqueId changes in preferences
  useEffect(() => {
    const updateTechniqueFromPreferences = async () => {
      try {
        if (!preferencesState || !sessionState) return;
        
        const selectedTechniqueId = preferencesState.getSelectedTechniqueId?.() || 'box4';
        const currentTechniqueId = sessionState.state.currentTechniqueId;
        
        // Only update if technique ID has changed and session is not running
        if (selectedTechniqueId !== currentTechniqueId && !sessionState.state.isRunning) {
          Logger.debug('context', 'Updating technique from', currentTechniqueId, 'to', selectedTechniqueId);
          
          // Import technique registry
          const { techniqueRegistry } = await import('../techniques/TechniqueRegistry.js');
          const technique = techniqueRegistry.getTechnique(selectedTechniqueId);
          
          if (technique) {
            // Get initial phase from technique
            const initialPhase = technique.getCurrentPhase(0);
            
            sessionState.setState({
              currentTechniqueId: selectedTechniqueId,
              technique: technique,
              currentPhase: initialPhase,
              phaseIndex: 0,
              timeInPhase: 0,
              timeLeft: initialPhase?.duration || 0
            });
            
            if (timerService) {
              timerService.setTechnique(technique);
            }
            
            Logger.debug('context', 'Technique updated successfully');
          }
        }
      } catch (error) {
        Logger.error('context', 'Failed to update technique from preferences:', error);
      }
    };
    
    // Subscribe to preferences changes
    if (preferencesState && typeof preferencesState.addObserver === 'function') {
      const observer = new StateObserver((data) => {
        if (data && data.changes && data.changes.selectedTechniqueId) {
          Logger.debug('context', 'Detected selectedTechniqueId change');
          updateTechniqueFromPreferences();
        }
      });
      
      preferencesState.addObserver(observer);
      
      return () => {
        preferencesState.removeObserver(observer);
      };
    }
  }, [preferencesState, sessionState, timerService]);

  // Timer update handler with phase change detection
  const handleTimerUpdate = useCallback((data) => {
    Logger.debug('context', 'Timer update received:', data);
    if (sessionState && data.currentPhase) {
      const previousPhaseIndex = sessionState.state.phaseIndex;
      const previousElapsedSeconds = sessionState.state.elapsedSeconds;
      const newPhaseIndex = data.currentPhase.phaseIndex;
      
      // Detect actual phase change (when phase index changes)
      const isPhaseChange = previousPhaseIndex !== newPhaseIndex && previousPhaseIndex !== -1;
      
      if (isPhaseChange) {
        Logger.debug('context', 'PHASE CHANGE DETECTED from', previousPhaseIndex, 'to', newPhaseIndex);
      }
      
      // data.currentPhase already contains all needed info: phaseIndex, phase, duration, timeInPhase, timeLeft
      sessionState.updateTimer(data.currentTime, data.currentPhase);
      Logger.debug('context', 'Session state updated, new state:', sessionState.getState());
      
      const soundEnabled = preferencesState?.state.soundEnabled;
      const vibrationEnabled = preferencesState?.state.vibrationEnabled;
      const isSessionStart = data.currentTime === 0;
      const isNewSecond = data.currentTime !== previousElapsedSeconds;
      
      // Play sound and vibration on every second
      if (isSessionStart || isNewSecond) {
        // ULTRA STRICT: Only last second if timeLeft is EXACTLY 1 (number type, strict equality)
        const timeLeft = data.currentPhase?.timeLeft;
        const isLastSecond = (timeLeft === 1 && typeof timeLeft === 'number');
        
        if (isLastSecond) {
          // Special sound and vibration on LAST second of phase
          if (soundEnabled && audioService) {
            audioService.playBeep(600, 150, 0.3);
          }
          
          if (vibrationEnabled && vibrationService) {
            vibrationService.vibrate(50);
          }
        } else {
          // Regular sound and vibration on all other seconds
          if (soundEnabled && audioService) {
            audioService.playBeep(440, 80, 0.12);
          }
          
          if (vibrationEnabled && vibrationService) {
            vibrationService.vibrate(10);
          }
        }
      }
    } else {
      Logger.warn('context', 'Missing sessionState or currentPhase in timer update');
    }
  }, [sessionState, audioService, vibrationService, preferencesState]);

  // Cycle complete handler
  const handleCycleComplete = useCallback((data) => {
    Logger.info('context', '🎉 CYCLE COMPLETE');
    // Note: Cycle complete vibration removed - was causing all subsequent vibrations 
    // to become strong (50ms) instead of regular (10ms) after first cycle
  }, []);

  // Set up timer listeners
  useEffect(() => {
    if (!timerService) return;

    const unsubscribeUpdate = timerService.addListener('update', handleTimerUpdate);
    const unsubscribeCycleComplete = timerService.addListener('cycleComplete', handleCycleComplete);

    return () => {
      unsubscribeUpdate();
      unsubscribeCycleComplete();
    };
  }, [timerService, handleTimerUpdate, handleCycleComplete]);

  // Warm up audio context on session start to avoid first-beep delay
  useEffect(() => {
    if (!audioService) return;
    if (preferencesState?.state?.soundEnabled) {
      // Initialize/resume audio context eagerly (no sound output)
      audioService.initialize?.().catch(() => {});
    }
  }, [audioService, preferencesState?.state?.soundEnabled]);

  // Command execution context
  const commandContext = useMemo(() => ({
    sessionState,
    timerService,
    audioService,
    vibrationService,
    preferencesState,
    themeService: services.themeService
  }), [sessionState, timerService, audioService, vibrationService, preferencesState, services.themeService]);

  // Breathing session actions
  const startSession = useCallback(async (techniqueId, technique) => {
    try {
      // Ensure technique is set in timer service before starting
      if (timerService && technique) {
        timerService.setTechnique(technique);
      }
      
      const command = new StartBreathingCommand(techniqueId, technique);
      return await commandInvoker.executeCommand(command, commandContext);
    } catch (error) {
      Logger.error('context', 'Failed to start breathing session:', error);
      throw new AppError(
        'Failed to start breathing session',
        ERROR_CODES.COMMAND_EXECUTION_FAILED,
        { originalError: error.message }
      );
    }
  }, [commandInvoker, commandContext, timerService]);

  const pauseSession = useCallback(async () => {
    try {
      const command = new PauseBreathingCommand('pause');
      return await commandInvoker.executeCommand(command, commandContext);
    } catch (error) {
      throw new AppError(
        'Failed to pause breathing session',
        ERROR_CODES.COMMAND_EXECUTION_FAILED,
        { originalError: error.message }
      );
    }
  }, [commandInvoker, commandContext]);

  const resumeSession = useCallback(async () => {
    try {
      const command = new PauseBreathingCommand('resume');
      return await commandInvoker.executeCommand(command, commandContext);
    } catch (error) {
      throw new AppError(
        'Failed to resume breathing session',
        ERROR_CODES.COMMAND_EXECUTION_FAILED,
        { originalError: error.message }
      );
    }
  }, [commandInvoker, commandContext]);

  const stopSession = useCallback(async () => {
    try {
      if (sessionState) {
        sessionState.stopSession();
      }
      if (timerService) {
        timerService.stop();
      }
      return { success: true };
    } catch (error) {
      throw new AppError(
        'Failed to stop breathing session',
        ERROR_CODES.COMMAND_EXECUTION_FAILED,
        { originalError: error.message }
      );
    }
  }, [sessionState, timerService]);

  const changeTechnique = useCallback(async (techniqueId, technique) => {
    try {
      // Validate inputs
      if (!techniqueId || !technique) {
        Logger.warn('context', 'Invalid technique parameters:', { techniqueId, technique });
        return { success: false, error: 'Invalid technique parameters' };
      }

      const command = new ChangeTechniqueCommand(techniqueId, technique);
      return await commandInvoker.executeCommand(command, commandContext);
    } catch (error) {
      Logger.error('context', 'Failed to change technique:', error);
      throw new AppError(
        'Failed to change technique',
        ERROR_CODES.COMMAND_EXECUTION_FAILED,
        { originalError: error.message }
      );
    }
  }, [commandInvoker, commandContext]);

  const resetSession = useCallback(async () => {
    try {
      if (sessionState) {
        sessionState.resetSession();
      }
      if (timerService) {
        timerService.reset();
      }
      return { success: true };
    } catch (error) {
      throw new AppError(
        'Failed to reset breathing session',
        ERROR_CODES.COMMAND_EXECUTION_FAILED,
        { originalError: error.message }
      );
    }
  }, [sessionState, timerService]);

  // Undo/Redo functionality
  const undo = useCallback(async () => {
    try {
      return await commandInvoker.undo(commandContext);
    } catch (error) {
      throw new AppError(
        'Failed to undo command',
        ERROR_CODES.COMMAND_EXECUTION_FAILED,
        { originalError: error.message }
      );
    }
  }, [commandInvoker, commandContext]);

  const redo = useCallback(async () => {
    try {
      return await commandInvoker.redo(commandContext);
    } catch (error) {
      throw new AppError(
        'Failed to redo command',
        ERROR_CODES.COMMAND_EXECUTION_FAILED,
        { originalError: error.message }
      );
    }
  }, [commandInvoker, commandContext]);

  // Session state getters
  const getSessionStats = useCallback(() => {
    return sessionState?.getSessionStats() || {};
  }, [sessionState]);

  const getCurrentPhase = useCallback(() => {
    return sessionState?.getCurrentPhase() || null;
  }, [sessionState]);

  const getSessionProgress = useCallback(() => {
    return sessionState?.getSessionProgress() || 0;
  }, [sessionState]);

  const getCycleProgress = useCallback(() => {
    return sessionState?.getCycleProgress() || 0;
  }, [sessionState]);

  const isSessionActive = useCallback(() => {
    return sessionState?.isSessionActive() || false;
  }, [sessionState]);

  const isSessionRunning = useCallback(() => {
    return sessionState?.state.isRunning || false;
  }, [sessionState]);

  const isSessionPaused = useCallback(() => {
    return sessionState?.state.isPaused || false;
  }, [sessionState]);

  // Command history
  const getCommandHistory = useCallback(() => {
    return commandInvoker?.getHistory() || [];
  }, [commandInvoker]);

  const canUndo = useCallback(() => {
    return commandInvoker?.canUndo() || false;
  }, [commandInvoker]);

  const canRedo = useCallback(() => {
    return commandInvoker?.canRedo() || false;
  }, [commandInvoker]);

  const contextValue = useMemo(() => ({
    // Session state
    sessionState,
    timerService,
    
    // Session actions
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    changeTechnique,
    resetSession,
    
    // Undo/Redo
    undo,
    redo,
    
    // Session getters
    getSessionStats,
    getCurrentPhase,
    getSessionProgress,
    getCycleProgress,
    isSessionActive,
    isSessionRunning,
    isSessionPaused,
    
    // Command history
    getCommandHistory,
    canUndo,
    canRedo,
    
    // Services
    audioService,
    vibrationService,
    preferencesState
  }), [
    sessionState,
    timerService,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    changeTechnique,
    resetSession,
    undo,
    redo,
    getSessionStats,
    getCurrentPhase,
    getSessionProgress,
    getCycleProgress,
    isSessionActive,
    isSessionRunning,
    isSessionPaused,
    getCommandHistory,
    canUndo,
    canRedo,
    audioService,
    vibrationService,
    preferencesState
  ]);

  return (
    <BreathingContext.Provider value={contextValue}>
      {children}
    </BreathingContext.Provider>
  );
};

/**
 * Hook to use breathing context
 * @returns {object} - Breathing context value
 */
export const useBreathing = () => {
  const context = useContext(BreathingContext);
  
  if (!context) {
    throw new AppError(
      'useBreathing must be used within a BreathingProvider',
      ERROR_CODES.DEPENDENCY_INJECTION_FAILED
    );
  }
  
  return context;
};

/**
 * Hook to use breathing session state
 * @returns {object} - Session state and actions
 */
export const useBreathingSession = () => {
  const breathing = useBreathing();
  
  return {
    // State
    isRunning: breathing.isSessionRunning(),
    isPaused: breathing.isSessionPaused(),
    isActive: breathing.isSessionActive(),
    currentPhase: breathing.getCurrentPhase(),
    sessionStats: breathing.getSessionStats(),
    progress: breathing.getSessionProgress(),
    cycleProgress: breathing.getCycleProgress(),
    
    // Actions
    start: breathing.startSession,
    pause: breathing.pauseSession,
    resume: breathing.resumeSession,
    stop: breathing.stopSession,
    reset: breathing.resetSession,
    changeTechnique: breathing.changeTechnique,
    
    // Undo/Redo
    undo: breathing.undo,
    redo: breathing.redo,
    canUndo: breathing.canUndo(),
    canRedo: breathing.canRedo(),
    
    // History
    commandHistory: breathing.getCommandHistory()
  };
};

/**
 * Hook to use breathing timer
 * @returns {object} - Timer state and actions
 */
export const useBreathingTimer = () => {
  const breathing = useBreathing();
  
  return {
    timerService: breathing.timerService,
    sessionState: breathing.sessionState,
    isRunning: breathing.isSessionRunning(),
    isPaused: breathing.isSessionPaused(),
    currentPhase: breathing.getCurrentPhase(),
    progress: breathing.getSessionProgress(),
    cycleProgress: breathing.getCycleProgress()
  };
};

export default BreathingContext;
