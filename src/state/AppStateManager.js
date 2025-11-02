/**
 * App State Manager
 * Central state management following Single Responsibility Principle
 */

import { StateManager } from './Observer.js';
import { BreathingSessionState } from './BreathingSessionState.js';
import { UserPreferencesState } from './UserPreferencesState.js';
import { AppError, ERROR_CODES } from '../errors/AppError.js';

/**
 * App State Manager class
 * Manages overall application state and coordinates sub-states
 */
export class AppStateManager extends StateManager {
  constructor() {
    super({
      isInitialized: false,
      isLoading: false,
      error: null,
      currentView: 'main',
      isOnline: navigator.onLine,
      lastActivity: Date.now(),
      appVersion: '1.0.0',
      buildNumber: '1'
    });

    // Initialize sub-states
    this.sessionState = new BreathingSessionState();
    this.preferencesState = new UserPreferencesState();

    // Subscribe to sub-state changes
    this.setupSubStateListeners();
  }

  /**
   * Setup listeners for sub-state changes
   */
  setupSubStateListeners() {
    // Listen to session state changes
    this.sessionState.subscribe((data) => {
      this.notifyObservers({
        type: 'sessionStateChanged',
        sessionState: this.sessionState.getState(),
        sessionStats: this.sessionState.getSessionStats()
      });
    });

    // Listen to preferences state changes
    this.preferencesState.subscribe((data) => {
      this.notifyObservers({
        type: 'preferencesStateChanged',
        preferences: this.preferencesState.getAllPreferences()
      });
    });
  }

  /**
   * Initialize application state
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.state.isInitialized) return;

    this.setState({ isLoading: true });

    try {
      // Initialize sub-states
      await this.sessionState.initialize?.();
      await this.preferencesState.initialize?.();

      // Set up online/offline listeners
      this.setupOnlineListeners();

      // Set up activity tracking
      this.setupActivityTracking();

      this.setState({
        isInitialized: true,
        isLoading: false,
        error: null
      });

      this.notifyObservers({
        type: 'appInitialized',
        state: this.getState()
      });

    } catch (error) {
      this.setState({
        isLoading: false,
        error: error.message
      });

      throw new AppError(
        'Failed to initialize application state',
        ERROR_CODES.STATE_UPDATE_FAILED,
        { originalError: error.message }
      );
    }
  }

  /**
   * Setup online/offline listeners
   */
  setupOnlineListeners() {
    window.addEventListener('online', () => {
      this.setState({ isOnline: true });
      this.notifyObservers({
        type: 'connectionChanged',
        isOnline: true
      });
    });

    window.addEventListener('offline', () => {
      this.setState({ isOnline: false });
      this.notifyObservers({
        type: 'connectionChanged',
        isOnline: false
      });
    });
  }

  /**
   * Setup activity tracking
   */
  setupActivityTracking() {
    const updateActivity = () => {
      this.setState({ lastActivity: Date.now() });
    };

    // Track user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });
  }

  /**
   * Set current view
   * @param {string} view - View name
   */
  setCurrentView(view) {
    this.setState({ currentView: view });
  }

  /**
   * Set loading state
   * @param {boolean} loading - Whether app is loading
   */
  setLoading(loading) {
    this.setState({ isLoading: loading });
  }

  /**
   * Set error state
   * @param {string|null} error - Error message or null to clear
   */
  setError(error) {
    this.setState({ error });
  }

  /**
   * Clear error state
   */
  clearError() {
    this.setState({ error: null });
  }

  /**
   * Get session state manager
   * @returns {BreathingSessionState} - Session state manager
   */
  getSessionState() {
    return this.sessionState;
  }

  /**
   * Get preferences state manager
   * @returns {UserPreferencesState} - Preferences state manager
   */
  getPreferencesState() {
    return this.preferencesState;
  }

  /**
   * Get current view
   * @returns {string} - Current view
   */
  getCurrentView() {
    return this.state.currentView;
  }

  /**
   * Check if app is initialized
   * @returns {boolean} - True if initialized
   */
  isInitialized() {
    return this.state.isInitialized;
  }

  /**
   * Check if app is loading
   * @returns {boolean} - True if loading
   */
  isLoading() {
    return this.state.isLoading;
  }

  /**
   * Check if app is online
   * @returns {boolean} - True if online
   */
  isOnline() {
    return this.state.isOnline;
  }

  /**
   * Get last activity time
   * @returns {number} - Last activity timestamp
   */
  getLastActivity() {
    return this.state.lastActivity;
  }

  /**
   * Get app version
   * @returns {string} - App version
   */
  getAppVersion() {
    return this.state.appVersion;
  }

