/**
 * Services Context
 * Provides dependency injection for services following Dependency Inversion Principle
 */

import React, { createContext, useContext, useMemo } from 'react';
import { AppError, ERROR_CODES } from '../errors/AppError.js';

/**
 * Services Context
 */
const ServicesContext = createContext(null);

/**
 * Services Provider Component
 * Provides all services through React Context
 */
export const ServicesProvider = ({ children, services = {} }) => {
  const contextValue = useMemo(() => ({
    // Core services
    audioService: services.audioService,
    vibrationService: services.vibrationService,
    themeService: services.themeService,
    storageService: services.storageService,
    timerService: services.timerService,
    
    // State managers
    appStateManager: services.appStateManager,
    sessionState: services.sessionState,
    preferencesState: services.preferencesState,
    
    // Strategy managers
    visualizationStrategyManager: services.visualizationStrategyManager,
    themeStrategyManager: services.themeStrategyManager,
    
    // Command invoker
    commandInvoker: services.commandInvoker,
    
    // Utilities
    errorHandler: services.errorHandler,
    
    // Validation
    validateServices: () => {
      const requiredServices = [
        'audioService', 'vibrationService', 'themeService', 
        'storageService', 'timerService', 'appStateManager',
        'sessionState', 'preferencesState', 'commandInvoker'
      ];
      
      const missingServices = requiredServices.filter(
        serviceName => !services[serviceName]
      );
      
      if (missingServices.length > 0) {
        throw new AppError(
          `Missing required services: ${missingServices.join(', ')}`,
          ERROR_CODES.DEPENDENCY_INJECTION_FAILED,
          { missingServices, availableServices: Object.keys(services) }
        );
      }
      
      return true;
    }
  }), [services]);

  return (
    <ServicesContext.Provider value={contextValue}>
      {children}
    </ServicesContext.Provider>
  );
};

/**
 * Hook to use services context
 * @returns {object} - Services context value
 */
export const useServices = () => {
  const context = useContext(ServicesContext);
  
  if (!context) {
    throw new AppError(
      'useServices must be used within a ServicesProvider',
      ERROR_CODES.DEPENDENCY_INJECTION_FAILED
    );
  }
  
  return context;
};

/**
 * Hook to use specific service
 * @param {string} serviceName - Name of the service
 * @returns {any} - Service instance
 */
export const useService = (serviceName) => {
  const services = useServices();
  
  if (!services[serviceName]) {
    throw new AppError(
      `Service '${serviceName}' not found in context`,
      ERROR_CODES.DEPENDENCY_INJECTION_FAILED,
      { serviceName, availableServices: Object.keys(services) }
    );
  }
  
  return services[serviceName];
};

/**
 * Hook to use audio service
 * @returns {object} - Audio service
 */
export const useAudioService = () => useService('audioService');

/**
 * Hook to use vibration service
 * @returns {object} - Vibration service
 */
export const useVibrationService = () => useService('vibrationService');

/**
 * Hook to use theme service
 * @returns {object} - Theme service
 */
export const useThemeService = () => useService('themeService');

/**
 * Hook to use storage service
 * @returns {object} - Storage service
 */
export const useStorageService = () => useService('storageService');

/**
 * Hook to use timer service
 * @returns {object} - Timer service
 */
export const useTimerService = () => useService('timerService');

/**
 * Hook to use app state manager
 * @returns {object} - App state manager
 */
export const useAppStateManager = () => useService('appStateManager');

/**
 * Hook to use session state
 * @returns {object} - Session state manager
 */
export const useSessionState = () => useService('sessionState');

/**
 * Hook to use preferences state
 * @returns {object} - Preferences state manager
 */
export const usePreferencesState = () => useService('preferencesState');

/**
 * Hook to use command invoker
 * @returns {object} - Command invoker
 */
export const useCommandInvoker = () => useService('commandInvoker');

/**
 * Hook to use visualization strategy manager
 * @returns {object} - Visualization strategy manager
 */
export const useVisualizationStrategyManager = () => useService('visualizationStrategyManager');

/**
 * Hook to use theme strategy manager
 * @returns {object} - Theme strategy manager
 */
export const useThemeStrategyManager = () => useService('themeStrategyManager');

/**
 * Hook to use error handler
 * @returns {object} - Error handler
 */
export const useErrorHandler = () => useService('errorHandler');

/**
 * Higher-order component to inject services
 * @param {React.Component} Component - Component to wrap
 * @returns {React.Component} - Wrapped component with services
 */
export const withServices = (Component) => {
  const WrappedComponent = (props) => {
    const services = useServices();
    return <Component {...props} services={services} />;
  };
  
  WrappedComponent.displayName = `withServices(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

/**
 * Hook to validate services
 * @returns {boolean} - True if all services are valid
 */
export const useValidateServices = () => {
  const services = useServices();
  return services.validateServices();
};

export default ServicesContext;
