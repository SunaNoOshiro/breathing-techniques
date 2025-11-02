/**
 * Theme Builder
 * Implements Builder pattern for creating complex theme objects
 * Allows fluent API for theme construction with custom colors and styles
 */

export class ThemeBuilder {
  constructor() {
    this.reset();
  }

  /**
   * Reset the builder to initial state
   * @returns {ThemeBuilder} - This builder instance
   */
  reset() {
    this.theme = {
      id: '',
      name: '',
      colors: {
        primary: '#4A90E2',
        secondary: '#7ED321',
        accent: '#F5A623',
        background: '#F8F9FA',
        surface: '#FFFFFF',
        text: '#333333',
        textSecondary: '#666666',
        border: '#E1E5E9',
        error: '#E74C3C',
        success: '#27AE60',
        warning: '#F39C12',
        info: '#3498DB'
      },
      typography: {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem'
        },
        fontWeight: {
          light: 300,
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700
        },
        lineHeight: {
          tight: 1.25,
          normal: 1.5,
          relaxed: 1.75
        }
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem'
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px'
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      },
      animations: {
        duration: {
          fast: '150ms',
          normal: '300ms',
          slow: '500ms'
        },
        easing: {
          linear: 'linear',
          easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
          easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
          easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }
      }
    };
    return this;
  }

  /**
   * Set basic theme information
   * @param {string} id - Theme ID
   * @param {string} name - Theme name
   * @returns {ThemeBuilder} - This builder instance
   */
  withBasicInfo(id, name) {
    this.theme.id = id;
    this.theme.name = name;
    return this;
  }

  /**
   * Set primary color scheme
   * @param {string} primary - Primary color
   * @param {string} secondary - Secondary color
   * @param {string} accent - Accent color
   * @returns {ThemeBuilder} - This builder instance
   */
  withPrimaryColors(primary, secondary, accent) {
    this.theme.colors.primary = primary;
    this.theme.colors.secondary = secondary;
    this.theme.colors.accent = accent;
    return this;
  }

  /**
   * Set background colors
   * @param {string} background - Background color
   * @param {string} surface - Surface color
   * @returns {ThemeBuilder} - This builder instance
   */
  withBackgroundColors(background, surface) {
    this.theme.colors.background = background;
    this.theme.colors.surface = surface;
    return this;
  }

  /**
   * Set text colors
   * @param {string} text - Primary text color
   * @param {string} textSecondary - Secondary text color
   * @returns {ThemeBuilder} - This builder instance
   */
  withTextColors(text, textSecondary) {
    this.theme.colors.text = text;
    this.theme.colors.textSecondary = textSecondary;
    return this;
  }

  /**
   * Set status colors
   * @param {string} error - Error color
   * @param {string} success - Success color
   * @param {string} warning - Warning color
   * @param {string} info - Info color
   * @returns {ThemeBuilder} - This builder instance
   */
  withStatusColors(error, success, warning, info) {
    this.theme.colors.error = error;
    this.theme.colors.success = success;
    this.theme.colors.warning = warning;
    this.theme.colors.info = info;
    return this;
  }

  /**
   * Set typography
   * @param {string} fontFamily - Font family
   * @param {object} fontSize - Font sizes
   * @param {object} fontWeight - Font weights
   * @returns {ThemeBuilder} - This builder instance
   */
  withTypography(fontFamily, fontSize = null, fontWeight = null) {
    this.theme.typography.fontFamily = fontFamily;
    if (fontSize) {
      this.theme.typography.fontSize = { ...this.theme.typography.fontSize, ...fontSize };
    }
    if (fontWeight) {
      this.theme.typography.fontWeight = { ...this.theme.typography.fontWeight, ...fontWeight };
    }
    return this;
  }

  /**
   * Set spacing scale
   * @param {object} spacing - Spacing values
   * @returns {ThemeBuilder} - This builder instance
   */
  withSpacing(spacing) {
    this.theme.spacing = { ...this.theme.spacing, ...spacing };
    return this;
  }

  /**
   * Set border radius scale
   * @param {object} borderRadius - Border radius values
   * @returns {ThemeBuilder} - This builder instance
   */
  withBorderRadius(borderRadius) {
    this.theme.borderRadius = { ...this.theme.borderRadius, ...borderRadius };
    return this;
  }

  /**
   * Set shadow definitions
   * @param {object} shadows - Shadow values
   * @returns {ThemeBuilder} - This builder instance
   */
  withShadows(shadows) {
    this.theme.shadows = { ...this.theme.shadows, ...shadows };
    return this;
  }

  /**
   * Set animation configuration
   * @param {object} animations - Animation configuration
   * @returns {ThemeBuilder} - This builder instance
   */
  withAnimations(animations) {
    this.theme.animations = { ...this.theme.animations, ...animations };
    return this;
  }

  /**
   * Add custom property to theme
   * @param {string} key - Property key
   * @param {any} value - Property value
   * @returns {ThemeBuilder} - This builder instance
   */
  withCustomProperty(key, value) {
    this.theme[key] = value;
    return this;
  }

  /**
   * Build the theme object
   * @returns {object} - Built theme object
   */
  build() {
    // Validate required fields
    this.validate();
    
    // Return deep copy to prevent mutations
    return JSON.parse(JSON.stringify(this.theme));
  }

  /**
   * Validate the theme configuration
   * @throws {Error} - If validation fails
   */
  validate() {
    if (!this.theme.id || !this.theme.name) {
      throw new Error('Theme ID and name are required');
    }

    if (!this.theme.colors.primary || !this.theme.colors.background) {
      throw new Error('Primary and background colors are required');
    }
  }

  /**
   * Create a dark theme variant
   * @returns {ThemeBuilder} - This builder instance
   */
  asDarkTheme() {
    this.theme.colors.background = '#1A1A1A';
    this.theme.colors.surface = '#2D2D2D';
    this.theme.colors.text = '#FFFFFF';
    this.theme.colors.textSecondary = '#B0B0B0';
    this.theme.colors.border = '#404040';
    return this;
  }

  /**
   * Create a high contrast variant
   * @returns {ThemeBuilder} - This builder instance
   */
  asHighContrast() {
    this.theme.colors.primary = '#000000';
    this.theme.colors.secondary = '#FFFFFF';
    this.theme.colors.background = '#FFFFFF';
    this.theme.colors.surface = '#FFFFFF';
    this.theme.colors.text = '#000000';
    this.theme.colors.textSecondary = '#000000';
    this.theme.colors.border = '#000000';
    return this;
  }
}
