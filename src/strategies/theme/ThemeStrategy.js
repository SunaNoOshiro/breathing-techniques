/**
 * Theme Strategy Pattern
 * Defines interface for different theme strategies following Strategy Pattern
 */

import { AppError, ERROR_CODES } from '../../errors/AppError.js';
import Logger from '../../utils/Logger.js';

/**
 * Base Theme Strategy interface
 */
export class ThemeStrategy {
  /**
   * Apply theme to application
   * @param {string} themeKey - Theme key
   * @param {object} context - Application context
   */
  applyTheme(themeKey, context) {
    throw new Error('applyTheme method must be implemented by strategy');
  }

  /**
   * Get theme colors
   * @param {string} themeKey - Theme key
   * @returns {object} - Theme colors
   */
  getThemeColors(themeKey) {
    throw new Error('getThemeColors method must be implemented by strategy');
  }

  /**
   * Get strategy name
   * @returns {string} - Strategy name
   */
  getName() {
    throw new Error('getName method must be implemented by strategy');
  }

  /**
   * Check if strategy supports theme
   * @param {string} themeKey - Theme key
   * @returns {boolean} - True if supported
   */
  supportsTheme(themeKey) {
    throw new Error('supportsTheme method must be implemented by strategy');
  }

  /**
   * Get strategy configuration
   * @returns {object} - Strategy configuration
   */
  getConfiguration() {
    return {};
  }
}

/**
 * CSS Theme Strategy
 * Applies themes using CSS custom properties
 */
export class CSSThemeStrategy extends ThemeStrategy {
  constructor() {
    super();
    this.name = 'css';
    this.supportedThemes = ['dark', 'light', 'ocean', 'forest', 'sunset', 'purple'];
    this.cssVariables = {
      '--theme-bg': 'bg',
      '--theme-panel': 'panel',
      '--theme-text': 'text',
      '--theme-stroke': 'stroke',
      '--theme-diaphragm': 'diaphragm',
      '--theme-green': 'green',
      '--theme-blue': 'blue',
      '--theme-red': 'red',
      '--theme-orange': 'orange',
      '--theme-accent': 'accent',
      '--theme-border': 'border',
      '--theme-shadow': 'shadow'
    };
  }

