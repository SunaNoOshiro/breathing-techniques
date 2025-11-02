/**
 * Enhanced Breathing Animations
 * Provides accessible, configurable animations with reduced motion support
 */

import { motion } from 'framer-motion';

/**
 * Animation configurations respecting user preferences
 */
export const ANIMATION_CONFIGS = {
  // Basic breathing animation
  breathing: {
    duration: 4,
    ease: 'easeInOut',
    repeat: Infinity,
    repeatType: 'loop'
  },

  // Phase transition animation
  phaseTransition: {
    duration: 0.5,
    ease: 'easeInOut'
  },

  // Button hover animation
  buttonHover: {
    scale: 1.05,
    transition: { duration: 0.2, ease: 'easeOut' }
  },

  // Button tap animation
  buttonTap: {
    scale: 0.95,
    transition: { duration: 0.1, ease: 'easeIn' }
  },

  // Fade in animation
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },

  // Slide in animation
  slideIn: {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },

  // Scale in animation
  scaleIn: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },

  // Pulse animation for active states
  pulse: {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [1, 0.8, 1]
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  },

  // Shake animation for errors
  shake: {
    animate: {
      x: [-10, 10, -10, 10, 0],
      transition: { duration: 0.5, ease: 'easeInOut' }
    }
  }
};

/**
 * Reduced motion variants
 */
export const REDUCED_MOTION_VARIANTS = {
  breathing: {
    duration: 0.1,
    ease: 'linear',
    repeat: Infinity,
    repeatType: 'loop'
  },
  phaseTransition: {
    duration: 0.1,
    ease: 'linear'
  },
  buttonHover: {
    scale: 1,
    transition: { duration: 0 }
  },
  buttonTap: {
    scale: 1,
    transition: { duration: 0 }
  },
  fadeIn: {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    exit: { opacity: 1 },
    transition: { duration: 0 }
  },
  slideIn: {
    initial: { x: 0, opacity: 1 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 0, opacity: 1 },
    transition: { duration: 0 }
  },
  scaleIn: {
    initial: { scale: 1, opacity: 1 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1, opacity: 1 },
    transition: { duration: 0 }
  },
  pulse: {
    animate: {
      scale: 1,
      opacity: 1
    },
    transition: { duration: 0 }
  },
  shake: {
    animate: {
      x: 0,
      transition: { duration: 0 }
    }
  }
};

/**
 * Get animation config based on user preferences
 * @param {string} animationType - Type of animation
 * @param {boolean} prefersReducedMotion - User's motion preference
 * @returns {object} - Animation configuration
 */
export function getAnimationConfig(animationType, prefersReducedMotion = false) {
  if (prefersReducedMotion) {
    return REDUCED_MOTION_VARIANTS[animationType] || REDUCED_MOTION_VARIANTS.fadeIn;
  }
  return ANIMATION_CONFIGS[animationType] || ANIMATION_CONFIGS.fadeIn;
}

/**
 * Breathing Figure Animation Component
 * Animated SVG figure with accessibility support
 */
export function BreathingFigureAnimation({ 
  phaseKey, 
  timeInPhase, 
  duration, 
  prefersReducedMotion = false,
  ...props 
}) {
  const animationConfig = getAnimationConfig('breathing', prefersReducedMotion);
  
  // Calculate lung scaling based on phase
  const getLungScaling = (phaseKey, timeInPhase, duration) => {
    if (prefersReducedMotion) return 1;
    
    // Start changing immediately on first second and reach target at last second
    // Using (timeInPhase + 1) ensures lungs start changing from second 1
    const progress = duration > 0 ? (timeInPhase + 1) / duration : 1;
    
    switch (phaseKey) {
      case 'inhale':
        return 0.8 + (0.4 * progress);
      case 'exhale':
        return 1.2 - (0.4 * progress);
      case 'hold1':
        return 1.2; // keep full after inhale
      case 'hold2':
        return 0.8; // keep empty after exhale
      case 'hold':
        return 1.0; // fallback compatibility
      default:
        return 1.0;
    }
  };

  const lungScaling = getLungScaling(phaseKey, timeInPhase, duration);
  const diaphragmOffset = prefersReducedMotion ? 0 : (lungScaling - 1.0) * 20;

  return (
    <motion.svg
      {...props}
      animate={{
        scale: prefersReducedMotion ? 1 : [1, 1.02, 1],
      }}
      transition={animationConfig}
      aria-label={`Breathing visualization: ${phaseKey} phase`}
      role="img"
    >
      {/* Human figure */}
      <motion.g
        animate={{
          scaleY: lungScaling,
          y: diaphragmOffset
        }}
        transition={animationConfig}
      >
        {/* Lungs */}
        <motion.ellipse
          cx="50"
          cy="30"
          rx="15"
          ry="20"
          fill="currentColor"
          opacity="0.7"
          animate={{
            scaleY: lungScaling,
            opacity: prefersReducedMotion ? 0.7 : [0.7, 0.9, 0.7]
          }}
          transition={animationConfig}
        />
        <motion.ellipse
          cx="50"
          cy="30"
          rx="15"
          ry="20"
          fill="currentColor"
          opacity="0.7"
          animate={{
            scaleY: lungScaling,
            opacity: prefersReducedMotion ? 0.7 : [0.7, 0.9, 0.7]
          }}
          transition={animationConfig}
        />
        
        {/* Diaphragm */}
        <motion.line
          x1="35"
          y1="50"
          x2="65"
          y2="50"
          stroke="currentColor"
          strokeWidth="2"
          animate={{
            y: diaphragmOffset
          }}
          transition={animationConfig}
        />
      </motion.g>
    </motion.svg>
  );
}

