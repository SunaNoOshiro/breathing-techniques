/**
 * Refactored App Component
 * Uses SOLID principles and design patterns with extracted components
 */

import React, { useState, useEffect, useCallback, Suspense, memo } from 'react';
import { useLocalization } from './contexts/LocalizationContext.jsx';
import { useBreathingSession, useAccessibility, usePreferences } from './hooks/index.js';
import { useThemeColors, useTheme } from './contexts/ThemeContext.jsx';
import { useServices } from './contexts/ServicesContext.jsx';
import { useResponsive } from './hooks/index.js';
import { useTechnique } from './hooks/index.js';
import { techniqueRegistry } from './techniques/TechniqueRegistry.js';
import { LazyComponents, MemoizedComponents } from './performance/PerformanceOptimizations.jsx';
import { AnimatedLoading } from './animations/BreathingAnimations.jsx';
import { 
  ErrorBoundary, 
  TechniqueErrorBoundary, 
  VisualizationErrorBoundary,
  ServiceErrorBoundary 
} from './components/ErrorBoundary.jsx';
import Logger from './utils/Logger.js';

// Lazy load heavy components
const VisualizationContainer = LazyComponents.VisualizationContainer;
const TechniqueInfo = LazyComponents.TechniqueInfo;
const DesktopControlPanel = LazyComponents.DesktopControlPanel;
const SettingsScreen = LazyComponents.SettingsScreen;

// Import lightweight components directly
import { MobileHeader, MobileBottomNav } from './components/index.js';

/**
 * Main App Component
 * Refactored to use SOLID principles and design patterns
 */
