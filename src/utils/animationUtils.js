/**
 * Animation utilities
 * Handles animation configurations and utilities following Single Responsibility Principle
 */

/**
 * Animation configuration constants
 */
export const ANIMATION_CONFIG = {
  lungScale: {
    duration: 0.28,
    ease: 'easeInOut'
  },
  dotTransition: {
    duration: 200,
    ease: 'ease'
  },
  fadeIn: {
    duration: 300,
    ease: 'easeOut'
  },
  fadeOut: {
    duration: 200,
    ease: 'easeIn'
  },
  slideIn: {
    duration: 400,
    ease: 'easeOut'
  },
  slideOut: {
    duration: 300,
    ease: 'easeIn'
  },
  scaleIn: {
    duration: 250,
    ease: 'easeOut'
  },
  scaleOut: {
    duration: 200,
    ease: 'easeIn'
  },
  bounce: {
    duration: 600,
    ease: 'easeOut'
  },
  pulse: {
    duration: 1000,
    ease: 'easeInOut',
    repeat: 'infinity'
  }
};

/**
 * Easing functions
 */
export const EASING_FUNCTIONS = {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => t * (2 - t),
  easeInOut: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => (--t) * t * t + 1,
  easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInSine: (t) => 1 - Math.cos((t * Math.PI) / 2),
  easeOutSine: (t) => Math.sin((t * Math.PI) / 2),
  easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  easeInExpo: (t) => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
  easeOutExpo: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  easeInOutExpo: (t) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
    return (2 - Math.pow(2, -20 * t + 10)) / 2;
  },
  easeInCirc: (t) => 1 - Math.sqrt(1 - t * t),
  easeOutCirc: (t) => Math.sqrt(1 - (--t) * t),
  easeInOutCirc: (t) => {
    if (t < 0.5) return (1 - Math.sqrt(1 - 4 * t * t)) / 2;
    return (Math.sqrt(1 - 4 * (t - 1) * (t - 1)) + 1) / 2;
  },
  easeInBack: (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  easeOutBack: (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeInOutBack: (t) => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    if (t < 0.5) {
      return (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2;
    }
    return (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },
  easeInElastic: (t) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    const c4 = (2 * Math.PI) / 3;
    return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  },
  easeOutElastic: (t) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    const c4 = (2 * Math.PI) / 3;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  easeInOutElastic: (t) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    const c5 = (2 * Math.PI) / 4.5;
    if (t < 0.5) {
      return -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2;
    }
    return (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
  },
  easeInBounce: (t) => 1 - EASING_FUNCTIONS.easeOutBounce(1 - t),
  easeOutBounce: (t) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },
  easeInOutBounce: (t) => {
    return t < 0.5
      ? (1 - EASING_FUNCTIONS.easeOutBounce(1 - 2 * t)) / 2
      : (1 + EASING_FUNCTIONS.easeOutBounce(2 * t - 1)) / 2;
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
  },

  /**
   * Create keyframe animation
   * @param {string} name - Animation name
   * @param {object} keyframes - Keyframe object
   * @param {object} options - Animation options
   * @returns {object} - Animation styles
   */
  keyframes(name, keyframes, options = {}) {
    if (this.prefersReducedMotion()) {
      return {};
    }

    const duration = this.getDuration(options.duration || 1000);
    const easing = options.easing || 'ease';
    const delay = options.delay || 0;
    const iterationCount = options.iterationCount || 1;
    const direction = options.direction || 'normal';
    const fillMode = options.fillMode || 'forwards';

    return {
      animationName: name,
      animationDuration: `${duration}ms`,
      animationTimingFunction: easing,
      animationDelay: `${delay}ms`,
      animationIterationCount: iterationCount,
      animationDirection: direction,
      animationFillMode: fillMode,
      ...options
    };
  },

  /**
   * Create breathing animation
   * @param {object} options - Animation options
   * @returns {object} - Animation styles
   */
  breathing(options = {}) {
    const duration = this.getDuration(options.duration || 4000);
    const scale = options.scale || 1.2;
    
    return {
      animation: `breathing ${duration}ms ease-in-out infinite`,
      transformOrigin: 'center',
      ...options
    };
  },

  /**
   * Create pulse animation
   * @param {object} options - Animation options
   * @returns {object} - Animation styles
   */
  pulse(options = {}) {
    const duration = this.getDuration(options.duration || 1000);
    const scale = options.scale || 1.1;
    
    return {
      animation: `pulse ${duration}ms ease-in-out infinite`,
      transformOrigin: 'center',
      ...options
    };
  },

  /**
   * Create fade animation
   * @param {string} type - Animation type ('in' or 'out')
   * @param {object} options - Animation options
   * @returns {object} - Animation styles
   */
  fade(type, options = {}) {
    const duration = this.getDuration(options.duration || 300);
    const delay = options.delay || 0;
    
    return {
      animation: `fade${type} ${duration}ms ease-out ${delay}ms`,
      animationFillMode: 'forwards',
      ...options
    };
  },

  /**
   * Create slide animation
   * @param {string} direction - Slide direction
   * @param {object} options - Animation options
   * @returns {object} - Animation styles
   */
  slide(direction, options = {}) {
    const duration = this.getDuration(options.duration || 400);
    const distance = options.distance || '100%';
    
    return {
      animation: `slide${direction} ${duration}ms ease-out`,
      animationFillMode: 'forwards',
      ...options
    };
  },

  /**
   * Create scale animation
   * @param {string} type - Animation type ('in' or 'out')
   * @param {object} options - Animation options
   * @returns {object} - Animation styles
   */
  scale(type, options = {}) {
    const duration = this.getDuration(options.duration || 250);
    const scale = options.scale || (type === 'in' ? 1.1 : 0.9);
    
    return {
      animation: `scale${type} ${duration}ms ease-out`,
      animationFillMode: 'forwards',
      transformOrigin: 'center',
      ...options
    };
  },

  /**
   * Create stagger animation
   * @param {number} index - Item index
   * @param {object} options - Animation options
   * @returns {object} - Animation styles
   */
  stagger(index, options = {}) {
    const duration = this.getDuration(options.duration || 300);
    const delay = (options.delay || 50) * index;
    
    return {
      animationDelay: `${delay}ms`,
      animationDuration: `${duration}ms`,
      ...options
    };
  }
};

