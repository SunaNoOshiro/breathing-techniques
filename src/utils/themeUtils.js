/**
 * Theme utilities
 * Handles theme data structures and management following Single Responsibility Principle
 */

import Logger from './Logger.js';

/**
 * Default theme definitions
 */
export const DEFAULT_THEMES = {
  dark: {
    name: 'Dark',
    colors: {
      bg: '#0b1020',
      panel: '#0f172a',
      text: '#e5e7eb',
      stroke: '#9CA3AF',
      diaphragm: '#4B5563',
      green: '#34D399',
      blue: '#60A5FA',
      red: '#F87171',
      orange: '#F59E0B',
      accent: '#60A5FA',
      border: '#374151',
      shadow: 'rgba(0, 0, 0, 0.1)'
    }
  },
  ocean: {
    name: 'Ocean',
    colors: {
      bg: '#0c1445',
      panel: '#1a237e',
      text: '#e8eaf6',
      stroke: '#7986cb',
      diaphragm: '#5c6bc0',
      green: '#4fc3f7',
      blue: '#29b6f6',
      red: '#ef5350',
      orange: '#ff9800',
      accent: '#29b6f6',
      border: '#3949ab',
      shadow: 'rgba(0, 0, 0, 0.2)'
    }
  },
  forest: {
    name: 'Forest',
    colors: {
      bg: '#1b2e1b',
      panel: '#2d4a2d',
      text: '#e8f5e8',
      stroke: '#81c784',
      diaphragm: '#66bb6a',
      green: '#4caf50',
      blue: '#2196f3',
      red: '#f44336',
      orange: '#ff9800',
      accent: '#4caf50',
      border: '#388e3c',
      shadow: 'rgba(0, 0, 0, 0.15)'
    }
  },
  sunset: {
    name: 'Sunset',
    colors: {
      bg: '#2d1b1b',
      panel: '#4a2d2d',
      text: '#f5e8e8',
      stroke: '#e57373',
      diaphragm: '#ef5350',
      green: '#66bb6a',
      blue: '#42a5f5',
      red: '#f44336',
      orange: '#ff7043',
      accent: '#ff7043',
      border: '#d32f2f',
      shadow: 'rgba(0, 0, 0, 0.2)'
      }
  },
  purple: {
    name: 'Purple',
    colors: {
      bg: '#2d1b2d',
      panel: '#4a2d4a',
      text: '#f5e8f5',
      stroke: '#ba68c8',
      diaphragm: '#ab47bc',
      green: '#66bb6a',
      blue: '#42a5f5',
      red: '#f44336',
      orange: '#ff9800',
      accent: '#ab47bc',
      border: '#8e24aa',
      shadow: 'rgba(0, 0, 0, 0.2)'
    }
  },
  light: {
    name: 'Light',
    colors: {
      bg: '#f8fafc',
      panel: '#ffffff',
      text: '#1e293b',
      stroke: '#475569',
      diaphragm: '#64748b',
      green: '#059669',
      blue: '#2563eb',
      red: '#dc2626',
      orange: '#d97706',
      accent: '#2563eb',
      border: '#cbd5e1',
      shadow: 'rgba(0, 0, 0, 0.1)'
    }
  }
};

/**
 * Legacy colors export for backward compatibility
 */
export const COLORS = DEFAULT_THEMES.dark.colors;

/**
 * Theme utilities
 */