  /**
   * Apply theme using CSS custom properties
   * @param {string} themeKey - Theme key
   * @param {object} context - Application context
   */
  applyTheme(themeKey, context) {
    Logger.debug("strategy", 'CSSThemeStrategy.applyTheme called with:', themeKey);
    const colors = this.getThemeColors(themeKey);
    Logger.debug("strategy", 'Theme colors:', colors);
    const root = document.documentElement;

    // Set CSS custom properties
    Object.entries(this.cssVariables).forEach(([cssVar, colorKey]) => {
      root.style.setProperty(cssVar, colors[colorKey]);
      Logger.debug("strategy", `Set CSS variable ${cssVar} = ${colors[colorKey]}`);
    });

    // Add theme class to body
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${themeKey}`);
    Logger.debug("strategy", 'Added theme class:', `theme-${themeKey}`);

    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor(colors.accent);
    Logger.debug("strategy", 'Theme applied successfully');
  }

  /**
   * Get theme colors
   * @param {string} themeKey - Theme key
   * @returns {object} - Theme colors
   */
  getThemeColors(themeKey) {
    const themes = {
      dark: {
        bg: '#0c111c',
        panel: '#111a2b',
        text: '#e2e8f0',
        stroke: '#8da2c0',
        diaphragm: '#516079',
        green: '#34d399',
        blue: '#38bdf8',
        red: '#f43f5e',
        orange: '#fb923c',
        accent: '#38bdf8',
        border: '#1f2a3d',
        shadow: 'rgba(0, 0, 0, 0.35)'
      },
      light: {
        bg: '#f6f8fb',
        panel: '#ffffff',
        text: '#0f172a',
        stroke: '#94a3b8',
        diaphragm: '#6b7280',
        green: '#16a34a',
        blue: '#2563eb',
        red: '#dc2626',
        orange: '#ea580c',
        accent: '#3b82f6',
        border: '#e2e8f0',
        shadow: 'rgba(15, 23, 42, 0.08)'
      },
      ocean: {
        bg: '#071a2e',
        panel: '#0c2744',
        text: '#dff5ff',
        stroke: '#7db2e8',
        diaphragm: '#5c7caa',
        green: '#2dd4bf',
        blue: '#38bdf8',
        red: '#ef4444',
        orange: '#f97316',
        accent: '#38bdf8',
        border: '#143f68',
        shadow: 'rgba(4, 22, 48, 0.35)'
      },
      forest: {
        bg: '#0f1d13',
        panel: '#183122',
        text: '#e3f5e8',
        stroke: '#81c995',
        diaphragm: '#5b9271',
        green: '#34d399',
        blue: '#3b82f6',
        red: '#f97316',
        orange: '#f59e0b',
        accent: '#34d399',
        border: '#1f4631',
        shadow: 'rgba(6, 24, 14, 0.35)'
      },
      sunset: {
        bg: '#1f1117',
        panel: '#2b1a22',
        text: '#fde6df',
        stroke: '#f2a3a3',
        diaphragm: '#e76f51',
        green: '#86efac',
        blue: '#60a5fa',
        red: '#f43f5e',
        orange: '#fb923c',
        accent: '#fb923c',
        border: '#3b1f2a',
        shadow: 'rgba(30, 10, 6, 0.35)'
      },
      purple: {
        bg: '#160f1f',
        panel: '#24142f',
        text: '#f5e8ff',
        stroke: '#c4a7e7',
        diaphragm: '#a78bfa',
        green: '#4ade80',
        blue: '#60a5fa',
        red: '#fb7185',
        orange: '#f59e0b',
        accent: '#c084fc',
        border: '#2f1f44',
        shadow: 'rgba(18, 7, 30, 0.35)'
      }
    };

    return themes[themeKey] || themes.dark;
  }

  /**
   * Update meta theme-color
   * @param {string} color - Theme color
   */
  updateMetaThemeColor(color) {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.content = color;
  }

  /**
   * Get strategy name
   * @returns {string} - Strategy name
   */
  getName() {
    return this.name;
  }

  /**
   * Check if strategy supports theme
   * @param {string} themeKey - Theme key
   * @returns {boolean} - True if supported
   */
  supportsTheme(themeKey) {
    return this.supportedThemes.includes(themeKey);
  }

  /**
   * Get strategy configuration
   * @returns {object} - Strategy configuration
   */
  getConfiguration() {
    return {
      name: this.name,
      supportedThemes: this.supportedThemes,
      method: 'css-custom-properties',
      description: 'CSS custom properties theme strategy'
    };
  }
}

/**
 * Inline Theme Strategy
 * Applies themes using inline styles
 */
export class InlineThemeStrategy extends ThemeStrategy {
  constructor() {
    super();
    this.name = 'inline';
    this.supportedThemes = ['dark', 'light', 'ocean', 'forest', 'sunset', 'purple'];
  }

  /**
   * Apply theme using inline styles
   * @param {string} themeKey - Theme key
   * @param {object} context - Application context
   */
  applyTheme(themeKey, context) {
    const colors = this.getThemeColors(themeKey);
    
    // Apply styles to root element
    if (context.rootElement) {
      Object.assign(context.rootElement.style, {
        backgroundColor: colors.bg,
        color: colors.text,
        '--theme-bg': colors.bg,
        '--theme-panel': colors.panel,
        '--theme-text': colors.text,
        '--theme-stroke': colors.stroke,
        '--theme-diaphragm': colors.diaphragm,
        '--theme-green': colors.green,
        '--theme-blue': colors.blue,
        '--theme-red': colors.red,
        '--theme-orange': colors.orange,
        '--theme-accent': colors.accent,
        '--theme-border': colors.border,
        '--theme-shadow': colors.shadow
      });
    }
  }

  /**
   * Get theme colors
   * @param {string} themeKey - Theme key
   * @returns {object} - Theme colors
   */
  getThemeColors(themeKey) {
    // Reuse CSS strategy colors
    const cssStrategy = new CSSThemeStrategy();
    return cssStrategy.getThemeColors(themeKey);
  }

  /**
   * Get strategy name
   * @returns {string} - Strategy name
   */
  getName() {
    return this.name;
  }

  /**
   * Check if strategy supports theme
   * @param {string} themeKey - Theme key
   * @returns {boolean} - True if supported
   */
  supportsTheme(themeKey) {
    return this.supportedThemes.includes(themeKey);
  }

  /**
   * Get strategy configuration
   * @returns {object} - Strategy configuration
   */
  getConfiguration() {
    return {
      name: this.name,
      supportedThemes: this.supportedThemes,
      method: 'inline-styles',
      description: 'Inline styles theme strategy'
    };
  }
}

/**
 * Dynamic Theme Strategy
 * Generates themes dynamically based on user preferences
 */
export class DynamicThemeStrategy extends ThemeStrategy {
  constructor() {
    super();
    this.name = 'dynamic';
    this.baseThemes = ['dark', 'light'];
  }

  /**
   * Apply dynamic theme
   * @param {string} themeKey - Theme key
   * @param {object} context - Application context
   */
  applyTheme(themeKey, context) {
    const colors = this.generateDynamicColors(themeKey, context.preferences);
    
    // Apply using CSS custom properties
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value);
    });

    // Add theme class
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${themeKey}`);
  }

  /**
   * Generate dynamic colors based on preferences
   * @param {string} themeKey - Theme key
   * @param {object} preferences - User preferences
   * @returns {object} - Generated colors
   */
  generateDynamicColors(themeKey, preferences = {}) {
    const baseColors = this.getBaseColors(themeKey);
    const generatedColors = { ...baseColors };

    // Apply accessibility preferences
    if (preferences.highContrast) {
      generatedColors.border = this.increaseContrast(generatedColors.border, generatedColors.bg);
      generatedColors.stroke = this.increaseContrast(generatedColors.stroke, generatedColors.bg);
    }

    if (preferences.colorBlindMode) {
      generatedColors.green = this.adjustForColorBlindness(generatedColors.green, 'green');
      generatedColors.red = this.adjustForColorBlindness(generatedColors.red, 'red');
      generatedColors.blue = this.adjustForColorBlindness(generatedColors.blue, 'blue');
    }

    // Apply font size scaling
    if (preferences.fontSize === 'large') {
      // Could adjust spacing-related colors here
    }

    return generatedColors;
  }

  /**
   * Get base colors for theme
   * @param {string} themeKey - Theme key
   * @returns {object} - Base colors
   */
  getBaseColors(themeKey) {
    const cssStrategy = new CSSThemeStrategy();
    return cssStrategy.getThemeColors(themeKey);
  }

  /**
   * Increase contrast for accessibility
   * @param {string} color - Color to adjust
   * @param {string} background - Background color
   * @returns {string} - Adjusted color
   */
  increaseContrast(color, background) {
    // Simple contrast adjustment - in real implementation would use proper color theory
    return color; // Placeholder
  }

  /**
   * Adjust color for color blindness
   * @param {string} color - Color to adjust
   * @param {string} type - Color type
   * @returns {string} - Adjusted color
   */
  adjustForColorBlindness(color, type) {
    // Simple color blindness adjustment - in real implementation would use proper algorithms
    return color; // Placeholder
  }

  /**
   * Get theme colors
   * @param {string} themeKey - Theme key
   * @returns {object} - Theme colors
   */
  getThemeColors(themeKey) {
    return this.generateDynamicColors(themeKey);
  }

  /**
   * Get strategy name
   * @returns {string} - Strategy name
   */
  getName() {
    return this.name;
  }

  /**
   * Check if strategy supports theme
   * @param {string} themeKey - Theme key
   * @returns {boolean} - True if supported
   */
  supportsTheme(themeKey) {
    return this.baseThemes.includes(themeKey);
  }

  /**
   * Get strategy configuration
   * @returns {object} - Strategy configuration
   */
  getConfiguration() {
    return {
      name: this.name,
      supportedThemes: this.baseThemes,
      method: 'dynamic-generation',
      description: 'Dynamic theme generation based on user preferences'
    };
  }
}

