/**
 * Vibration Service
 * Handles device vibration following Single Responsibility Principle
 */

import { ServiceError, ERROR_CODES } from '../errors/AppError.js';
import { errorHandler } from '../errors/ErrorHandler.js';
import Logger from '../utils/Logger.js';

/**
 * Vibration Service class
 * Manages device vibration functionality
 */
export class VibrationService {
  constructor() {
    this.isEnabled = false;
    this.isSupported = this.checkSupport();
    this.patterns = new Map();
    this.isVibrating = false;
  }

  /**
   * Check if vibration is supported
   * @returns {boolean} - True if vibration is supported
   */
  checkSupport() {
    return !!(navigator.vibrate && typeof navigator.vibrate === 'function');
  }

  /**
   * Set vibration enabled state
   * @param {boolean} enabled - Whether vibration is enabled
   */
  setEnabled(enabled) {
    Logger.debug('service', 'VibrationService.setEnabled called with:', enabled);
    Logger.debug('service', 'Previous state:', this.isEnabled, '-> New state:', enabled);
    this.isEnabled = enabled;
  }

  /**
   * Get vibration enabled state
   * @returns {boolean} - Whether vibration is enabled
   */
  getEnabled() {
    return this.isEnabled;
  }

  /**
   * Check if vibration is supported
   * @returns {boolean} - True if vibration is supported
   */
  getSupported() {
    return this.isSupported;
  }

  /**
   * Vibrate device
   * @param {number|number[]} pattern - Vibration pattern
   * @returns {Promise<void>}
   */
  async vibrate(pattern = 10) {
    Logger.debug('service', 'VibrationService.vibrate called with pattern:', pattern);
    Logger.debug('service', 'VibrationService state - isEnabled:', this.isEnabled, 'isSupported:', this.isSupported);
    
    if (!this.isEnabled) {
      Logger.debug('service', 'Vibration not enabled, skipping vibrate call');
      return;
    }
    
    if (!this.isSupported) {
      Logger.warn('service', 'Vibration not supported on this device');
      return;
    }

    try {
      Logger.debug('service', 'Calling navigator.vibrate with pattern:', pattern);
      const result = navigator.vibrate(pattern);
      Logger.debug('service', 'navigator.vibrate result:', result);
      this.isVibrating = true;

      // Calculate total duration for pattern
      const duration = Array.isArray(pattern) 
        ? pattern.reduce((sum, val) => sum + val, 0)
        : pattern;

      // Reset vibrating state after duration
      setTimeout(() => {
        this.isVibrating = false;
      }, duration);

    } catch (error) {
      Logger.error('service', 'Vibration error:', error);
      throw new ServiceError(
        'Failed to vibrate device',
        'VibrationService',
        { 
          pattern, 
          originalError: error.message 
        }
      );
    }
  }

  /**
   * Stop vibration
   */
  stop() {
    if (this.isSupported) {
      try {
        navigator.vibrate(0);
        this.isVibrating = false;
      } catch (error) {
        errorHandler.handleError(
          new ServiceError(
            'Failed to stop vibration',
            'VibrationService',
            { originalError: error.message }
          )
        );
      }
    }
  }

  /**
   * Register a vibration pattern
   * @param {string} name - Pattern name
   * @param {number|number[]} pattern - Vibration pattern
   */
  registerPattern(name, pattern) {
    this.patterns.set(name, pattern);
  }

  /**
   * Get registered pattern
   * @param {string} name - Pattern name
   * @returns {number|number[]|undefined} - Pattern or undefined
   */
  getPattern(name) {
    return this.patterns.get(name);
  }

  /**
   * Play registered pattern
   * @param {string} name - Pattern name
   * @returns {Promise<void>}
   */
  async playPattern(name) {
    const pattern = this.getPattern(name);
    if (pattern) {
      await this.vibrate(pattern);
    } else {
      throw new ServiceError(
        `Vibration pattern '${name}' not found`,
        'VibrationService',
        { patternName: name, availablePatterns: Array.from(this.patterns.keys()) }
      );
    }
  }

  /**
   * Get all registered patterns
   * @returns {object} - Object with pattern names and values
   */
  getAllPatterns() {
    return Object.fromEntries(this.patterns);
  }

  /**
   * Remove pattern
   * @param {string} name - Pattern name
   */
  removePattern(name) {
    this.patterns.delete(name);
  }

  /**
   * Clear all patterns
   */
  clearPatterns() {
    this.patterns.clear();
  }

  /**
   * Check if currently vibrating
   * @returns {boolean} - True if vibrating
   */
  isCurrentlyVibrating() {
    return this.isVibrating;
  }

  /**
   * Get vibration capabilities
   * @returns {object} - Vibration capabilities
   */
  getCapabilities() {
    return {
      supported: this.isSupported,
      enabled: this.isEnabled,
      isVibrating: this.isVibrating,
      patternCount: this.patterns.size,
      availablePatterns: Array.from(this.patterns.keys())
    };
  }

  /**
   * Create common vibration patterns
   */
  createDefaultPatterns() {
    this.registerPattern('short', 10);
    this.registerPattern('medium', 50);
    this.registerPattern('long', 100);
    this.registerPattern('double', [10, 50, 10]);
    this.registerPattern('triple', [10, 50, 10, 50, 10]);
    this.registerPattern('pulse', [10, 20, 10, 20, 10]);
    this.registerPattern('heartbeat', [10, 50, 10, 50, 10, 100, 10]);
  }

  /**
   * Dispose of vibration service
   */
  dispose() {
    this.stop();
    this.clearPatterns();
    this.isEnabled = false;
  }
}
