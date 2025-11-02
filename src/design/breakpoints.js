/**
 * Design system foundation
 * Provides consistent breakpoints, spacing, and typography
 */

/**
 * Responsive breakpoints
 * Centralized breakpoint definitions following Open/Closed Principle
 */
export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

/**
 * Breakpoint utilities
 */
export const BREAKPOINT_UTILS = {
  /**
   * Check if current screen size matches breakpoint
   * @param {string} breakpoint - Breakpoint name
   * @returns {boolean} - True if screen matches breakpoint
   */
  isBreakpoint(breakpoint) {
    const width = window.innerWidth;
    const bp = BREAKPOINTS[breakpoint];
    
    if (breakpoint === 'xs') {
      return width >= BREAKPOINTS.xs && width < BREAKPOINTS.sm;
    }
    
    if (breakpoint === '2xl') {
      return width >= BREAKPOINTS['2xl'];
    }
    
    const nextBreakpoint = Object.keys(BREAKPOINTS)[
      Object.keys(BREAKPOINTS).indexOf(breakpoint) + 1
    ];
    
    if (nextBreakpoint) {
      return width >= bp && width < BREAKPOINTS[nextBreakpoint];
    }
    
    return width >= bp;
  },

  /**
   * Check if screen is mobile
   * @returns {boolean} - True if mobile
   */
  isMobile() {
    return window.innerWidth < BREAKPOINTS.md;
  },

  /**
   * Check if screen is tablet
   * @returns {boolean} - True if tablet
   */
  isTablet() {
    return window.innerWidth >= BREAKPOINTS.md && window.innerWidth < BREAKPOINTS.lg;
  },

  /**
   * Check if screen is desktop
   * @returns {boolean} - True if desktop
   */
  isDesktop() {
    return window.innerWidth >= BREAKPOINTS.lg;
  },

  /**
   * Get current breakpoint name
   * @returns {string} - Current breakpoint name
   */
  getCurrentBreakpoint() {
    const width = window.innerWidth;
    
    if (width < BREAKPOINTS.sm) return 'xs';
    if (width < BREAKPOINTS.md) return 'sm';
    if (width < BREAKPOINTS.lg) return 'md';
    if (width < BREAKPOINTS.xl) return 'lg';
    if (width < BREAKPOINTS['2xl']) return 'xl';
    return '2xl';
  },

  /**
   * Get responsive value based on breakpoint
   * @param {object} values - Object with breakpoint keys and values
   * @returns {any} - Value for current breakpoint
   */
  getResponsiveValue(values) {
    const current = this.getCurrentBreakpoint();
    return values[current] || values.default || values.lg || values.md || values.sm || values.xs;
  }
};

/**
 * Spacing system
 * Consistent spacing values following design system principles
 */
export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '40px',
  '5xl': '48px',
  '6xl': '64px',
  '7xl': '80px',
  '8xl': '96px'
};

/**
 * Spacing utilities
 */
export const SPACING_UTILS = {
  /**
   * Get spacing value
   * @param {string} size - Spacing size
   * @returns {string} - Spacing value
   */
  getSpacing(size) {
    return SPACING[size] || size;
  },

  /**
   * Get responsive spacing
   * @param {object} spacing - Object with breakpoint keys and spacing values
   * @returns {string} - Responsive spacing value
   */
  getResponsiveSpacing(spacing) {
    return BREAKPOINT_UTILS.getResponsiveValue(spacing);
  },

  /**
   * Create margin object
   * @param {string|object} value - Margin value or responsive object
   * @returns {object} - Margin styles
   */
  margin(value) {
    if (typeof value === 'string') {
      return { margin: this.getSpacing(value) };
    }
    
    return {
      margin: this.getResponsiveSpacing(value)
    };
  },

  /**
   * Create padding object
   * @param {string|object} value - Padding value or responsive object
   * @returns {object} - Padding styles
   */
  padding(value) {
    if (typeof value === 'string') {
      return { padding: this.getSpacing(value) };
    }
    
    return {
      padding: this.getResponsiveSpacing(value)
    };
  },

  /**
   * Create gap object
   * @param {string|object} value - Gap value or responsive object
   * @returns {object} - Gap styles
   */
  gap(value) {
    if (typeof value === 'string') {
      return { gap: this.getSpacing(value) };
    }
    
    return {
      gap: this.getResponsiveSpacing(value)
    };
  }
};

/**
 * Typography system
 * Consistent typography following design system principles
 */
export const TYPOGRAPHY = {
  fontFamily: {
    sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', 'monospace']
  },
  
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
    '6xl': '60px'
  },
  
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900
  },
  
  lineHeight: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2
  },
  
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em'
  }
};

/**
 * Typography utilities
 */