/**
 * Theme Strategy Manager
 * Manages theme strategies and selects appropriate one
 */
export class ThemeStrategyManager {
  constructor() {
    this.strategies = new Map();
    this.currentStrategy = null;
    this.registerDefaultStrategies();
  }

  /**
   * Register default strategies
   */
  registerDefaultStrategies() {
    this.registerStrategy(new CSSThemeStrategy());
    this.registerStrategy(new InlineThemeStrategy());
    this.registerStrategy(new DynamicThemeStrategy());
    
    // Set default strategy
    this.currentStrategy = this.strategies.get('css');
  }

  /**
   * Register a theme strategy
   * @param {ThemeStrategy} strategy - Strategy to register
   */
  registerStrategy(strategy) {
    if (!(strategy instanceof ThemeStrategy)) {
      throw new AppError(
        'Strategy must extend ThemeStrategy',
        ERROR_CODES.CONFIGURATION_INVALID,
        { strategy }
      );
    }

    this.strategies.set(strategy.getName(), strategy);
  }

  /**
   * Set current strategy
   * @param {string} strategyName - Strategy name
   */
  setCurrentStrategy(strategyName) {
    const strategy = this.strategies.get(strategyName);
    if (!strategy) {
      throw new AppError(
        `Theme strategy '${strategyName}' not found`,
        ERROR_CODES.CONFIGURATION_INVALID,
        { strategyName, availableStrategies: Array.from(this.strategies.keys()) }
      );
    }

    this.currentStrategy = strategy;
  }

