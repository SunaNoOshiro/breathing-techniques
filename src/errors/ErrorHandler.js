/**
 * Centralized error handling system
 * Provides global error handling, logging, and recovery mechanisms
 */

import { AppError, ERROR_CODES } from './AppError.js';
import Logger from '../utils/Logger.js';

/**
 * Error severity levels
 */
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Error categories for grouping and handling
 */
export const ERROR_CATEGORY = {
  USER_INPUT: 'user_input',
  SYSTEM: 'system',
  NETWORK: 'network',
  STORAGE: 'storage',
  AUDIO: 'audio',
  VISUALIZATION: 'visualization',
  TECHNIQUE: 'technique',
  THEME: 'theme',
  LOCALIZATION: 'localization'
};

/**
 * Global error handler class
 */
export class ErrorHandler {
  constructor() {
    this.listeners = new Map();
    this.errorHistory = [];
    this.maxHistorySize = 100;
    this.isInitialized = false;
  }

  /**
   * Initialize the error handler
   */
  initialize() {
    if (this.isInitialized) return;

    // Set up global error handlers
    this.setupGlobalHandlers();
    
    // Set up unhandled promise rejection handler
    this.setupPromiseRejectionHandler();
    
    this.isInitialized = true;
  }

  /**
   * Set up global error handlers
   */
  setupGlobalHandlers() {
    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError(
        new AppError(
          event.error?.message || 'Uncaught JavaScript error',
          'JAVASCRIPT_ERROR',
          {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error?.stack
          }
        ),
        ERROR_SEVERITY.HIGH,
        ERROR_CATEGORY.SYSTEM
      );
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(
        new AppError(
          event.reason?.message || 'Unhandled promise rejection',
          'PROMISE_REJECTION',
          {
            reason: event.reason,
            stack: event.reason?.stack
          }
        ),
        ERROR_SEVERITY.MEDIUM,
        ERROR_CATEGORY.SYSTEM
      );
    });
  }

  /**
   * Set up promise rejection handler
   */
  setupPromiseRejectionHandler() {
    window.addEventListener('unhandledrejection', (event) => {
      event.preventDefault();
      this.handleError(
        new AppError(
          event.reason?.message || 'Unhandled promise rejection',
          'PROMISE_REJECTION',
          { reason: event.reason }
        ),
        ERROR_SEVERITY.MEDIUM,
        ERROR_CATEGORY.SYSTEM
      );
    });
  }

  /**
   * Handle an error
   */
  handleError(error, severity = ERROR_SEVERITY.MEDIUM, category = ERROR_CATEGORY.SYSTEM) {
    // Ensure error is an AppError instance
    if (!(error instanceof AppError)) {
      error = new AppError(
        error.message || 'Unknown error',
        'UNKNOWN_ERROR',
        { originalError: error }
      );
    }

    // Add metadata
    error.severity = severity;
    error.category = category;
    error.handledAt = new Date().toISOString();

    // Log the error
    this.logError(error);

    // Add to history
    this.addToHistory(error);

    // Notify listeners
    this.notifyListeners(error);

    // Handle based on severity
    this.handleBySeverity(error, severity);

    return error;
  }

  /**
   * Log error to console with appropriate level
   */
  logError(error) {
    const logLevel = this.getLogLevel(error.severity);
    const logMessage = `[${error.code}] ${error.message}`;
    const logData = {
      context: error.context,
      timestamp: error.timestamp,
      severity: error.severity,
      category: error.category
    };

    switch (logLevel) {
      case 'error':
        Logger.error(logMessage, logData);
        break;
      case 'warn':
        Logger.warn(logMessage, logData);
        break;
      case 'info':
        Logger.info(logMessage, logData);
        break;
      default:
        Logger.debug(logMessage, logData);
    }
  }

  /**
   * Get console log level based on error severity
   */
  getLogLevel(severity) {
    switch (severity) {
      case ERROR_SEVERITY.CRITICAL:
      case ERROR_SEVERITY.HIGH:
        return 'error';
      case ERROR_SEVERITY.MEDIUM:
        return 'warn';
      case ERROR_SEVERITY.LOW:
        return 'info';
      default:
        return 'log';
    }
  }

  /**
   * Add error to history
   */
  addToHistory(error) {
    this.errorHistory.unshift(error);
    
    // Keep history size manageable
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize);
    }
  }

  /**
   * Notify error listeners
   */
  notifyListeners(error) {
    this.listeners.forEach((callback, key) => {
      try {
        callback(error);
      } catch (listenerError) {
        Logger.error('Error in error listener:', listenerError);
      }
    });
  }

  /**
   * Handle error based on severity
   */
  handleBySeverity(error, severity) {
    switch (severity) {
      case ERROR_SEVERITY.CRITICAL:
        this.handleCriticalError(error);
        break;
      case ERROR_SEVERITY.HIGH:
        this.handleHighSeverityError(error);
        break;
      case ERROR_SEVERITY.MEDIUM:
        this.handleMediumSeverityError(error);
        break;
      case ERROR_SEVERITY.LOW:
        this.handleLowSeverityError(error);
        break;
    }
  }

  /**
   * Handle critical errors
   */
  handleCriticalError(error) {
    // For critical errors, we might want to:
    // - Show user notification
    // - Reset application state
    // - Send error reports
    Logger.error('CRITICAL ERROR:', error);
  }

  /**
   * Handle high severity errors
   */
  handleHighSeverityError(error) {
    // For high severity errors:
    // - Show user notification
    // - Log to external service
    Logger.error('HIGH SEVERITY ERROR:', error);
  }

  /**
   * Handle medium severity errors
   */
  handleMediumSeverityError(error) {
    // For medium severity errors:
    // - Log locally
    // - Maybe show subtle notification
    Logger.warn('MEDIUM SEVERITY ERROR:', error);
  }

  /**
   * Handle low severity errors
   */
  handleLowSeverityError(error) {
    // For low severity errors:
    // - Just log
    Logger.info('LOW SEVERITY ERROR:', error);
  }

  /**
   * Add error listener
   */
  addListener(key, callback) {
    this.listeners.set(key, callback);
  }

  /**
   * Remove error listener
   */
  removeListener(key) {
    this.listeners.delete(key);
  }

  /**
   * Get error history
   */
  getErrorHistory(limit = 10) {
    return this.errorHistory.slice(0, limit);
  }

  /**
   * Get errors by category
   */
  getErrorsByCategory(category) {
    return this.errorHistory.filter(error => error.category === category);
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity) {
    return this.errorHistory.filter(error => error.severity === severity);
  }

  /**
   * Clear error history
   */
  clearHistory() {
    this.errorHistory = [];
  }

  /**
   * Create a safe error wrapper for async functions
   */
  wrapAsync(fn, context = {}) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handleError(error, ERROR_SEVERITY.MEDIUM, ERROR_CATEGORY.SYSTEM);
        throw error;
      }
    };
  }

  /**
   * Create a safe error wrapper for sync functions
   */
  wrapSync(fn, context = {}) {
    return (...args) => {
      try {
        return fn(...args);
      } catch (error) {
        this.handleError(error, ERROR_SEVERITY.MEDIUM, ERROR_CATEGORY.SYSTEM);
        throw error;
      }
    };
  }
}

// Create and export singleton instance
export const errorHandler = new ErrorHandler();

// Initialize on module load
errorHandler.initialize();

/**
 * Convenience functions for common error handling
 */
export const handleError = (error, severity, category) => 
  errorHandler.handleError(error, severity, category);

export const addErrorListener = (key, callback) => 
  errorHandler.addListener(key, callback);

export const removeErrorListener = (key) => 
  errorHandler.removeListener(key);

export const getErrorHistory = (limit) => 
  errorHandler.getErrorHistory(limit);

export const wrapAsync = (fn, context) => 
  errorHandler.wrapAsync(fn, context);

export const wrapSync = (fn, context) => 
  errorHandler.wrapSync(fn, context);
