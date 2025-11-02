/**
 * Timer Service
 * Manages breathing session timing following Single Responsibility Principle
 */

import { ServiceError, ERROR_CODES } from '../errors/AppError.js';
import { errorHandler } from '../errors/ErrorHandler.js';
import Logger from '../utils/Logger.js';

/**
 * Timer Service class
 * Handles breathing session timing and phase management
 */
export class TimerService {
  constructor() {
    this.isRunning = false;
    this.isPaused = false;
    this.currentTime = 0;
    this.totalDuration = 0;
    this.currentPhase = null;
    this.phaseIndex = 0;
    this.timeInPhase = 0;
    this.timeLeft = 0;
    this.timerId = null;
    this.listeners = new Map();
    this.technique = null;
    this.startTime = null;
    this.pausedTime = 0;
  }

  /**
   * Set breathing technique
   * @param {object} technique - Breathing technique object
   */
  setTechnique(technique) {
    this.technique = technique;
    this.totalDuration = technique.getTotalDuration();
    this.reset();
  }

  /**
   * Start timer
   * @returns {Promise<void>}
   */
  async start() {
    if (!this.technique) {
      throw new ServiceError(
        'Cannot start timer without technique',
        'TimerService',
        { technique: this.technique }
      );
    }

    if (this.isRunning) {
      return; // Already running
    }

    try {
      this.isRunning = true;
      this.isPaused = false;
      this.startTime = Date.now() - this.pausedTime;

      // Immediately get and set the initial phase
      this.currentPhase = this.technique.getCurrentPhase(this.currentTime);
      this.phaseIndex = this.currentPhase.phaseIndex;
      this.timeInPhase = this.currentPhase.timeInPhase;
      this.timeLeft = this.currentPhase.timeLeft;
      
      Logger.debug('service', 'TimerService: Starting with initial phase:', this.currentPhase);

      // Set up interval for subsequent updates
      this.timerId = setInterval(() => {
        this.updateTimer();
      }, 1000);

      // Notify listeners immediately with initial state
      this.notifyListeners('start', {
        currentTime: this.currentTime,
        totalDuration: this.totalDuration,
        currentPhase: this.currentPhase,
        phaseIndex: this.phaseIndex,
        timeInPhase: this.timeInPhase,
        timeLeft: this.timeLeft
      });
      
      // Also trigger an immediate update to ensure UI reflects the initial state
      this.notifyListeners('update', {
        currentTime: this.currentTime,
        totalDuration: this.totalDuration,
        currentPhase: this.currentPhase,
        phaseIndex: this.phaseIndex,
        timeInPhase: this.timeInPhase,
        timeLeft: this.timeLeft
      });

    } catch (error) {
      this.isRunning = false;
      throw new ServiceError(
        'Failed to start timer',
        'TimerService',
        { originalError: error.message }
      );
    }
  }

  /**
   * Pause timer
   */
  pause() {
    if (!this.isRunning || this.isPaused) {
      return;
    }

    this.isPaused = true;
    this.pausedTime = Date.now() - this.startTime;

    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }

