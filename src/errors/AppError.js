/**
 * Base application error class
 * Provides structured error handling with error codes and context
 */

export class AppError extends Error {
  constructor(message, code = 'APP_ERROR', context = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.context = context;
    this.timestamp = new Date().toISOString();
    
    // Maintain proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * Convert error to plain object for logging/serialization
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }

  /**
   * Check if error is of specific type
   */
  isType(errorCode) {
    return this.code === errorCode;
  }
}

/**
 * Technique-specific errors
 */
export class TechniqueError extends AppError {
  constructor(message, techniqueId, context = {}) {
    super(message, 'TECHNIQUE_ERROR', { techniqueId, ...context });
    this.name = 'TechniqueError';
    this.techniqueId = techniqueId;
  }
}

/**
 * Storage-related errors
 */
export class StorageError extends AppError {
  constructor(message, operation, context = {}) {
    super(message, 'STORAGE_ERROR', { operation, ...context });
    this.name = 'StorageError';
    this.operation = operation;
  }
}

/**
 * Service-related errors
 */
export class ServiceError extends AppError {
  constructor(message, serviceName, context = {}) {
    super(message, 'SERVICE_ERROR', { serviceName, ...context });
    this.name = 'ServiceError';
    this.serviceName = serviceName;
  }
}

/**
 * Validation errors
 */
export class ValidationError extends AppError {
  constructor(message, field, value, context = {}) {
    super(message, 'VALIDATION_ERROR', { field, value, ...context });
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
  }
}

/**
 * Configuration errors
 */
export class ConfigurationError extends AppError {
  constructor(message, configKey, context = {}) {
    super(message, 'CONFIGURATION_ERROR', { configKey, ...context });
    this.name = 'ConfigurationError';
    this.configKey = configKey;
  }
}

/**
 * Error codes constants
 */
export const ERROR_CODES = {
  TECHNIQUE_NOT_FOUND: 'TECHNIQUE_NOT_FOUND',
  TECHNIQUE_INVALID: 'TECHNIQUE_INVALID',
  TECHNIQUE_REGISTRATION_FAILED: 'TECHNIQUE_REGISTRATION_FAILED',
  STORAGE_READ_FAILED: 'STORAGE_READ_FAILED',
  STORAGE_WRITE_FAILED: 'STORAGE_WRITE_FAILED',
  STORAGE_CLEAR_FAILED: 'STORAGE_CLEAR_FAILED',
  AUDIO_CONTEXT_FAILED: 'AUDIO_CONTEXT_FAILED',
  AUDIO_PLAYBACK_FAILED: 'AUDIO_PLAYBACK_FAILED',
  VIBRATION_NOT_SUPPORTED: 'VIBRATION_NOT_SUPPORTED',
  VIBRATION_FAILED: 'VIBRATION_FAILED',
  THEME_NOT_FOUND: 'THEME_NOT_FOUND',
  THEME_INVALID: 'THEME_INVALID',
  LOCALIZATION_LOAD_FAILED: 'LOCALIZATION_LOAD_FAILED',
  LOCALIZATION_KEY_NOT_FOUND: 'LOCALIZATION_KEY_NOT_FOUND',
  TIMER_START_FAILED: 'TIMER_START_FAILED',
  TIMER_STOP_FAILED: 'TIMER_STOP_FAILED',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  CONFIGURATION_INVALID: 'CONFIGURATION_INVALID',
  DEPENDENCY_INJECTION_FAILED: 'DEPENDENCY_INJECTION_FAILED',
  COMMAND_EXECUTION_FAILED: 'COMMAND_EXECUTION_FAILED',
  STATE_UPDATE_FAILED: 'STATE_UPDATE_FAILED'
};
