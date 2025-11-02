/**
 * Custom Radio Button Component
 * 
 * A fully customizable radio button component that replaces native radio inputs
 * with a themed, accessible, and visually consistent alternative.
 * 
 * Features:
 * - Theme-aware styling (uses colors from ThemeContext)
 * - Accessible (proper label association)
 * - Mobile-optimized (larger hit areas)
 * - Animated transitions
 * - Custom visual indicators
 * 
 * @component
 * @example
 * ```jsx
 * <CustomRadio 
 *   checked={isOn}
 *   onChange={() => setIsOn(true)}
 *   label="On"
 *   colors={currentColors}
 * />
 * ```
 */

import React from 'react';

// ============================================================================
// Constants
// ============================================================================

/** Styling constants for consistent spacing and sizing */
const STYLES = {
  LABEL: {
    GAP: '12px',
    FONT_SIZE: '16px'
  },
  OUTER_CIRCLE: {
    SIZE: '24px',
    BORDER_WIDTH: '2px',
    TRANSITION: 'all 0.2s ease'
  },
  INNER_CIRCLE: {
    SIZE: '12px',
    TRANSITION: 'all 0.2s ease'
  }
};

// ============================================================================
// Component
// ============================================================================

/**
 * CustomRadio Component
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.checked - Whether the radio is checked
 * @param {Function} props.onChange - Callback when radio is clicked
 * @param {string} props.label - Label text to display
 * @param {Object} props.colors - Theme colors object
 * @param {string} props.colors.panel - Background color
 * @param {string} props.colors.text - Text color
 * @param {string} props.colors.border - Border color for unchecked state
 * @param {string} props.colors.accent - Accent color for checked state
 * @param {string} [props.name] - Name attribute for radio group (optional)
 * @returns {JSX.Element} CustomRadio component
 */
const CustomRadio = ({ checked, onChange, label, colors, name }) => {
  // ============================================================================
  // Render
  // ============================================================================
  
  return (
    <label 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: STYLES.LABEL.GAP, 
        fontSize: STYLES.LABEL.FONT_SIZE,
        color: colors.text,
        cursor: 'pointer',
        userSelect: 'none'
      }}
    >
      {/* Hidden native radio input for accessibility and form integration */}
      <input 
        type="radio"
        name={name}
        checked={checked} 
        onChange={onChange}
        style={{ 
          position: 'absolute',
          opacity: 0,
          cursor: 'pointer',
          width: 0,
          height: 0
        }}
      />
      
      {/* Custom visual radio button */}
      <div 
        aria-hidden="true"
        style={{
          width: STYLES.OUTER_CIRCLE.SIZE,
          height: STYLES.OUTER_CIRCLE.SIZE,
          borderRadius: '50%',
          border: `${STYLES.OUTER_CIRCLE.BORDER_WIDTH} solid ${checked ? colors.accent : colors.border}`,
          backgroundColor: colors.panel,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: STYLES.OUTER_CIRCLE.TRANSITION,
          flexShrink: 0
        }}
      >
        {/* Inner filled circle (shown when checked) */}
        {checked && (
          <div style={{
            width: STYLES.INNER_CIRCLE.SIZE,
            height: STYLES.INNER_CIRCLE.SIZE,
            borderRadius: '50%',
            backgroundColor: colors.accent,
            transition: STYLES.INNER_CIRCLE.TRANSITION
          }} />
        )}
      </div>
      
      {/* Label text */}
      <span>{label}</span>
    </label>
  );
};

// ============================================================================
// PropTypes Documentation
// ============================================================================

/**
 * @typedef {Object} ThemeColors
 * @property {string} panel - Background color
 * @property {string} text - Text color
 * @property {string} border - Border color for unchecked state
 * @property {string} accent - Accent color for checked state
 */

export default CustomRadio;