/**
 * CSS keyframes for animations
 */
export const CSS_KEYFRAMES = `
  @keyframes breathing {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.8; }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @keyframes slideInLeft {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }

  @keyframes slideInRight {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }

  @keyframes slideInUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  @keyframes slideInDown {
    from { transform: translateY(-100%); }
    to { transform: translateY(0); }
  }

  @keyframes slideOutLeft {
    from { transform: translateX(0); }
    to { transform: translateX(-100%); }
  }

  @keyframes slideOutRight {
    from { transform: translateX(0); }
    to { transform: translateX(100%); }
  }

  @keyframes slideOutUp {
    from { transform: translateY(0); }
    to { transform: translateY(-100%); }
  }

  @keyframes slideOutDown {
    from { transform: translateY(0); }
    to { transform: translateY(100%); }
  }

  @keyframes scaleIn {
    from { transform: scale(0); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  @keyframes scaleOut {
    from { transform: scale(1); opacity: 1; }
    to { transform: scale(0); opacity: 0; }
  }

  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
    40%, 43% { transform: translateY(-30px); }
    70% { transform: translateY(-15px); }
    90% { transform: translateY(-4px); }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
    20%, 40%, 60%, 80% { transform: translateX(10px); }
  }

  @keyframes wiggle {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(5deg); }
    75% { transform: rotate(-5deg); }
  }

  @keyframes glow {
    0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
    50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
  }
`;

/**
 * Framer Motion animation variants
 */
export const FRAMER_MOTION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slideInLeft: {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 }
  },
  slideInRight: {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 }
  },
  slideInUp: {
    initial: { y: 100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 100, opacity: 0 }
  },
  slideInDown: {
    initial: { y: -100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -100, opacity: 0 }
  },
  scaleIn: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0, opacity: 0 }
  },
  scaleOut: {
    initial: { scale: 1, opacity: 1 },
    animate: { scale: 0, opacity: 0 },
    exit: { scale: 1, opacity: 1 }
  },
  breathing: {
    animate: {
      scale: [1, 1.2, 1],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  },
  pulse: {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [1, 0.8, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  },
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }
};

/**
 * Export all animation utilities
 */
export const ANIMATION_SYSTEM = {
  ANIMATION_CONFIG,
  EASING_FUNCTIONS,
  ANIMATION_UTILS,
  CSS_KEYFRAMES,
  FRAMER_MOTION_VARIANTS
};