export const TYPOGRAPHY_UTILS = {
  /**
   * Create heading styles
   * @param {string} level - Heading level (h1, h2, h3, h4, h5, h6)
   * @param {object} options - Additional options
   * @returns {object} - Heading styles
   */
  heading(level, options = {}) {
    const styles = {
      h1: {
        fontSize: TYPOGRAPHY.fontSize['4xl'],
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        lineHeight: TYPOGRAPHY.lineHeight.tight,
        letterSpacing: TYPOGRAPHY.letterSpacing.tight
      },
      h2: {
        fontSize: TYPOGRAPHY.fontSize['3xl'],
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        lineHeight: TYPOGRAPHY.lineHeight.tight,
        letterSpacing: TYPOGRAPHY.letterSpacing.tight
      },
      h3: {
        fontSize: TYPOGRAPHY.fontSize['2xl'],
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
        lineHeight: TYPOGRAPHY.lineHeight.snug
      },
      h4: {
        fontSize: TYPOGRAPHY.fontSize.xl,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
        lineHeight: TYPOGRAPHY.lineHeight.snug
      },
      h5: {
        fontSize: TYPOGRAPHY.fontSize.lg,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
        lineHeight: TYPOGRAPHY.lineHeight.normal
      },
      h6: {
        fontSize: TYPOGRAPHY.fontSize.base,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
        lineHeight: TYPOGRAPHY.lineHeight.normal
      }
    };

    return {
      ...styles[level],
      ...options
    };
  },

  /**
   * Create body text styles
   * @param {string} size - Text size
   * @param {object} options - Additional options
   * @returns {object} - Body text styles
   */
  body(size = 'base', options = {}) {
    return {
      fontSize: TYPOGRAPHY.fontSize[size] || TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      ...options
    };
  },

  /**
   * Create caption styles
   * @param {object} options - Additional options
   * @returns {object} - Caption styles
   */
  caption(options = {}) {
    return {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      ...options
    };
  },

  /**
   * Create label styles
   * @param {object} options - Additional options
   * @returns {object} - Label styles
   */
  label(options = {}) {
    return {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      lineHeight: TYPOGRAPHY.lineHeight.normal,
      ...options
    };
  }
};

/**
 * Layout utilities
 */
export const LAYOUT_UTILS = {
  /**
   * Create container styles
   * @param {object} options - Container options
   * @returns {object} - Container styles
   */
  container(options = {}) {
    return {
      width: '100%',
      maxWidth: options.maxWidth || '1200px',
      margin: '0 auto',
      padding: options.padding || SPACING.lg,
      ...options
    };
  },

  /**
   * Create flexbox styles
   * @param {object} options - Flex options
   * @returns {object} - Flex styles
   */
  flex(options = {}) {
    return {
      display: 'flex',
      flexDirection: options.direction || 'row',
      alignItems: options.align || 'stretch',
      justifyContent: options.justify || 'flex-start',
      gap: options.gap ? SPACING_UTILS.getSpacing(options.gap) : undefined,
      ...options
    };
  },

  /**
   * Create grid styles
   * @param {object} options - Grid options
   * @returns {object} - Grid styles
   */
  grid(options = {}) {
    return {
      display: 'grid',
      gridTemplateColumns: options.columns || 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: options.gap ? SPACING_UTILS.getSpacing(options.gap) : SPACING.lg,
      ...options
    };
  },

  /**
   * Create responsive styles
   * @param {object} styles - Styles object with breakpoint keys
   * @returns {object} - Responsive styles
   */
  responsive(styles) {
    const responsiveStyles = {};
    
    Object.keys(styles).forEach(breakpoint => {
      if (breakpoint in BREAKPOINTS) {
        const mediaQuery = breakpoint === 'xs' 
          ? `(max-width: ${BREAKPOINTS.sm - 1}px)`
          : `(min-width: ${BREAKPOINTS[breakpoint]}px)`;
        
        responsiveStyles[`@media ${mediaQuery}`] = styles[breakpoint];
      } else {
        responsiveStyles[breakpoint] = styles[breakpoint];
      }
    });
    
    return responsiveStyles;
  }
};

/**
 * Animation utilities
 */
export const ANIMATION_UTILS = {
  /**
   * Check if user prefers reduced motion
   * @returns {boolean} - True if reduced motion preferred
   */
  prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * Get animation duration based on user preference
   * @param {number} duration - Default duration in ms
   * @returns {number} - Adjusted duration
   */
  getDuration(duration) {
    return this.prefersReducedMotion() ? 0 : duration;
  },

  /**
   * Create transition styles
   * @param {object} options - Transition options
   * @returns {object} - Transition styles
   */
  transition(options = {}) {
    if (this.prefersReducedMotion()) {
      return {};
    }

    return {
      transition: `${options.property || 'all'} ${this.getDuration(options.duration || 200)}ms ${options.easing || 'ease'}`,
      ...options
    };
  }
};

/**
 * Export all utilities
 */
export const DESIGN_SYSTEM = {
  BREAKPOINTS,
  BREAKPOINT_UTILS,
  SPACING,
  SPACING_UTILS,
  TYPOGRAPHY,
  TYPOGRAPHY_UTILS,
  LAYOUT_UTILS,
  ANIMATION_UTILS
};