export default function BreathingApp() {
  // Localization
  const { t, currentLanguage, changeLanguage } = useLocalization();
  
  // Services
  const services = useServices();
  const { preferencesState, audioService } = services;
  
  // State
  const [showSettings, setShowSettings] = useState(false);

  // Hooks
  const { 
    start, 
    pause, 
    resume, 
    stop, 
    changeTechnique,
    isRunning, 
    isPaused, 
    currentPhase 
  } = useBreathingSession();
  
  const currentColors = useThemeColors();
  const { setTheme, getCurrentTheme } = useTheme();
  const { isDesktop } = useResponsive();
  const { announce, prefersReducedMotion } = useAccessibility();
  
  // Reactive preferences
  const preferences = usePreferences();
  const {
    soundEnabled: soundOn = true,
    vibrationEnabled: vibrateOn = false,
    currentTheme: selectedThemeKey = 'dark',
    selectedTechniqueId = 'box4',
    setSoundEnabled,
    setVibrationEnabled,
    setCurrentTheme,
    setSelectedTechniqueId
  } = preferences || {};

  // Debug logging
  Logger.debug('component', 'Current preferences state:', preferencesState);
  Logger.debug('component', 'Selected theme key:', selectedThemeKey);
  Logger.debug('component', 'Sound on:', soundOn);
  Logger.debug('component', 'Vibrate on:', vibrateOn);

  // Get current technique instance
  let technique;
  try {
    technique = techniqueRegistry.getTechnique(selectedTechniqueId);
  } catch (error) {
    Logger.warn('component', 'Failed to get technique:', error);
    technique = null;
  }
  
  // Debug technique loading
  Logger.debug('component', 'Selected technique ID:', selectedTechniqueId);
  Logger.debug('component', 'Available techniques:', techniqueRegistry.getTechniqueIds());
  Logger.debug('component', 'Technique from registry:', technique);
  
  if (!technique) {
    Logger.warn('component', 'Technique not found for ID:', selectedTechniqueId);
  }

  // Initialize theme on mount
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        Logger.debug('component', 'Initializing theme with:', selectedThemeKey);
        // Apply the current theme from preferences
        await setTheme(selectedThemeKey);
        Logger.debug('component', 'Theme initialization completed');
      } catch (error) {
        Logger.warn('component', 'Failed to initialize theme:', error);
      }
    };
    
    // Only initialize if we have a valid theme key
    if (selectedThemeKey) {
      initializeTheme();
    }
  }, [setTheme, selectedThemeKey]);

  // Initialize vibration service with preference state
  useEffect(() => {
    if (services?.vibrationService && vibrateOn !== undefined) {
      services.vibrationService.setEnabled(vibrateOn);
      Logger.debug('component', 'VibrationService initialized with enabled:', vibrateOn);
    }
  }, [services, vibrateOn]);

  // Initialize technique in session state on mount - TEMPORARILY DISABLED
  // useEffect(() => {
  //   const initializeTechnique = async () => {
  //     try {
  //       // Wait a bit for all contexts to be ready
  //       await new Promise(resolve => setTimeout(resolve, 200));
        
  //       console.log('Attempting to initialize technique...');
  //       console.log('Technique available:', !!technique);
  //       console.log('Is running:', isRunning);
  //       console.log('Is paused:', isPaused);
  //       console.log('Current phase:', currentPhase);
        
  //       if (!technique) {
  //         console.warn('Cannot initialize technique: technique is undefined');
  //         return;
  //       }
        
  //       if (isRunning || isPaused || currentPhase) {
  //         console.log('Skipping technique initialization: session already active');
  //         return;
  //       }
        
  //       console.log('Initializing technique:', selectedTechniqueId);
  //       await changeTechnique(selectedTechniqueId, technique);
  //       console.log('Technique initialized successfully');
  //     } catch (error) {
  //       console.warn('Failed to initialize technique:', error);
  //     }
  //   };
    
  //   initializeTechnique();
  // }, [selectedTechniqueId, technique, changeTechnique, isRunning, isPaused, currentPhase]);

  // Theme change handler
  const handleThemeChange = useCallback(async (newThemeKey) => {
    try {
      Logger.debug('component', 'Theme change requested:', newThemeKey);
      
      // Update preferences state
      if (setCurrentTheme && typeof setCurrentTheme === 'function') {
        setCurrentTheme(newThemeKey);
      }
      
      // Apply theme using theme context
      Logger.debug('component', 'Applying theme via context...');
      await setTheme(newThemeKey);
      Logger.debug('component', 'Theme applied successfully');
    } catch (error) {
      Logger.error('component', 'Failed to change theme:', error);
    }
  }, [setTheme, setCurrentTheme]);

  // Technique change handler
  const handleTechniqueChange = useCallback(async (newTechniqueId) => {
    try {
      // Save technique to preferences
      if (setSelectedTechniqueId && typeof setSelectedTechniqueId === 'function') {
        setSelectedTechniqueId(newTechniqueId);
      }
      
      // Reset session when technique changes
      stop();
      
      // Update technique in session state
      const newTechnique = techniqueRegistry.getTechnique(newTechniqueId);
      if (newTechnique) {
        // Use the changeTechnique method from breathing context
        await changeTechnique(newTechniqueId, newTechnique);
      }
    } catch (error) {
      Logger.error('component', 'Failed to change technique:', error);
    }
  }, [stop, changeTechnique, setSelectedTechniqueId]);

  // Play/Stop handler
  const handlePlayPause = useCallback(async () => {
    try {
      if (isRunning || isPaused) {
        // Stop the session completely and reset
        stop();
        announce(t('sessionStopped'), 'polite');
      } else {
        // Ensure technique is loaded before starting
        let currentTechnique = technique;
        
        if (!currentTechnique) {
          Logger.warn('component', 'handlePlayPause: technique is null, loading from registry...');
          const techniqueToLoad = techniqueRegistry.getTechnique(selectedTechniqueId);
          if (!techniqueToLoad) {
            Logger.error('component', 'handlePlayPause: Failed to load technique:', selectedTechniqueId);
            announce(t('errorLoadingTechnique') || 'Error loading technique', 'assertive');
            return;
          }
          currentTechnique = techniqueToLoad;
        }
        
        // Warm up audio context on user gesture to avoid first-cycle mute
        if (soundOn && audioService) {
          try {
            await audioService.initialize();
            audioService.ensureAudioContext?.();
          } catch (_) {}
        }

        Logger.debug('component', 'handlePlayPause: Starting session with technique:', currentTechnique.getId());
        await start(selectedTechniqueId, currentTechnique);
        announce(t('sessionStarted'), 'polite');
      }
    } catch (error) {
      Logger.error('component', 'handlePlayPause error:', error);
      announce(t('errorStartingSession') || 'Error starting session', 'assertive');
    }
  }, [isRunning, isPaused, start, stop, selectedTechniqueId, technique, announce, t, soundOn, audioService]);

  // Settings handlers
  const handleSettingsClick = useCallback(() => {
    setShowSettings(true);
  }, []);

  const handleSettingsClose = useCallback(() => {
    setShowSettings(false);
  }, []);

  const handleSoundChange = useCallback((enabled) => {
    Logger.debug('component', 'Sound change requested:', enabled);
    if (setSoundEnabled && typeof setSoundEnabled === 'function') {
      setSoundEnabled(enabled);
      Logger.debug('component', 'Sound preference updated');
    }
  }, [setSoundEnabled]);

  const handleVibrationChange = useCallback((enabled) => {
    Logger.debug('component', 'Vibration change requested:', enabled);
    if (setVibrationEnabled && typeof setVibrationEnabled === 'function') {
      setVibrationEnabled(enabled);
      Logger.debug('component', 'Vibration preference updated');
    }
    // Also update the vibration service directly
    if (services?.vibrationService) {
      services.vibrationService.setEnabled(enabled);
      Logger.debug('component', 'VibrationService.setEnabled called with:', enabled);
    }
  }, [setVibrationEnabled, services]);

  // Desktop status display component (memoized for performance)
  const DesktopStatusDisplay = memo(() => (
    <div 
      style={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
        textAlign: 'left',
        marginTop: '16px',
        padding: '16px 24px',
        background: currentColors.panel,
        borderRadius: '16px',
        border: `1px solid ${currentColors.border}`,
        maxWidth: '720px',
        width: '100%',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
      }}
      role="status"
      aria-live="polite"
      aria-label={t('sessionStatus')}
    >
      {/* Left side: phase + time */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start', flex: 1 }}>
        <div 
          style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: currentColors.accent,
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}
          aria-label={t('currentPhase')}
        >
          {currentPhase ? t(currentPhase.key || currentPhase.phase?.key || 'inhale') : t('ready')}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <div 
            style={{ 
              fontSize: '40px', 
              fontWeight: '300',
              color: currentColors.text,
              letterSpacing: '-1px'
            }}
            aria-label={t('timeRemaining')}
          >
            {currentPhase ? Math.ceil(currentPhase.timeLeft || currentPhase.timeRemaining || currentPhase.duration || 0) : '—'}
          </div>
          <div 
            style={{ 
              fontSize: '12px', 
              fontWeight: '500',
              color: currentColors.text,
              opacity: 0.7,
              textTransform: 'none',
              letterSpacing: '0.5px'
            }}
          >
            {currentPhase ? t('secLeft') : t('pressToStart')}
          </div>
        </div>
      </div>

      {/* Right side: Play/Stop Button */}
      <button 
        onClick={handlePlayPause}
        style={{
          background: (isRunning || isPaused) 
            ? '#ef4444' 
            : currentColors.accent,
          color: '#ffffff',
          fontSize: '15px',
          fontWeight: '600',
          cursor: 'pointer',
          padding: '14px 28px',
          borderRadius: '24px',
          border: 'none',
          transition: prefersReducedMotion ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: (isRunning || isPaused)
            ? '0 4px 12px rgba(239, 68, 68, 0.3)'
            : `0 4px 12px ${currentColors.accent}40`,
          minWidth: '140px',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}
        onMouseEnter={(e) => {
          if (!prefersReducedMotion) {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = (isRunning || isPaused)
              ? '0 6px 16px rgba(239, 68, 68, 0.4)'
              : `0 6px 16px ${currentColors.accent}50`;
          }
        }}
        onMouseLeave={(e) => {
          if (!prefersReducedMotion) {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = (isRunning || isPaused)
              ? '0 4px 12px rgba(239, 68, 68, 0.3)'
              : `0 4px 12px ${currentColors.accent}40`;
          }
        }}
        onMouseDown={(e) => {
          if (!prefersReducedMotion) {
            e.target.style.transform = 'scale(0.96)';
          }
        }}
        onMouseUp={(e) => {
          if (!prefersReducedMotion) {
            e.target.style.transform = 'translateY(-2px)';
          }
        }}
        aria-label={(isRunning || isPaused) ? t('stopSession') : t('startSession')}
        aria-pressed={isRunning || isPaused}
      >
        {(isRunning || isPaused) ? t('stop') : t('start')}
      </button>
    </div>
  ));

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case ' ':
        e.preventDefault();
        handlePlayPause();
        break;
      case 'Escape':
        if (showSettings) {
          setShowSettings(false);
        }
        break;
      case 's':
      case 'S':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          setShowSettings(true);
        }
        break;
    }
  }, [handlePlayPause, showSettings]);

  // Set up keyboard navigation
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <ErrorBoundary>
      <div 
        className="breathing-app" 
        style={{ 
          background: currentColors.bg, 
          color: currentColors.text,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: isDesktop ? 'row' : 'column'
        }}
        role="main"
        aria-label={t('breathingApp')}
        tabIndex={-1}
      >
      {/* Settings Screen */}
      {showSettings && (
        <Suspense fallback={<AnimatedLoading label={t('loadingSettings')} />}>
          <SettingsScreen
            onClose={handleSettingsClose}
            currentLanguage={currentLanguage}
            onLanguageChange={changeLanguage}
            selectedThemeKey={selectedThemeKey}
            onThemeChange={handleThemeChange}
            soundOn={soundOn}
            onSoundChange={handleSoundChange}
            vibrateOn={vibrateOn}
            onVibrationChange={handleVibrationChange}
          />
        </Suspense>
      )}
      
      {/* Desktop Layout: Left Control Panel */}
      {isDesktop && (
        <Suspense fallback={<AnimatedLoading label={t('loadingControls')} />}>
          <DesktopControlPanel
            selectedTechniqueId={selectedTechniqueId}
            onTechniqueChange={handleTechniqueChange}
            currentLanguage={currentLanguage}
            onLanguageChange={changeLanguage}
            selectedThemeKey={selectedThemeKey}
            onThemeChange={handleThemeChange}
            soundOn={soundOn}
            onSoundChange={handleSoundChange}
            vibrateOn={vibrateOn}
            onVibrationChange={handleVibrationChange}
          />
        </Suspense>
      )}

      {/* Mobile Layout: Header with Technique Selection */}
      {!isDesktop && (
        <MobileHeader
          selectedTechniqueId={selectedTechniqueId}
          onTechniqueChange={handleTechniqueChange}
        />
      )}

      {/* Main Content Area */}
      <div 
        className="main-content" 
        style={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isDesktop ? '24px' : '8px'
        }}
      >
        {/* Technique Info */}
        <TechniqueErrorBoundary>
          <Suspense fallback={<AnimatedLoading label={t('loadingTechnique')} />}>
            <TechniqueInfo />
          </Suspense>
        </TechniqueErrorBoundary>

        {/* Visualization Container */}
        <VisualizationErrorBoundary>
          <Suspense fallback={<AnimatedLoading label={t('loadingVisualization')} />}>
            <VisualizationContainer />
          </Suspense>
        </VisualizationErrorBoundary>

        {/* Desktop Status Display */}
        {isDesktop && <DesktopStatusDisplay />}
      </div>

      {/* Mobile Bottom Navigation Bar */}
      {!isDesktop && (
        <MobileBottomNav
          onSettingsClick={handleSettingsClick}
          onPlayPause={handlePlayPause}
        />
      )}
      </div>
    </ErrorBoundary>
  );
}