  /**
   * Get build number
   * @returns {string} - Build number
   */
  getBuildNumber() {
    return this.state.buildNumber;
  }

  /**
   * Get error state
   * @returns {string|null} - Error message or null
   */
  getError() {
    return this.state.error;
  }

  /**
   * Check if there's an error
   * @returns {boolean} - True if there's an error
   */
  hasError() {
    return this.state.error !== null;
  }

  /**
   * Get idle time
   * @returns {number} - Idle time in milliseconds
   */
  getIdleTime() {
    return Date.now() - this.state.lastActivity;
  }

  /**
   * Check if user is idle
   * @param {number} threshold - Idle threshold in milliseconds
   * @returns {boolean} - True if user is idle
   */
  isIdle(threshold = 300000) { // 5 minutes default
    return this.getIdleTime() > threshold;
  }

  /**
   * Get application status
   * @returns {object} - Application status
   */
  getApplicationStatus() {
    return {
      isInitialized: this.state.isInitialized,
      isLoading: this.state.isLoading,
      hasError: this.hasError(),
      error: this.state.error,
      isOnline: this.state.isOnline,
      currentView: this.state.currentView,
      lastActivity: this.state.lastActivity,
      idleTime: this.getIdleTime(),
      isIdle: this.isIdle(),
      appVersion: this.state.appVersion,
      buildNumber: this.state.buildNumber
    };
  }

  /**
   * Get comprehensive state
   * @returns {object} - Complete application state
   */
  getComprehensiveState() {
    return {
      app: this.getState(),
      session: this.sessionState.getState(),
      preferences: this.preferencesState.getState(),
      status: this.getApplicationStatus()
    };
  }

  /**
   * Subscribe to specific state changes
   * @param {string} stateType - State type ('app', 'session', 'preferences')
   * @param {Function} callback - Callback function
   * @returns {Function} - Unsubscribe function
   */
  subscribeToState(stateType, callback) {
    switch (stateType) {
      case 'app':
        return this.subscribe(callback);
      case 'session':
        return this.sessionState.subscribe(callback);
      case 'preferences':
        return this.preferencesState.subscribe(callback);
      default:
        throw new AppError(
          `Invalid state type: ${stateType}`,
          ERROR_CODES.CONFIGURATION_INVALID,
          { stateType, validTypes: ['app', 'session', 'preferences'] }
        );
    }
  }

  /**
   * Reset application state
   */
  reset() {
    this.setState({
      isInitialized: false,
      isLoading: false,
      error: null,
      currentView: 'main',
      lastActivity: Date.now()
    });

    this.sessionState.resetSession();
    this.preferencesState.resetToDefaults();
  }

  /**
   * Export application state
   * @returns {object} - Application state for export
   */
  exportState() {
    return {
      app: this.getState(),
      session: this.sessionState.exportSessionData(),
      preferences: this.preferencesState.exportPreferences(),
      timestamp: Date.now(),
      version: this.state.appVersion
    };
  }

  /**
   * Import application state
   * @param {object} data - Application state data
   */
  importState(data) {
    if (data.app) {
      this.setState(data.app);
    }

    if (data.session) {
      this.sessionState.importSessionData(data.session);
    }

    if (data.preferences) {
      this.preferencesState.importPreferences(data.preferences);
    }
  }

  /**
   * Validate application state
   * @returns {boolean} - True if state is valid
   */
  validateState() {
    try {
      // Validate app state
      if (typeof this.state.isInitialized !== 'boolean') {
        throw new AppError(
          'isInitialized must be boolean',
          ERROR_CODES.STATE_UPDATE_FAILED,
          { value: this.state.isInitialized }
        );
      }

      // Validate sub-states
      const sessionValid = this.sessionState.validateState?.() ?? true;
      const preferencesValid = this.preferencesState.validatePreferences?.() ?? true;

      return sessionValid && preferencesValid;
    } catch (error) {
      Logger.error("state", 'Application state validation failed:', error);
      return false;
    }
  }

  /**
   * Get state manager capabilities
   * @returns {object} - Capabilities
   */
  getCapabilities() {
    return {
      ...super.getCapabilities(),
      sessionCapabilities: this.sessionState.getCapabilities?.() ?? {},
      preferencesCapabilities: this.preferencesState.getCapabilities?.() ?? {},
      subStateCount: 2,
      isOnline: this.state.isOnline,
      lastActivity: this.state.lastActivity
    };
  }

  /**
   * Dispose of application state manager
   */
  dispose() {
    super.dispose();
    this.sessionState.dispose?.();
    this.preferencesState.dispose?.();
  }
}