export const THEME_UTILS = {
  /**
   * Get theme colors by key
   * @param {string} themeKey - Theme key
   * @returns {object} - Theme colors
   */
  getThemeColors(themeKey = 'dark') {
    const theme = DEFAULT_THEMES[themeKey];
    if (!theme) {
      Logger.warn("util", `Theme '${themeKey}' not found, falling back to dark theme`);
      return DEFAULT_THEMES.dark.colors;
    }
    return theme.colors;
  },

  /**
   * Get theme names for UI
   * @returns {Array} - Array of theme name objects
   */
  getThemeNames() {
    return Object.keys(DEFAULT_THEMES).map(key => ({
      key,
      name: DEFAULT_THEMES[key].name
    }));
  },

  /**
   * Get all themes
   * @returns {object} - All themes object
   */
  getAllThemes() {
    return { ...DEFAULT_THEMES };
  },

  /**
   * Check if theme exists
   * @param {string} themeKey - Theme key
   * @returns {boolean} - True if theme exists
   */
  hasTheme(themeKey) {
    return themeKey in DEFAULT_THEMES;
  },

  /**
   * Get theme by key
   * @param {string} themeKey - Theme key
   * @returns {object|null} - Theme object or null
   */
  getTheme(themeKey) {
    return DEFAULT_THEMES[themeKey] || null;
  },

  /**
   * Create custom theme
   * @param {string} key - Theme key
   * @param {string} name - Theme name
   * @param {object} colors - Theme colors
   * @returns {object} - Custom theme object
   */
  createCustomTheme(key, name, colors) {
    return {
      name,
      colors: {
        bg: colors.bg || '#000000',
        panel: colors.panel || '#111111',
        text: colors.text || '#ffffff',
        stroke: colors.stroke || '#666666',
        diaphragm: colors.diaphragm || '#444444',
        green: colors.green || '#00ff00',
        blue: colors.blue || '#0000ff',
        red: colors.red || '#ff0000',
        orange: colors.orange || '#ff8800',
        accent: colors.accent || colors.blue || '#0000ff',
        border: colors.border || '#333333',
        shadow: colors.shadow || 'rgba(0, 0, 0, 0.1)'
      }
    };
  },

  /**
   * Validate theme colors
   * @param {object} colors - Theme colors
   * @returns {boolean} - True if valid
   */
  validateThemeColors(colors) {
    const requiredColors = [
      'bg', 'panel', 'text', 'stroke', 'diaphragm',
      'green', 'blue', 'red', 'orange', 'accent', 'border', 'shadow'
    ];

    return requiredColors.every(color => 
      colors[color] && typeof colors[color] === 'string'
    );
  },

  /**
   * Merge theme colors
   * @param {object} baseColors - Base theme colors
   * @param {object} overrideColors - Override colors
   * @returns {object} - Merged colors
   */
  mergeThemeColors(baseColors, overrideColors) {
    return {
      ...baseColors,
      ...overrideColors
    };
  },

  /**
   * Get theme contrast
   * @param {string} themeKey - Theme key
   * @returns {string} - Contrast level ('light' or 'dark')
   */
  getThemeContrast(themeKey) {
    const colors = this.getThemeColors(themeKey);
    const bgLuminance = this.getLuminance(colors.bg);
    return bgLuminance > 0.5 ? 'light' : 'dark';
  },

  /**
   * Get luminance of a color
   * @param {string} hex - Hex color string
   * @returns {number} - Luminance value (0-1)
   */
  getLuminance(hex) {
    const rgb = this.hexToRgb(hex);
    const { r, g, b } = rgb;
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  /**
   * Convert hex to RGB
   * @param {string} hex - Hex color string
   * @returns {object} - RGB object
   */
  hexToRgb(hex) {
    const h = hex.replace('#', '');
    const normalized = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    const r = parseInt(normalized.substring(0, 2), 16);
    const g = parseInt(normalized.substring(2, 4), 16);
    const b = parseInt(normalized.substring(4, 6), 16);
    return { r, g, b };
  },

  /**
   * Get accessible text color
   * @param {string} backgroundColor - Background color
   * @returns {string} - Accessible text color
   */
  getAccessibleTextColor(backgroundColor) {
    const luminance = this.getLuminance(backgroundColor);
    return luminance > 0.5 ? '#000000' : '#ffffff';
  },

  /**
   * Generate theme variants
   * @param {string} themeKey - Base theme key
   * @param {number} count - Number of variants
   * @returns {Array} - Array of theme variants
   */
  generateThemeVariants(themeKey, count = 5) {
    const baseTheme = this.getTheme(themeKey);
    if (!baseTheme) return [];

    const variants = [];
    const baseColors = baseTheme.colors;

    for (let i = 0; i < count; i++) {
      const variantKey = `${themeKey}-variant-${i + 1}`;
      const variantName = `${baseTheme.name} Variant ${i + 1}`;
      
      // Create slight variations of the base colors
      const variantColors = {
        ...baseColors,
        accent: this.adjustColorBrightness(baseColors.accent, (i - 2) * 20),
        bg: this.adjustColorBrightness(baseColors.bg, (i - 2) * 10),
        panel: this.adjustColorBrightness(baseColors.panel, (i - 2) * 15)
      };

      variants.push({
        key: variantKey,
        name: variantName,
        colors: variantColors
      });
    }

    return variants;
  },

  /**
   * Adjust color brightness
   * @param {string} hex - Hex color string
   * @param {number} amount - Brightness adjustment (-255 to 255)
   * @returns {string} - Adjusted hex color
   */
  adjustColorBrightness(hex, amount) {
    const rgb = this.hexToRgb(hex);
    const r = Math.max(0, Math.min(255, rgb.r + amount));
    const g = Math.max(0, Math.min(255, rgb.g + amount));
    const b = Math.max(0, Math.min(255, rgb.b + amount));
    
    return this.rgbToHex(r, g, b);
  },

  /**
   * Convert RGB to hex
   * @param {number} r - Red value
   * @param {number} g - Green value
   * @param {number} b - Blue value
   * @returns {string} - Hex color string
   */
  rgbToHex(r, g, b) {
    const toHex = (n) => {
      const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
};

/**
 * Theme storage utilities
 */
export const THEME_STORAGE_UTILS = {
  /**
   * Save theme to storage
   * @param {string} themeKey - Theme key
   * @param {object} storage - Storage adapter
   * @returns {Promise<void>}
   */
  async saveThemeToStorage(themeKey, storage) {
    try {
      await storage.safeSet('breathing-app-theme', themeKey);
    } catch (error) {
      Logger.warn("util", 'Failed to save theme to localStorage:', error);
    }
  },

  /**
   * Load theme from storage
   * @param {object} storage - Storage adapter
   * @returns {Promise<string>} - Theme key
   */
  async loadThemeFromStorage(storage) {
    try {
      const savedTheme = await storage.safeGet('breathing-app-theme');
      return savedTheme && THEME_UTILS.hasTheme(savedTheme) ? savedTheme : 'dark';
    } catch (error) {
      Logger.warn("util", 'Failed to load theme from localStorage:', error);
      return 'dark';
    }
  },

  /**
   * Save custom themes to storage
   * @param {object} customThemes - Custom themes object
   * @param {object} storage - Storage adapter
   * @returns {Promise<void>}
   */
  async saveCustomThemesToStorage(customThemes, storage) {
    try {
      await storage.safeSet('custom-themes', customThemes);
    } catch (error) {
      Logger.warn("util", 'Failed to save custom themes to localStorage:', error);
    }
  },

  /**
   * Load custom themes from storage
   * @param {object} storage - Storage adapter
   * @returns {Promise<object>} - Custom themes object
   */
  async loadCustomThemesFromStorage(storage) {
    try {
      const customThemes = await storage.safeGet('custom-themes');
      return customThemes || {};
    } catch (error) {
      Logger.warn("util", 'Failed to load custom themes from localStorage:', error);
      return {};
    }
  }
};

/**
 * Dynamic layout styles generator
 */
export const LAYOUT_STYLES_GENERATOR = {
  /**
   * Generate layout styles for theme
   * @param {string} themeKey - Theme key
   * @returns {object} - Layout styles
   */
  generateLayoutStyles(themeKey = 'dark') {
    const colors = THEME_UTILS.getThemeColors(themeKey);
    return {
      root: {
        background: colors.bg,
        color: colors.text,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        boxSizing: 'border-box',
      },
      header: {
        textAlign: 'center',
        marginBottom: '24px',
        '@media (max-width: 768px)': {
          marginBottom: '16px'
        }
      },
      mainContent: {
        display: 'flex',
        gap: '24px',
        flex: 1,
        alignItems: 'flex-start',
        '@media (max-width: 768px)': {
          flexDirection: 'column',
          gap: '16px'
        }
      },
      sidebar: {
        width: '320px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        '@media (max-width: 768px)': {
          width: '100%',
          order: 2
        }
      },
      visualizationArea: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        '@media (max-width: 768px)': {
          order: 1,
          width: '100%'
        }
      },
      controlsPanel: {
        padding: '20px',
        background: colors.panel,
        borderRadius: 12,
        border: `1px solid ${colors.border}`,
        boxShadow: `0 4px 6px -1px ${colors.shadow}`
      },
      controls: { 
        display: 'flex', 
        gap: 12, 
        alignItems: 'center', 
        marginBottom: 24, 
        fontSize: 14 
      },
      squareWrap: { 
        position: 'relative', 
        width: 420, 
        height: 420, 
        marginBottom: 8
      },
      dotBase: { 
        position: 'absolute', 
        width: 40, 
        height: 40, 
        marginLeft: -20, 
        marginTop: -20, 
        borderRadius: 9999, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontWeight: 800 
      },
      panel: {
        padding: '20px',
        background: colors.panel,
        borderRadius: 12,
        border: `1px solid ${colors.border}`,
        boxShadow: `0 4px 6px -1px ${colors.shadow}`
      },
      button: {
        padding: '10px 20px',
        color: 'white',
        border: 'none',
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: `0 2px 4px ${colors.shadow}`
      }
    };
  }
};

/**
 * Legacy layout styles (for backward compatibility)
 */
export const LAYOUT_STYLES = LAYOUT_STYLES_GENERATOR.generateLayoutStyles('dark');

/**
 * Export all theme utilities
 */
export const THEME_SYSTEM = {
  DEFAULT_THEMES,
  COLORS,
  THEME_UTILS,
  THEME_STORAGE_UTILS,
  LAYOUT_STYLES_GENERATOR,
  LAYOUT_STYLES
};