/**
 * Phase Transition Animation Component
 * Smooth transitions between breathing phases
 */
export function PhaseTransitionAnimation({ 
  children, 
  phaseKey, 
  prefersReducedMotion = false,
  ...props 
}) {
  const animationConfig = getAnimationConfig('phaseTransition', prefersReducedMotion);
  
  return (
    <motion.div
      {...props}
      key={phaseKey}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={animationConfig}
      aria-live="polite"
      aria-label={`Phase changed to ${phaseKey}`}
    >
      {children}
    </motion.div>
  );
}

/**
 * Button Animation Component
 * Accessible button with hover and tap animations
 */
export function AnimatedButton({ 
  children, 
  onClick, 
  prefersReducedMotion = false,
  disabled = false,
  ...props 
}) {
  const hoverConfig = getAnimationConfig('buttonHover', prefersReducedMotion);
  const tapConfig = getAnimationConfig('buttonTap', prefersReducedMotion);
  
  return (
    <motion.button
      {...props}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : hoverConfig}
      whileTap={disabled ? {} : tapConfig}
      aria-disabled={disabled}
      style={{
        ...props.style,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1
      }}
    >
      {children}
    </motion.button>
  );
}

/**
 * Progress Animation Component
 * Animated progress indicator with accessibility
 */
export function AnimatedProgress({ 
  value, 
  max, 
  prefersReducedMotion = false,
  label,
  ...props 
}) {
  const percentage = (value / max) * 100;
  const animationConfig = getAnimationConfig('breathing', prefersReducedMotion);
  
  return (
    <div
      {...props}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      aria-valuetext={`${Math.round(percentage)}% complete`}
    >
      <motion.div
        style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: 'currentColor',
          borderRadius: 'inherit'
        }}
        animate={prefersReducedMotion ? {} : {
          opacity: [0.7, 1, 0.7]
        }}
        transition={animationConfig}
      />
    </div>
  );
}

/**
 * Notification Animation Component
 * Animated notifications with accessibility
 */
export function AnimatedNotification({ 
  children, 
  type = 'info',
  prefersReducedMotion = false,
  onClose,
  ...props 
}) {
  const slideConfig = getAnimationConfig('slideIn', prefersReducedMotion);
  const shakeConfig = getAnimationConfig('shake', prefersReducedMotion);
  
  return (
    <motion.div
      {...props}
      initial={slideConfig.initial}
      animate={type === 'error' ? shakeConfig.animate : slideConfig.animate}
      exit={slideConfig.exit}
      transition={slideConfig.transition}
      role="alert"
      aria-live="assertive"
      style={{
        ...props.style,
        border: type === 'error' ? '2px solid #e74c3c' : '2px solid #3498db',
        backgroundColor: type === 'error' ? '#fdf2f2' : '#f0f8ff',
        color: type === 'error' ? '#721c24' : '#1e3a8a'
      }}
    >
      {children}
      {onClose && (
        <motion.button
          onClick={onClose}
          aria-label="Close notification"
          whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            background: 'none',
            border: 'none',
            fontSize: '1.2rem',
            cursor: 'pointer'
          }}
        >
          ×
        </motion.button>
      )}
    </motion.div>
  );
}

/**
 * Loading Animation Component
 * Accessible loading indicator
 */
export function AnimatedLoading({ 
  prefersReducedMotion = false,
  label = 'Loading...',
  ...props 
}) {
  const pulseConfig = getAnimationConfig('pulse', prefersReducedMotion);
  
  return (
    <motion.div
      {...props}
      animate={pulseConfig.animate}
      transition={pulseConfig.transition}
      role="status"
      aria-label={label}
      style={{
        ...props.style,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem'
      }}
    >
      <motion.div
        animate={prefersReducedMotion ? {} : {
          rotate: 360
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
        style={{
          width: '1rem',
          height: '1rem',
          border: '2px solid currentColor',
          borderTop: '2px solid transparent',
          borderRadius: '50%'
        }}
        aria-hidden="true"
      />
      <span>{label}</span>
    </motion.div>
  );
}
