/**
 * Breathing App Facade
 * Implements Facade pattern to provide a simplified interface
 * Hides complexity of services, state management, and commands
 */

import Logger from '../utils/Logger.js';

export class BreathingAppFacade {
  constructor(services, stateManager, commandInvoker) {
    this.services = services;
    this.stateManager = stateManager;
    this.commandInvoker = commandInvoker;
  }

  // ===== BREATHING SESSION MANAGEMENT =====

  /**
   * Start a breathing session
   * @param {string} techniqueId - Technique ID to use
   * @param {object} options - Session options
   * @returns {Promise<boolean>} - Success status
   */
  async startSession(techniqueId, options = {}) {
    try {
      const command = this.commandInvoker.createCommand('StartBreathing', {
        techniqueId,
        options
      });
      
      await this.commandInvoker.execute(command);
      return true;
    } catch (error) {
      Logger.error("facade", 'Failed to start session:', error);
      return false;
    }
  }

  /**
   * Pause the current session
   * @returns {Promise<boolean>} - Success status
   */
  async pauseSession() {
    try {
      const command = this.commandInvoker.createCommand('PauseBreathing');
      await this.commandInvoker.execute(command);
      return true;
    } catch (error) {
      Logger.error("facade", 'Failed to pause session:', error);
      return false;
    }
  }

  /**
   * Resume the paused session
   * @returns {Promise<boolean>} - Success status
   */
  async resumeSession() {
    try {
      const command = this.commandInvoker.createCommand('ResumeBreathing');
      await this.commandInvoker.execute(command);
      return true;
    } catch (error) {
      Logger.error("facade", 'Failed to resume session:', error);
      return false;
    }
  }

  /**
   * Stop the current session
   * @returns {Promise<boolean>} - Success status
   */
  async stopSession() {
    try {
      const command = this.commandInvoker.createCommand('StopBreathing');
      await this.commandInvoker.execute(command);
      return true;
    } catch (error) {
      Logger.error("facade", 'Failed to stop session:', error);
      return false;
    }
  }

  // ===== TECHNIQUE MANAGEMENT =====

  /**
   * Get all available techniques
   * @returns {Array} - Array of technique objects
   */
  getAvailableTechniques() {
    return this.services.techniqueRegistry.getAllTechniques();
  }

  /**
   * Get current technique
   * @returns {object|null} - Current technique or null
   */
  getCurrentTechnique() {
    const sessionState = this.stateManager.getState('breathingSession');
    return sessionState.currentTechnique;
  }

  /**
   * Change to a different technique
   * @param {string} techniqueId - New technique ID
   * @returns {Promise<boolean>} - Success status
   */
  async changeTechnique(techniqueId) {
    try {
      const command = this.commandInvoker.createCommand('ChangeTechnique', {
        techniqueId
      });
      
      await this.commandInvoker.execute(command);
      return true;
    } catch (error) {
      Logger.error("facade", 'Failed to change technique:', error);
      return false;
    }
  }

  // ===== THEME MANAGEMENT =====

  /**
   * Get all available themes
   * @returns {Array} - Array of theme objects
   */
  getAvailableThemes() {
    return this.services.themeService.getAvailableThemes();
  }

  /**
   * Get current theme
   * @returns {object} - Current theme object
   */
  getCurrentTheme() {
    return this.services.themeService.getCurrentTheme();
  }

  /**
   * Change theme
   * @param {string} themeId - Theme ID
   * @returns {Promise<boolean>} - Success status
   */
  async changeTheme(themeId) {
    try {
      const command = this.commandInvoker.createCommand('ChangeTheme', {
        themeId
      });
      
      await this.commandInvoker.execute(command);
      return true;
    } catch (error) {
      Logger.error("facade", 'Failed to change theme:', error);
      return false;
    }
  }

  // ===== USER PREFERENCES =====

  /**
   * Get user preferences
   * @returns {object} - User preferences object
   */
  getUserPreferences() {
    const preferencesState = this.stateManager.getState('userPreferences');
    return preferencesState.preferences;
  }

  /**
   * Update user preferences
   * @param {object} preferences - New preferences
   * @returns {Promise<boolean>} - Success status
   */
  async updatePreferences(preferences) {
    try {
      this.stateManager.updateState('userPreferences', {
        preferences: { ...this.getUserPreferences(), ...preferences }
      });
      return true;
    } catch (error) {
      Logger.error("facade", 'Failed to update preferences:', error);
      return false;
    }
  }