    this.notifyListeners('pause', {
      currentTime: this.currentTime,
      totalDuration: this.totalDuration,
      currentPhase: this.currentPhase
    });
  }

  /**
   * Resume timer
   */
  resume() {
    if (!this.isRunning || !this.isPaused) {
      return;
    }

    this.isPaused = false;
    this.startTime = Date.now() - this.pausedTime;

    this.timerId = setInterval(() => {
      this.updateTimer();
    }, 1000);

    this.notifyListeners('resume', {
      currentTime: this.currentTime,
      totalDuration: this.totalDuration,
      currentPhase: this.currentPhase
    });
  }

  /**
   * Stop timer
   */
  stop() {
    this.isRunning = false;
    this.isPaused = false;

    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }

    this.notifyListeners('stop', {
      currentTime: this.currentTime,
      totalDuration: this.totalDuration,
      currentPhase: this.currentPhase
    });
  }

  /**
   * Reset timer
   */
  reset() {
    this.stop();
    this.currentTime = 0;
    this.phaseIndex = 0;
    this.timeInPhase = 0;
    this.timeLeft = 0;
    this.pausedTime = 0;
    this.startTime = null;

    if (this.technique) {
      this.currentPhase = this.technique.getCurrentPhase(0);
    }

    this.notifyListeners('reset', {
      currentTime: this.currentTime,
      totalDuration: this.totalDuration,
      currentPhase: this.currentPhase
    });
  }

  /**
   * Update timer state
   */
  updateTimer() {
    if (!this.isRunning || this.isPaused || !this.technique) {
      return;
    }

    this.currentTime += 1;
    
    // Get current phase information
    this.currentPhase = this.technique.getCurrentPhase(this.currentTime);
    this.phaseIndex = this.currentPhase.phaseIndex;
    this.timeInPhase = this.currentPhase.timeInPhase;
    this.timeLeft = this.currentPhase.timeLeft;

    // Notify listeners of timer update
    this.notifyListeners('update', {
      currentTime: this.currentTime,
      totalDuration: this.totalDuration,
      currentPhase: this.currentPhase,
      phaseIndex: this.phaseIndex,
      timeInPhase: this.timeInPhase,
      timeLeft: this.timeLeft
    });

    // Check if cycle is complete
    if (this.currentTime >= this.totalDuration) {
      this.notifyListeners('cycleComplete', {
        currentTime: this.currentTime,
        totalDuration: this.totalDuration,
        cyclesCompleted: Math.floor(this.currentTime / this.totalDuration)
      });
    }
  }

  /**
   * Add timer listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} - Unsubscribe function
   */
  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event).add(callback);

    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
        if (eventListeners.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  /**
   * Remove timer listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  removeListener(event, callback) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Notify listeners of an event
   * @param {string} event - Event name
   * @param {object} data - Event data
   */
  notifyListeners(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          errorHandler.handleError(
            new ServiceError(
              'Error in timer listener',
              'TimerService',
              { event, data, originalError: error.message }
            )
          );
        }
      });
    }
  }

  /**
   * Get current timer state
   * @returns {object} - Current timer state
   */
  getState() {
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      currentTime: this.currentTime,
      totalDuration: this.totalDuration,
      currentPhase: this.currentPhase,
      phaseIndex: this.phaseIndex,
      timeInPhase: this.timeInPhase,
      timeLeft: this.timeLeft,
      technique: this.technique?.getId() || null,
      startTime: this.startTime,
      pausedTime: this.pausedTime
    };
  }

  /**
   * Get current phase information
   * @returns {object|null} - Current phase info or null
   */
  getCurrentPhase() {
    return this.currentPhase;
  }

  /**
   * Get elapsed time
   * @returns {number} - Elapsed time in seconds
   */
  getElapsedTime() {
    return this.currentTime;
  }

  /**
   * Get remaining time
   * @returns {number} - Remaining time in seconds
   */
  getRemainingTime() {
    return this.totalDuration - this.currentTime;
  }

  /**
   * Get progress percentage
   * @returns {number} - Progress percentage (0-100)
   */
  getProgress() {
    if (this.totalDuration === 0) return 0;
    return Math.min(100, (this.currentTime / this.totalDuration) * 100);
  }

  /**
   * Get cycles completed
   * @returns {number} - Number of completed cycles
   */
  getCyclesCompleted() {
    return Math.floor(this.currentTime / this.totalDuration);
  }

  /**
   * Check if timer is running
   * @returns {boolean} - True if running
   */
  isCurrentlyRunning() {
    return this.isRunning && !this.isPaused;
  }

  /**
   * Check if timer is paused
   * @returns {boolean} - True if paused
   */
  isCurrentlyPaused() {
    return this.isRunning && this.isPaused;
  }

  /**
   * Get timer capabilities
   * @returns {object} - Timer capabilities
   */
  getCapabilities() {
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      hasTechnique: !!this.technique,
      techniqueId: this.technique?.getId() || null,
      totalDuration: this.totalDuration,
      currentTime: this.currentTime,
      listenerCount: Array.from(this.listeners.values()).reduce((sum, set) => sum + set.size, 0)
    };
  }

  /**
   * Dispose of timer service
   */
  dispose() {
    this.stop();
    this.listeners.clear();
    this.technique = null;
  }
}
