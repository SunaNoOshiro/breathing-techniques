/**
 * Centralized logging utility for debugging and monitoring
 * 
 * Usage:
 *   import Logger from '@/utils/Logger';
 *   Logger.debug('Debug message', data);
 *   Logger.info('Info message', data);
 *   Logger.warn('Warning message', data);
 *   Logger.error('Error message', error);
 * 
 * Configuration:
 *   - Set LOG_LEVEL in .env file or localStorage
 *   - Levels: 'none', 'error', 'warn', 'info', 'debug'
 *   - In browser console: localStorage.setItem('LOG_LEVEL', 'debug')
 */

const LOG_LEVELS = {
  NONE: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4
};

class Logger {
  constructor() {
    this.level = this.initializeLogLevel();
    this.enabledCategories = this.initializeCategories();
    this.prefix = '[Breathing App]';
  }

  /**
   * Initialize log level from environment or localStorage
   */
  initializeLogLevel() {
    // Check localStorage first (for runtime control)
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedLevel = localStorage.getItem('LOG_LEVEL');
      if (storedLevel && LOG_LEVELS[storedLevel.toUpperCase()] !== undefined) {
        return LOG_LEVELS[storedLevel.toUpperCase()];
      }
    }

    // Check environment variable (Vite uses VITE_ prefix)
    const envLevel = import.meta.env.VITE_LOG_LEVEL;
    if (envLevel && LOG_LEVELS[envLevel.toUpperCase()] !== undefined) {
      return LOG_LEVELS[envLevel.toUpperCase()];
    }

    // Default: ERROR in production, DEBUG in development
    return import.meta.env.MODE === 'production' ? LOG_LEVELS.ERROR : LOG_LEVELS.DEBUG;
  }

  /**
   * Initialize enabled categories from localStorage
   * Categories allow filtering logs by module (e.g., 'context', 'service', 'state')
   */
  initializeCategories() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem('LOG_CATEGORIES');
      if (stored) {
        try {
          return new Set(JSON.parse(stored));
        } catch (e) {
          // Invalid JSON, ignore
        }
      }
    }
    return new Set(); // Empty set means all categories enabled
  }

  /**
   * Check if a category is enabled
   */
  isCategoryEnabled(category) {
    // If no categories specified, all are enabled
    if (this.enabledCategories.size === 0) return true;
    return this.enabledCategories.has(category);
  }

  /**
   * Format log message with prefix and category
   */
  formatMessage(category, ...args) {
    const categoryTag = category ? `[${category}]` : '';
    return [this.prefix, categoryTag, ...args];
  }

  /**
   * Debug level logging
   */
  debug(category, ...args) {
    // Support both Logger.debug('message') and Logger.debug('category', 'message')
    const actualCategory = args.length > 0 ? category : null;
    const actualArgs = args.length > 0 ? args : [category];

    if (this.level >= LOG_LEVELS.DEBUG && this.isCategoryEnabled(actualCategory)) {
      console.log(...this.formatMessage(actualCategory, ...actualArgs));
    }
  }

  /**
   * Info level logging
   */
  info(category, ...args) {
    const actualCategory = args.length > 0 ? category : null;
    const actualArgs = args.length > 0 ? args : [category];

    if (this.level >= LOG_LEVELS.INFO && this.isCategoryEnabled(actualCategory)) {
      console.log(...this.formatMessage(actualCategory, ...actualArgs));
    }
  }

  /**
   * Warning level logging
   */
  warn(category, ...args) {
    const actualCategory = args.length > 0 ? category : null;
    const actualArgs = args.length > 0 ? args : [category];

    if (this.level >= LOG_LEVELS.WARN && this.isCategoryEnabled(actualCategory)) {
      console.warn(...this.formatMessage(actualCategory, ...actualArgs));
    }
  }

  /**
   * Error level logging
   */
  error(category, ...args) {
    const actualCategory = args.length > 0 ? category : null;
    const actualArgs = args.length > 0 ? args : [category];

    if (this.level >= LOG_LEVELS.ERROR && this.isCategoryEnabled(actualCategory)) {
      console.error(...this.formatMessage(actualCategory, ...actualArgs));
    }
  }

  /**
   * Set log level at runtime
   */
  setLevel(level) {
    const levelUpper = level.toUpperCase();
    if (LOG_LEVELS[levelUpper] !== undefined) {
      this.level = LOG_LEVELS[levelUpper];
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('LOG_LEVEL', levelUpper);
      }
      console.log(`${this.prefix} Log level set to: ${levelUpper}`);
    } else {
      console.warn(`${this.prefix} Invalid log level: ${level}`);
    }
  }

  /**
   * Enable specific categories
   */
  enableCategories(...categories) {
    categories.forEach(cat => this.enabledCategories.add(cat));
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('LOG_CATEGORIES', JSON.stringify([...this.enabledCategories]));
    }
    console.log(`${this.prefix} Enabled categories:`, [...this.enabledCategories]);
  }

  /**
   * Disable specific categories
   */
  disableCategories(...categories) {
    categories.forEach(cat => this.enabledCategories.delete(cat));
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('LOG_CATEGORIES', JSON.stringify([...this.enabledCategories]));
    }
    console.log(`${this.prefix} Disabled categories:`, categories);
  }

  /**
   * Clear category filters (enable all)
   */
  clearCategories() {
    this.enabledCategories.clear();
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('LOG_CATEGORIES');
    }
    console.log(`${this.prefix} All categories enabled`);
  }

  /**
   * Get current configuration
   */
  getConfig() {
    const levelName = Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === this.level);
    return {
      level: levelName,
      categories: [...this.enabledCategories],
      mode: import.meta.env.MODE
    };
  }

  /**
   * Display help in console
   */
  help() {
    console.log(`
${this.prefix} Logger Help
=============================

USAGE:
  import Logger from '@/utils/Logger';
  Logger.debug('category', 'message', data);
  Logger.info('message');
  Logger.warn('category', 'warning');
  Logger.error('category', 'error', errorObject);

LOG LEVELS (from least to most verbose):
  - NONE:  No logging
  - ERROR: Only errors
  - WARN:  Errors and warnings
  - INFO:  Errors, warnings, and info
  - DEBUG: Everything

RUNTIME CONFIGURATION:
  Logger.setLevel('debug')              - Set log level
  Logger.enableCategories('state', 'service') - Only show these categories
  Logger.disableCategories('context')   - Hide specific categories
  Logger.clearCategories()              - Show all categories
  Logger.getConfig()                    - View current configuration

BROWSER CONSOLE SHORTCUTS:
  localStorage.setItem('LOG_LEVEL', 'debug')
  localStorage.setItem('LOG_CATEGORIES', '["state","service"]')

CATEGORIES IN USE:
  - context: React contexts
  - service: Service classes (Audio, Timer, etc.)
  - state: State management
  - component: React components
  - hook: React hooks
  - command: Command pattern
  - performance: Performance monitoring
    `);
  }
}

// Export singleton instance
const logger = new Logger();

// Make it accessible in browser console for debugging
if (typeof window !== 'undefined') {
  window.Logger = logger;
}

export default logger;
export { LOG_LEVELS };