  /**
   * Toggle audio setting
   * @returns {Promise<boolean>} - Success status
   */
  async toggleAudio() {
    const currentPrefs = this.getUserPreferences();
    return this.updatePreferences({
      audioEnabled: !currentPrefs.audioEnabled
    });
  }

  /**
   * Toggle vibration setting
   * @returns {Promise<boolean>} - Success status
   */
  async toggleVibration() {
    const currentPrefs = this.getUserPreferences();
    return this.updatePreferences({
      vibrationEnabled: !currentPrefs.vibrationEnabled
    });
  }

  // ===== SESSION STATE =====

  /**
   * Get current session state
   * @returns {object} - Session state object
   */
  getSessionState() {
    return this.stateManager.getState('breathingSession');
  }

  /**
   * Get session statistics
   * @returns {object} - Session statistics
   */
  getSessionStats() {
    const sessionState = this.getSessionState();
    return {
      isActive: sessionState.isActive,
      isPaused: sessionState.isPaused,
      currentPhase: sessionState.currentPhase,
      elapsedTime: sessionState.elapsedTime,
      totalCycles: sessionState.totalCycles,
      technique: sessionState.currentTechnique
    };
  }

  // ===== AUDIO & VIBRATION =====

  /**
   * Play audio cue
   * @param {string} type - Audio type (beep, tone, etc.)
   * @param {object} options - Audio options
   * @returns {Promise<boolean>} - Success status
   */
  async playAudio(type, options = {}) {
    try {
      const preferences = this.getUserPreferences();
      if (!preferences.audioEnabled) {
        return false;
      }

      await this.services.audioService.playSound(type, options);
      return true;
    } catch (error) {
      Logger.error("facade", 'Failed to play audio:', error);
      return false;
    }
  }

  /**
   * Trigger vibration
   * @param {string} pattern - Vibration pattern
   * @returns {Promise<boolean>} - Success status
   */
  async triggerVibration(pattern = 'short') {
    try {
      const preferences = this.getUserPreferences();
      if (!preferences.vibrationEnabled) {
        return false;
      }

      await this.services.vibrationService.vibrate(pattern);
      return true;
    } catch (error) {
      Logger.error("facade", 'Failed to trigger vibration:', error);
      return false;
    }
  }

  // ===== COMMAND MANAGEMENT =====

  /**
   * Undo last command
   * @returns {Promise<boolean>} - Success status
   */
  async undo() {
    try {
      await this.commandInvoker.undo();
      return true;
    } catch (error) {
      Logger.error("facade", 'Failed to undo:', error);
      return false;
    }
  }

  /**
   * Redo last undone command
   * @returns {Promise<boolean>} - Success status
   */
  async redo() {
    try {
      await this.commandInvoker.redo();
      return true;
    } catch (error) {
      Logger.error("facade", 'Failed to redo:', error);
      return false;
    }
  }

  /**
   * Check if undo is available
   * @returns {boolean} - True if undo is available
   */
  canUndo() {
    return this.commandInvoker.canUndo();
  }

  /**
   * Check if redo is available
   * @returns {boolean} - True if redo is available
   */
  canRedo() {
    return this.commandInvoker.canRedo();
  }

  // ===== UTILITY METHODS =====

  /**
   * Get app status
   * @returns {object} - App status information
   */
  getAppStatus() {
    const sessionState = this.getSessionState();
    const preferences = this.getUserPreferences();
    
    return {
      isOnline: navigator.onLine,
      sessionActive: sessionState.isActive,
      sessionPaused: sessionState.isPaused,
      audioEnabled: preferences.audioEnabled,
      vibrationEnabled: preferences.vibrationEnabled,
      currentTheme: this.getCurrentTheme().id,
      currentTechnique: sessionState.currentTechnique?.id
    };
  }

  /**
   * Reset app to initial state
   * @returns {Promise<boolean>} - Success status
   */
  async resetApp() {
    try {
      await this.stopSession();
      this.stateManager.reset();
      return true;
    } catch (error) {
      Logger.error("facade", 'Failed to reset app:', error);
      return false;
    }
  }
}
