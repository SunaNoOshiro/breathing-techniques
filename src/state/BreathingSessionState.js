/**
 * Breathing Session State
 * Manages breathing session state following Single Responsibility Principle
 */

import { StateManager } from './Observer.js';
import { AppError, ERROR_CODES } from '../errors/AppError.js';
import Logger from '../utils/Logger.js';

/**
 * Breathing Session State class
 * Manages state for breathing sessions
 */
export class BreathingSessionState extends StateManager {
  constructor() {
    super({
      isRunning: false,
      isPaused: false,
      elapsedSeconds: 0,
      currentTechniqueId: null, // Will be set from preferences
      currentPhase: null,
      phaseIndex: 0,
      timeInPhase: 0,
      timeLeft: 0,
      cyclesCompleted: 0,
      sessionStartTime: null,
      sessionDuration: 0,
      technique: null
    });
  }

  /**
   * Initialize session state with default technique
   * @param {string} techniqueId - Optional technique ID to initialize with
   * @returns {Promise<void>}
   */
  async initialize(techniqueId = 'box4') {
    try {
      // Import technique registry dynamically to avoid circular dependencies
      const { techniqueRegistry } = await import('../techniques/TechniqueRegistry.js');
      const defaultTechnique = techniqueRegistry.getTechnique(techniqueId);
      
      if (defaultTechnique) {
        const initialPhase = defaultTechnique.getCurrentPhase(0);
        this.setState({
          currentTechniqueId: techniqueId,
          technique: defaultTechnique,
          currentPhase: initialPhase,
          phaseIndex: 0,
          timeInPhase: 0,
          timeLeft: initialPhase?.duration || 0
        });
      }
    } catch (error) {
      Logger.warn('state', 'Failed to initialize default technique:', error);
    }
  }

  /**
   * Start breathing session
   * @param {string} techniqueId - Technique ID
   * @param {object} technique - Technique object
   */
  startSession(techniqueId, technique) {
    this.setState({
      isRunning: true,
      isPaused: false,
      currentTechniqueId: techniqueId,
      technique: technique,
      sessionStartTime: Date.now(),
      elapsedSeconds: 0,
      cyclesCompleted: 0
    });
  }

  /**
   * Pause breathing session
   */
  pauseSession() {
    if (!this.state.isRunning) return;

    this.setState({
      isRunning: false,
      isPaused: true
    });
  }

  /**
   * Resume breathing session
   */
  resumeSession() {
    if (!this.state.isPaused) return;

    this.setState({
      isRunning: true,
      isPaused: false
    });
  }

  /**
   * Stop breathing session
   */
  stopSession() {
    this.setState({
      isRunning: false,
      isPaused: false,
      elapsedSeconds: 0,
      cyclesCompleted: 0,
      sessionStartTime: null,
      sessionDuration: 0
    });
  }

  /**
   * Reset breathing session
   */
  resetSession() {
    this.setState({
      isRunning: false,
      isPaused: false,
      elapsedSeconds: 0,
      phaseIndex: 0,
      timeInPhase: 0,
      timeLeft: 0,
      cyclesCompleted: 0,
      sessionStartTime: null,
      sessionDuration: 0,
      currentPhase: null
    });
  }

  /**
   * Update timer
   * @param {number} elapsedSeconds - Elapsed seconds
   * @param {object} phaseInfo - Current phase information (contains: phase, phaseIndex, timeInPhase, timeLeft, duration)
   */
  updateTimer(elapsedSeconds, phaseInfo) {
    Logger.debug('state', 'BreathingSessionState.updateTimer called:', { elapsedSeconds, phaseInfo });
    
    // Store the entire phaseInfo object which contains all phase data
    const newState = {
      elapsedSeconds,
      currentPhase: phaseInfo, // Store the whole phaseInfo object
      phaseIndex: phaseInfo.phaseIndex,
      timeInPhase: phaseInfo.timeInPhase,
      timeLeft: phaseInfo.timeLeft
    };

    // Check if cycle completed
    if (this.state.technique && elapsedSeconds >= this.state.technique.getTotalDuration()) {
      newState.cyclesCompleted = Math.floor(elapsedSeconds / this.state.technique.getTotalDuration());
    }

    // Update session duration
    if (this.state.sessionStartTime) {
      newState.sessionDuration = Date.now() - this.state.sessionStartTime;
    }

    Logger.debug('state', 'BreathingSessionState.updateTimer: Setting new state:', newState);
    Logger.debug('state', 'BreathingSessionState.updateTimer: Observer count:', this.getObserverCount());
    
    this.setState(newState);
    
    Logger.debug('state', 'BreathingSessionState.updateTimer: State updated successfully');
  }

  /**
   * Change technique
   * @param {string} techniqueId - New technique ID
   * @param {object} technique - New technique object
   */
  changeTechnique(techniqueId, technique) {
    this.setState({
      currentTechniqueId: techniqueId,
      technique: technique,
      elapsedSeconds: 0,
      phaseIndex: 0,
      timeInPhase: 0,
      timeLeft: 0,
      cyclesCompleted: 0,
      currentPhase: technique.getCurrentPhase(0)
    });
  }

  /**
   * Get current phase information
   * @returns {object|null} - Current phase info
   */
  getCurrentPhase() {
    return this.state.currentPhase;
  }

  /**
   * Get session progress
   * @returns {number} - Progress percentage (0-100)
   */
  getSessionProgress() {
    if (!this.state.technique) return 0;
    
    const totalDuration = this.state.technique.getTotalDuration();
    if (totalDuration === 0) return 0;
    
    return Math.min(100, (this.state.elapsedSeconds / totalDuration) * 100);
  }

