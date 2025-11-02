/**
 * Main Service Provider Setup
 * Wires together all services and dependencies following Dependency Inversion Principle
 */

import React from 'react';
import { ServicesProvider } from './contexts/ServicesContext.jsx';
import { BreathingProvider } from './contexts/BreathingContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { LocalizationProvider } from './contexts/LocalizationContext.jsx';

// Import services
import { AudioService } from './services/AudioService.js';
import { VibrationService } from './services/VibrationService.js';
import { ThemeService } from './services/ThemeService.js';
import { StorageService } from './services/StorageService.js';
import { TimerService } from './services/TimerService.js';

// Import adapters
import { LocalStorageAdapter } from './adapters/LocalStorageAdapter.js';

// Import state managers
import { AppStateManager } from './state/AppStateManager.js';
import { BreathingSessionState } from './state/BreathingSessionState.js';
import { UserPreferencesState } from './state/UserPreferencesState.js';

// Import strategy managers
import { visualizationStrategyManager } from './strategies/visualization/VisualizationStrategy.js';
import { themeStrategyManager } from './strategies/theme/ThemeStrategy.js';

// Import command invoker
import { commandInvoker } from './commands/Command.js';

// Import error handler
import { errorHandler } from './errors/ErrorHandler.js';

/**
 * Create and configure all services
 */
const createServices = () => {
  // Create storage adapter
  const storageAdapter = new LocalStorageAdapter();
  
  // Create services with dependencies
  const audioService = new AudioService();
  const vibrationService = new VibrationService();
  const themeService = new ThemeService(storageAdapter);
  const storageService = new StorageService(storageAdapter);
  const timerService = new TimerService();
  
  // Create state managers
  const appStateManager = new AppStateManager();
  const sessionState = new BreathingSessionState();
  const preferencesState = new UserPreferencesState();
  
  return {
    // Core services
    audioService,
    vibrationService,
    themeService,
    storageService,
    timerService,
    
    // State managers
    appStateManager,
    sessionState,
    preferencesState,
    
    // Strategy managers
    visualizationStrategyManager,
    themeStrategyManager,
    
    // Command invoker
    commandInvoker,
    
    // Error handler
    errorHandler
  };
};

/**
 * App Providers Component
 * Wraps the app with all necessary providers
 */
export const AppProviders = ({ children }) => {
  // Memoize services to ensure they're only created once
  const services = React.useMemo(() => createServices(), []);
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Initialize preferences state
  React.useEffect(() => {
    const initializePreferences = async () => {
      try {
        Logger.debug('Initializing preferences state...');
        await services.preferencesState.initialize();
        Logger.debug('Preferences state initialized successfully');
        Logger.debug('Loaded theme:', services.preferencesState.getCurrentTheme());
        setIsInitialized(true);
      } catch (error) {
        Logger.warn('Failed to initialize preferences:', error);
        setIsInitialized(true); // Still render the app even if initialization fails
      }
    };
    
    initializePreferences();
  }, [services]);

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#0b1020',
        color: '#e5e7eb'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <ServicesProvider services={services}>
      <ThemeProvider>
        <LocalizationProvider>
          <BreathingProvider>
            {children}
          </BreathingProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </ServicesProvider>
  );
};

export default AppProviders;
