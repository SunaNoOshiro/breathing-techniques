/**
 * Observer Pattern Implementation
 * Provides observable/observer functionality for state management
 */

import Logger from '../utils/Logger.js';

/**
 * Observer interface
 */
export class Observer {
  /**
   * Update method called when observable changes
   * @param {any} data - Update data
   */
  update(data) {
    throw new Error('update method must be implemented by observer');
  }
}

/**
 * Observable class
 * Manages observers and notifies them of changes
 */
export class Observable {
  constructor() {
    this.observers = new Set();
    this.isNotifying = false;
    this.pendingNotifications = [];
  }

  /**
   * Add observer
   * @param {Observer} observer - Observer to add
   */
  addObserver(observer) {
    if (!(observer instanceof Observer)) {
      throw new Error('Observer must implement Observer interface');
    }
    this.observers.add(observer);
  }

  /**
   * Remove observer
   * @param {Observer} observer - Observer to remove
   */
  removeObserver(observer) {
    this.observers.delete(observer);
  }

  /**
   * Notify all observers
   * @param {any} data - Data to send to observers
   */
  notifyObservers(data) {
    if (this.isNotifying) {
      // Prevent recursive notifications
      this.pendingNotifications.push(data);
      return;
    }

    this.isNotifying = true;

    try {
      this.observers.forEach(observer => {
        try {
          observer.update(data);
        } catch (error) {
          Logger.error('state', 'Error in observer update:', error);
        }
      });
    } finally {
      this.isNotifying = false;
      
      // Process pending notifications
      if (this.pendingNotifications.length > 0) {
        const nextData = this.pendingNotifications.shift();
        this.notifyObservers(nextData);
      }
    }
  }

  /**
   * Get observer count
   * @returns {number} - Number of observers
   */
  getObserverCount() {
    return this.observers.size;
  }

  /**
   * Clear all observers
   */
  clearObservers() {
    this.observers.clear();
  }

  /**
   * Check if has observers
   * @returns {boolean} - True if has observers
   */
  hasObservers() {
    return this.observers.size > 0;
  }
}

/**
 * State Observer
 * Concrete observer for state changes
 */
export class StateObserver extends Observer {
  constructor(callback) {
    super();
    this.callback = callback;
  }

  /**
   * Update method
   * @param {any} data - State data
   */
  update(data) {
    if (typeof this.callback === 'function') {
      this.callback(data);
    }
  }
}

/**
 * State Manager
 * Manages application state with observer pattern
 */
export class StateManager extends Observable {
  constructor(initialState = {}) {
    super();
    this.state = { ...initialState };
    this.history = [];
    this.maxHistorySize = 50;
    this.isUpdating = false;
  }

  /**
   * Get current state
   * @returns {object} - Current state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Get specific state value
   * @param {string} key - State key
   * @returns {any} - State value
   */
  getStateValue(key) {
    return this.state[key];
  }

  /**
   * Set state
   * @param {object|Function} newState - New state or state updater function
   */
  setState(newState) {
    if (this.isUpdating) {
      Logger.warn('state', 'State update already in progress, skipping');
      return;
    }

    this.isUpdating = true;

    try {
      const previousState = { ...this.state };
      
      if (typeof newState === 'function') {
        this.state = { ...this.state, ...newState(this.state) };
      } else {
        this.state = { ...this.state, ...newState };
      }

      // Add to history
      this.addToHistory(previousState, this.state);

      const changes = this.getChanges(previousState, this.state);
      Logger.debug('state', 'StateManager.setState: Notifying', this.observers.size, 'observers with changes:', changes);

      // Notify observers
      this.notifyObservers({
        previousState,
        currentState: this.state,
        changes
      });
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * Update specific state key
   * @param {string} key - State key
   * @param {any} value - New value
   */
  updateStateKey(key, value) {
    this.setState({ [key]: value });
  }

  /**
   * Reset state to initial state
   */
  resetState() {
    this.setState(this.getInitialState());
  }

  /**
   * Get initial state
   * @returns {object} - Initial state
   */
  getInitialState() {
    return this.history.length > 0 ? this.history[0].state : {};
  }

  /**
   * Add state to history
   * @param {object} previousState - Previous state
   * @param {object} currentState - Current state
   */
  addToHistory(previousState, currentState) {
    this.history.push({
      timestamp: Date.now(),
      previousState,
      state: { ...currentState }
    });

    // Keep history size manageable
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize);
    }
  }

  /**
   * Get state changes
   * @param {object} previousState - Previous state
   * @param {object} currentState - Current state
   * @returns {object} - Changes object
   */
  getChanges(previousState, currentState) {
    const changes = {};
    
    Object.keys(currentState).forEach(key => {
      if (previousState[key] !== currentState[key]) {
        changes[key] = {
          from: previousState[key],
          to: currentState[key]
        };
      }
    });

    return changes;
  }

  /**
   * Get state history
   * @param {number} limit - Limit number of history entries
   * @returns {Array} - State history
   */
  getHistory(limit = 10) {
    return this.history.slice(-limit);
  }

  /**
   * Undo last state change
   * @returns {boolean} - True if undo was successful
   */
  undo() {
    if (this.history.length < 2) {
      return false;
    }

    const previousEntry = this.history[this.history.length - 2];
    this.state = { ...previousEntry.state };
    
    // Remove last entry from history
    this.history.pop();

    // Notify observers
    this.notifyObservers({
      type: 'undo',
      currentState: this.state
    });

    return true;
  }

  /**
   * Subscribe to state changes
   * @param {Function} callback - Callback function
   * @returns {Function} - Unsubscribe function
   */
  subscribe(callback) {
    const observer = new StateObserver(callback);
    this.addObserver(observer);
    
    // Return unsubscribe function
    return () => this.removeObserver(observer);
  }

  /**
   * Subscribe to specific state key changes
   * @param {string} key - State key
   * @param {Function} callback - Callback function
   * @returns {Function} - Unsubscribe function
   */
  subscribeToKey(key, callback) {
    const observer = new StateObserver((data) => {
      if (data.changes && data.changes[key]) {
        callback(data.changes[key], data.currentState);
      }
    });
    
    this.addObserver(observer);
    
    // Return unsubscribe function
    return () => this.removeObserver(observer);
  }

  /**
   * Get state manager capabilities
   * @returns {object} - Capabilities
   */
  getCapabilities() {
    return {
      stateKeys: Object.keys(this.state),
      observerCount: this.getObserverCount(),
      historySize: this.history.length,
      maxHistorySize: this.maxHistorySize,
      isUpdating: this.isUpdating
    };
  }

  /**
   * Dispose of state manager
   */
  dispose() {
    this.clearObservers();
    this.history = [];
    this.state = {};
  }
}
