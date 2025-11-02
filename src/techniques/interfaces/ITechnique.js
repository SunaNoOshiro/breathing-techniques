/**
 * Base interfaces for techniques following Interface Segregation Principle
 * Separates concerns into focused interfaces
 */

/**
 * Core technique interface
 * Defines essential breathing technique functionality
 */
export class ITechnique {
  /**
   * Get technique unique identifier
   * @returns {string} - Technique ID
   */
  getId() {
    throw new Error('getId method must be implemented');
  }

  /**
   * Get technique name
   * @returns {string} - Technique name
   */
  getName() {
    throw new Error('getName method must be implemented');
  }

  /**
   * Get technique description
   * @returns {string} - Technique description
   */
  getDescription() {
    throw new Error('getDescription method must be implemented');
  }

  /**
   * Get technique benefits
   * @returns {string} - Technique benefits
   */
  getBenefits() {
    throw new Error('getBenefits method must be implemented');
  }

  /**
   * Get breathing pattern
   * @returns {string} - Pattern string (e.g., "4-4-4-4")
   */
  getPattern() {
    throw new Error('getPattern method must be implemented');
  }

  /**
   * Get technique phases
   * @returns {Array<{key: string, name: string}>} - Array of phases
   */
  getPhases() {
    throw new Error('getPhases method must be implemented');
  }

  /**
   * Get phase durations in seconds
   * @returns {number[]} - Array of durations
   */
  getDurationsSec() {
    throw new Error('getDurationsSec method must be implemented');
  }

  /**
   * Get total duration of one complete cycle
   * @returns {number} - Total duration in seconds
   */
  getTotalDuration() {
    throw new Error('getTotalDuration method must be implemented');
  }

  /**
   * Get current phase based on elapsed time
   * @param {number} elapsedSeconds - Elapsed time in seconds
   * @returns {object} - Current phase information
   */
  getCurrentPhase(elapsedSeconds) {
    throw new Error('getCurrentPhase method must be implemented');
  }

  /**
   * Validate technique configuration
   * @returns {boolean} - True if valid
   */
  validate() {
    throw new Error('validate method must be implemented');
  }
}

/**
 * Visualization interface
 * Defines visualization-related functionality
 */
export class IVisualization {
  /**
   * Get visualization points for the technique
   * @returns {Array<{x: number, y: number, label: string}>} - Visualization points
   */
  getVisualizationPoints() {
    throw new Error('getVisualizationPoints method must be implemented');
  }

  /**
   * Get lung scaling based on current phase
   * @param {string} phaseKey - Current phase key
   * @param {number} timeInPhase - Time in current phase
   * @param {number} duration - Phase duration
   * @returns {number} - Lung scaling factor
   */
  getLungScaling(phaseKey, timeInPhase, duration) {
    throw new Error('getLungScaling method must be implemented');
  }

  /**
   * Get diaphragm offset based on lung scaling
   * @param {number} lungScaling - Lung scaling factor
   * @returns {number} - Diaphragm Y offset
   */
  getDiaphragmOffset(lungScaling) {
    throw new Error('getDiaphragmOffset method must be implemented');
  }
}

/**
 * Color scheme interface
 * Defines color-related functionality
 */
export class IColorable {
  /**
   * Get technique-specific color scheme
   * @returns {object} - Color scheme object
   */
  getColorScheme() {
    throw new Error('getColorScheme method must be implemented');
  }

  /**
   * Get phase-specific colors
   * @param {string} phaseKey - Phase key
   * @returns {object} - Phase colors
   */
  getPhaseColors(phaseKey) {
    throw new Error('getPhaseColors method must be implemented');
  }
}

/**
 * Instructions interface
 * Defines instruction-related functionality
 */
export class IInstructable {
  /**
   * Get technique-specific instructions
   * @returns {string[]} - Array of instruction strings
   */
  getInstructions() {
    throw new Error('getInstructions method must be implemented');
  }

  /**
   * Get technique tips
   * @returns {string[]} - Array of tip strings
   */
  getTips() {
    throw new Error('getTips method must be implemented');
  }
}

/**
 * Audio interface
 * Defines audio-related functionality
 */
export class IAudioEnabled {
  /**
   * Get audio configuration for technique
   * @returns {object} - Audio configuration
   */
  getAudioConfig() {
    throw new Error('getAudioConfig method must be implemented');
  }

  /**
   * Get phase-specific audio settings
   * @param {string} phaseKey - Phase key
   * @returns {object} - Phase audio settings
   */
  getPhaseAudio(phaseKey) {
    throw new Error('getPhaseAudio method must be implemented');
  }
}

/**
 * Difficulty interface
 * Defines difficulty-related functionality
 */
export class IDifficulty {
  /**
   * Get technique difficulty level
   * @returns {string} - Difficulty level (beginner, intermediate, advanced)
   */
  getDifficulty() {
    throw new Error('getDifficulty method must be implemented');
  }

  /**
   * Get technique category
   * @returns {string} - Technique category
   */
  getCategory() {
    throw new Error('getCategory method must be implemented');
  }

  /**
   * Check if technique is suitable for given level
   * @param {string} level - User level
   * @returns {boolean} - True if suitable
   */
  isSuitableForLevel(level) {
    throw new Error('isSuitableForLevel method must be implemented');
  }
}

/**
 * Analytics interface
 * Defines analytics-related functionality
 */
export class IAnalytics {
  /**
   * Track technique usage
   * @param {object} data - Usage data
   */
  trackUsage(data) {
    throw new Error('trackUsage method must be implemented');
  }

  /**
   * Get technique metrics
   * @returns {object} - Technique metrics
   */
  getMetrics() {
    throw new Error('getMetrics method must be implemented');
  }
}

/**
 * Configuration interface
 * Defines configuration-related functionality
 */
export class IConfigurable {
  /**
   * Get technique configuration
   * @returns {object} - Configuration object
   */
  getConfiguration() {
    throw new Error('getConfiguration method must be implemented');
  }

  /**
   * Update technique configuration
   * @param {object} config - New configuration
   */
  updateConfiguration(config) {
    throw new Error('updateConfiguration method must be implemented');
  }

  /**
   * Reset to default configuration
   */
  resetConfiguration() {
    throw new Error('resetConfiguration method must be implemented');
  }
}
