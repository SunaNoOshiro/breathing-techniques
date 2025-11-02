/**
 * Accessibility Utilities
 * Provides utilities for ARIA labels, keyboard navigation, and screen reader support
 */

export class AccessibilityUtils {
  /**
   * Generate ARIA label for breathing phase
   * @param {string} phaseKey - Current phase key
   * @param {string} phaseName - Phase name
   * @param {number} timeRemaining - Time remaining in phase
   * @returns {string} - ARIA label
   */
  static generatePhaseAriaLabel(phaseKey, phaseName, timeRemaining) {
    const timeText = timeRemaining > 0 ? `, ${Math.ceil(timeRemaining)} seconds remaining` : '';
    return `Current phase: ${phaseName}${timeText}`;
  }

  /**
   * Generate ARIA label for technique info
   * @param {object} technique - Technique object
   * @returns {string} - ARIA label
   */
  static generateTechniqueAriaLabel(technique) {
    return `Breathing technique: ${technique.name}. ${technique.description}. Pattern: ${technique.pattern}. Benefits: ${technique.benefits}`;
  }

  /**
   * Generate ARIA label for session status
   * @param {object} sessionState - Session state
   * @returns {string} - ARIA label
   */
  static generateSessionAriaLabel(sessionState) {
    if (!sessionState.isActive) {
      return 'Breathing session is not active';
    }
    
    if (sessionState.isPaused) {
      return 'Breathing session is paused';
    }
    
    const phase = sessionState.currentPhase;
    const timeRemaining = phase ? phase.timeRemaining : 0;
    
    return `Breathing session active. ${this.generatePhaseAriaLabel(phase?.key, phase?.name, timeRemaining)}`;
  }

  /**
   * Generate ARIA live region announcement
   * @param {string} message - Message to announce
   * @param {string} priority - Priority level (polite, assertive)
   * @returns {object} - ARIA live region props
   */
  static generateLiveRegionProps(message, priority = 'polite') {
    return {
      'aria-live': priority,
      'aria-atomic': 'true',
      role: 'status',
      'aria-label': message
    };
  }

  /**
   * Generate keyboard navigation props
   * @param {Function} onKeyDown - Key down handler
   * @param {Function} onKeyUp - Key up handler
   * @returns {object} - Keyboard navigation props
   */
  static generateKeyboardProps(onKeyDown, onKeyUp) {
    return {
      tabIndex: 0,
      onKeyDown,
      onKeyUp,
      role: 'button'
    };
  }

  /**
   * Handle keyboard navigation for breathing controls
   * @param {Event} event - Keyboard event
   * @param {object} handlers - Event handlers
   */
  static handleBreathingKeyboard(event, handlers) {
    const { onStart, onPause, onStop, onResume } = handlers;
    
    switch (event.key) {
      case ' ':
      case 'Enter':
        event.preventDefault();
        if (event.type === 'keydown') {
          // Toggle play/pause
          if (handlers.isActive) {
            if (handlers.isPaused) {
              onResume?.();
            } else {
              onPause?.();
            }
          } else {
            onStart?.();
          }
        }
        break;
      case 'Escape':
        event.preventDefault();
        onStop?.();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        // Previous technique
        handlers.onPreviousTechnique?.();
        break;
      case 'ArrowRight':
        event.preventDefault();
        // Next technique
        handlers.onNextTechnique?.();
        break;
    }
  }

  /**
   * Handle keyboard navigation for settings
   * @param {Event} event - Keyboard event
   * @param {object} handlers - Event handlers
   */
  static handleSettingsKeyboard(event, handlers) {
    const { onClose, onSave, onReset } = handlers;
    
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        onClose?.();
        break;
      case 'Enter':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          onSave?.();
        }
        break;
      case 'r':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          onReset?.();
        }
        break;
    }
  }

  /**
   * Generate focus management props
   * @param {string} elementId - Element ID for focus
   * @returns {object} - Focus management props
   */
  static generateFocusProps(elementId) {
    return {
      id: elementId,
      tabIndex: -1,
      'aria-describedby': `${elementId}-description`
    };
  }

  /**
   * Announce phase change to screen readers
   * @param {string} phaseName - New phase name
   * @param {number} duration - Phase duration
   */
  static announcePhaseChange(phaseName, duration) {
    const message = `Now ${phaseName.toLowerCase()} for ${duration} seconds`;
    
    // Create temporary live region
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'assertive');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.textContent = message;
    
    document.body.appendChild(liveRegion);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(liveRegion);
    }, 1000);
  }

  /**
   * Announce session status change
   * @param {string} status - Session status
   */
  static announceSessionStatus(status) {
    const message = `Breathing session ${status}`;
    
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.textContent = message;
    
    document.body.appendChild(liveRegion);
    
    setTimeout(() => {
      document.body.removeChild(liveRegion);
    }, 2000);
  }

  /**
   * Generate screen reader only text
   * @param {string} text - Text for screen readers
   * @returns {object} - Screen reader props
   */
  static generateScreenReaderText(text) {
    return {
      className: 'sr-only',
      'aria-hidden': 'false',
      children: text
    };
  }

  /**
   * Generate skip link props
   * @param {string} targetId - Target element ID
   * @param {string} text - Skip link text
   * @returns {object} - Skip link props
   */
  static generateSkipLinkProps(targetId, text = 'Skip to main content') {
    return {
      href: `#${targetId}`,
      className: 'skip-link',
      children: text,
      onClick: (e) => {
        e.preventDefault();
        const target = document.getElementById(targetId);
        if (target) {
          target.focus();
          target.scrollIntoView();
        }
      }
    };
  }

  /**
   * Generate form field accessibility props
   * @param {string} fieldId - Field ID
   * @param {string} label - Field label
   * @param {string} description - Field description
   * @param {boolean} required - Whether field is required
   * @param {boolean} invalid - Whether field is invalid
   * @param {string} errorMessage - Error message
   * @returns {object} - Form field props
   */
  static generateFormFieldProps(fieldId, label, description, required = false, invalid = false, errorMessage = '') {
    const props = {
      id: fieldId,
      'aria-label': label,
      'aria-describedby': `${fieldId}-description`,
      'aria-required': required,
      'aria-invalid': invalid
    };

    if (description) {
      props['aria-describedby'] = `${fieldId}-description`;
    }

    if (invalid && errorMessage) {
      props['aria-describedby'] = `${props['aria-describedby']} ${fieldId}-error`;
    }

    return props;
  }

  /**
   * Generate progress bar accessibility props
   * @param {number} value - Current value
   * @param {number} max - Maximum value
   * @param {string} label - Progress label
   * @returns {object} - Progress bar props
   */
  static generateProgressProps(value, max, label) {
    return {
      role: 'progressbar',
      'aria-valuenow': value,
      'aria-valuemin': 0,
      'aria-valuemax': max,
      'aria-label': label,
      'aria-valuetext': `${Math.round((value / max) * 100)}% complete`
    };
  }
}

/**
 * CSS classes for accessibility
 */
export const ACCESSIBILITY_CLASSES = {
  screenReaderOnly: 'sr-only',
  skipLink: 'skip-link',
  focusVisible: 'focus-visible',
  highContrast: 'high-contrast',
  reducedMotion: 'reduced-motion'
};

/**
 * ARIA roles for different components
 */
export const ARIA_ROLES = {
  button: 'button',
  slider: 'slider',
  progressbar: 'progressbar',
  status: 'status',
  alert: 'alert',
  dialog: 'dialog',
  tablist: 'tablist',
  tab: 'tab',
  tabpanel: 'tabpanel',
  menu: 'menu',
  menuitem: 'menuitem'
};