  /**
   * Get cycle progress
   * @returns {number} - Cycle progress percentage (0-100)
   */
  getCycleProgress() {
    if (!this.state.technique) return 0;
    
    const totalDuration = this.state.technique.getTotalDuration();
    if (totalDuration === 0) return 0;
    
    const cycleElapsed = this.state.elapsedSeconds % totalDuration;
    return Math.min(100, (cycleElapsed / totalDuration) * 100);
  }

  /**
   * Get session statistics
   * @returns {object} - Session statistics
   */
  getSessionStats() {
    return {
      isRunning: this.state.isRunning,
      isPaused: this.state.isPaused,
      elapsedSeconds: this.state.elapsedSeconds,
      sessionDuration: this.state.sessionDuration,
      cyclesCompleted: this.state.cyclesCompleted,
      currentTechniqueId: this.state.currentTechniqueId,
      sessionProgress: this.getSessionProgress(),
      cycleProgress: this.getCycleProgress(),
      currentPhase: this.state.currentPhase,
      phaseIndex: this.state.phaseIndex,
      timeInPhase: this.state.timeInPhase,
      timeLeft: this.state.timeLeft
    };
  }

  /**
   * Check if session is active
   * @returns {boolean} - True if session is active
   */
  isSessionActive() {
    return this.state.isRunning || this.state.isPaused;
  }

  /**
   * Get session duration in minutes
   * @returns {number} - Session duration in minutes
   */
  getSessionDurationMinutes() {
    return Math.floor(this.state.sessionDuration / 60000);
  }

  /**
   * Get average cycle time
   * @returns {number} - Average cycle time in seconds
   */
  getAverageCycleTime() {
    if (this.state.cyclesCompleted === 0) return 0;
    
    const totalCycleTime = this.state.elapsedSeconds;
    return totalCycleTime / this.state.cyclesCompleted;
  }

  /**
   * Get technique duration
   * @returns {number} - Technique duration in seconds
   */
  getTechniqueDuration() {
    return this.state.technique ? this.state.technique.getTotalDuration() : 0;
  }

  /**
   * Get remaining time in current phase
   * @returns {number} - Remaining time in seconds
   */
  getRemainingTimeInPhase() {
    return this.state.timeLeft;
  }

  /**
   * Get time in current phase
   * @returns {number} - Time in current phase in seconds
   */
  getTimeInCurrentPhase() {
    return this.state.timeInPhase;
  }

  /**
   * Get current phase index
   * @returns {number} - Current phase index
   */
  getCurrentPhaseIndex() {
    return this.state.phaseIndex;
  }

  /**
   * Get total phases count
   * @returns {number} - Total phases count
   */
  getTotalPhasesCount() {
    return this.state.technique ? this.state.technique.phases.length : 0;
  }

  /**
   * Get phase progress
   * @returns {number} - Phase progress percentage (0-100)
   */
  getPhaseProgress() {
    if (!this.state.technique || this.state.phaseIndex >= this.state.technique.phases.length) {
      return 0;
    }

    const phaseDuration = this.state.technique.durationsSec[this.state.phaseIndex];
    if (phaseDuration === 0) return 100;

    return Math.min(100, (this.state.timeInPhase / phaseDuration) * 100);
  }

  /**
   * Validate session state
   * @returns {boolean} - True if state is valid
   */
  validateState() {
    try {
      // Check required properties
      const requiredProps = [
        'isRunning', 'isPaused', 'elapsedSeconds', 'currentTechniqueId',
        'phaseIndex', 'timeInPhase', 'timeLeft', 'cyclesCompleted'
      ];

      for (const prop of requiredProps) {
        if (this.state[prop] === undefined) {
          throw new AppError(
            `Missing required property: ${prop}`,
            ERROR_CODES.STATE_UPDATE_FAILED,
            { property: prop, state: this.state }
          );
        }
      }

      // Validate data types
      if (typeof this.state.isRunning !== 'boolean') {
        throw new AppError(
          'isRunning must be boolean',
          ERROR_CODES.STATE_UPDATE_FAILED,
          { value: this.state.isRunning }
        );
      }

      if (typeof this.state.elapsedSeconds !== 'number' || this.state.elapsedSeconds < 0) {
        throw new AppError(
          'elapsedSeconds must be non-negative number',
          ERROR_CODES.STATE_UPDATE_FAILED,
          { value: this.state.elapsedSeconds }
        );
      }

      return true;
    } catch (error) {
      Logger.error('state', 'Session state validation failed:', error);
      return false;
    }
  }

  /**
   * Export session data
   * @returns {object} - Session data for export
   */
  exportSessionData() {
    return {
      sessionStats: this.getSessionStats(),
      techniqueId: this.state.currentTechniqueId,
      startTime: this.state.sessionStartTime,
      endTime: Date.now(),
      duration: this.state.sessionDuration,
      cyclesCompleted: this.state.cyclesCompleted,
      averageCycleTime: this.getAverageCycleTime()
    };
  }

  /**
   * Import session data
   * @param {object} data - Session data to import
   */
  importSessionData(data) {
    this.setState({
      currentTechniqueId: data.techniqueId || 'box4',
      sessionStartTime: data.startTime || null,
      sessionDuration: data.duration || 0,
      cyclesCompleted: data.cyclesCompleted || 0
    });
  }
}