  /**
   * Get current strategy
   * @returns {ThemeStrategy} - Current strategy
   */
  getCurrentStrategy() {
    return this.currentStrategy;
  }

  /**
   * Apply theme using current strategy
   * @param {string} themeKey - Theme key
   * @param {object} context - Application context
   */
  applyTheme(themeKey, context) {
    if (!this.currentStrategy) {
      throw new AppError(
        'No theme strategy selected',
        ERROR_CODES.CONFIGURATION_INVALID
      );
    }

    if (!this.currentStrategy.supportsTheme(themeKey)) {
      throw new AppError(
        `Theme '${themeKey}' not supported by current strategy`,
        ERROR_CODES.CONFIGURATION_INVALID,
        { themeKey, strategy: this.currentStrategy.getName() }
      );
    }

    this.currentStrategy.applyTheme(themeKey, context);
  }

  /**
   * Get theme colors using current strategy
   * @param {string} themeKey - Theme key
   * @returns {object} - Theme colors
   */
  getThemeColors(themeKey) {
    if (!this.currentStrategy) {
      throw new AppError(
        'No theme strategy selected',
        ERROR_CODES.CONFIGURATION_INVALID
      );
    }

    return this.currentStrategy.getThemeColors(themeKey);
  }

  /**
   * Get strategy for theme
   * @param {string} themeKey - Theme key
   * @returns {ThemeStrategy|null} - Appropriate strategy or null
   */
  getStrategyForTheme(themeKey) {
    for (const strategy of this.strategies.values()) {
      if (strategy.supportsTheme(themeKey)) {
        return strategy;
      }
    }
    return null;
  }

  /**
   * Get all registered strategies
   * @returns {Array} - Array of strategies
   */
  getAllStrategies() {
    return Array.from(this.strategies.values());
  }

  /**
   * Get strategy by name
   * @param {string} name - Strategy name
   * @returns {ThemeStrategy|null} - Strategy or null
   */
  getStrategy(name) {
    return this.strategies.get(name) || null;
  }

  /**
   * Get strategy capabilities
   * @returns {object} - Strategy capabilities
   */
  getCapabilities() {
    return {
      strategyCount: this.strategies.size,
      currentStrategy: this.currentStrategy?.getName() || null,
      strategies: Array.from(this.strategies.keys()),
      configurations: Array.from(this.strategies.values()).map(s => s.getConfiguration())
    };
  }
}

// Create and export singleton instance
export const themeStrategyManager = new ThemeStrategyManager();
