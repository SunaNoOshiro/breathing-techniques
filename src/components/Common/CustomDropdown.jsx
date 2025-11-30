/**
 * Custom Dropdown Component
 * 
 * A fully customizable dropdown component that replaces native <select> elements
 * with a themed, accessible, and mobile-optimized alternative.
 * 
 * Features:
 * - Theme-aware styling (uses colors from ThemeContext)
 * - Keyboard accessible (ARIA attributes)
 * - Mobile-optimized (touch-friendly, no zoom issues)
 * - Animated transitions
 * - Custom radio indicators for selected items
 * - Auto-close on backdrop click
 * 
 * @component
 * @example
 * ```jsx
 * <CustomDropdown 
 *   value="option1"
 *   options={[
 *     { value: 'option1', label: 'Option 1' },
 *     { value: 'option2', label: 'Option 2' }
 *   ]}
 *   onChange={(newValue) => console.log(newValue)}
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
  TRIGGER: {
    PADDING: '12px 36px 12px 12px',
    BORDER_WIDTH: '2px',
    BORDER_RADIUS: '8px',
    FONT_SIZE: '16px',
    FONT_WEIGHT: '500',
    TRANSITION: 'border-color 0.2s ease'
  },
  ARROW: {
    SIZE: '5px',
    POSITION_RIGHT: '15px',
    ROTATION_OPEN: '180deg',
    ROTATION_CLOSED: '0deg',
    TRANSITION: 'transform 0.2s ease'
  },
  MENU: {
    MARGIN_TOP: '4px',
    BORDER_WIDTH: '2px',
    BORDER_RADIUS: '8px',
    MAX_HEIGHT: '300px',
    SHADOW: '0 4px 6px rgba(0, 0, 0, 0.3)'
  },
  OPTION: {
    PADDING: '12px',
    GAP: '12px',
    TRANSITION: 'background 0.15s ease',
    SELECTED_BG_OPACITY: '20' // Hex opacity value for accent color
  },
  RADIO: {
    OUTER_SIZE: '20px',
    INNER_SIZE: '10px',
    BORDER_WIDTH: '2px'
  }
};

/** Z-index layers for proper stacking */
const Z_INDEX = {
  BACKDROP: 999,
  MENU: 1000
};

// ============================================================================
// Component
// ============================================================================

/**
 * CustomDropdown Component
 * 
 * @param {Object} props - Component props
 * @param {string} props.value - Currently selected value
 * @param {Array<{value: string, label: string}>} props.options - Array of options to display
 * @param {Function} props.onChange - Callback when selection changes (receives new value)
 * @param {Object} props.colors - Theme colors object
 * @param {string} props.colors.panel - Background color for dropdown
 * @param {string} props.colors.text - Text color
 * @param {string} props.colors.border - Border color
 * @param {string} props.colors.accent - Accent color for selected state
 * @param {('sm'|'md')} [props.size='md'] - Sizing preset for the trigger
 * @returns {JSX.Element} CustomDropdown component
 */
const CustomDropdown = ({ value, options, onChange, colors, size = 'md' }) => {
  // ============================================================================
  // State
  // ============================================================================

  const [isOpen, setIsOpen] = React.useState(false);

  const sizing = React.useMemo(() => {
    if (size === 'sm') {
      return {
        padding: '10px 32px 10px 10px',
        fontSize: '14px'
      };
    }

    return {
      padding: STYLES.TRIGGER.PADDING,
      fontSize: STYLES.TRIGGER.FONT_SIZE
    };
  }, [size]);
  
  // ============================================================================
  // Computed Values
  // ============================================================================
  
  /** Find the currently selected option object */
  const selectedOption = React.useMemo(
    () => options.find(opt => opt.value === value),
    [options, value]
  );
  
  // ============================================================================
  // Event Handlers
  // ============================================================================
  
  /**
   * Handle option selection
   * @param {string} optionValue - The value of the selected option
   */
  const handleSelect = React.useCallback((optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  }, [onChange]);
  
  /**
   * Toggle dropdown open/closed state
   */
  const handleToggle = React.useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);
  
  /**
   * Close dropdown
   */
  const handleClose = React.useCallback(() => {
    setIsOpen(false);
  }, []);
  
  /**
   * Handle keyboard navigation
   * @param {KeyboardEvent} event - Keyboard event
   */
  const handleKeyDown = React.useCallback((event) => {
    if (event.key === 'Escape') {
      handleClose();
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  }, [handleClose, handleToggle]);
  
  // ============================================================================
  // Render Helpers
  // ============================================================================
  
  /**
   * Render the dropdown trigger button
   */
  const renderTrigger = () => (
    <div 
      role="button"
      tabIndex={0}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      style={{
        width: '100%',
        padding: sizing.padding,
        background: colors.panel,
        color: colors.text,
        border: `${STYLES.TRIGGER.BORDER_WIDTH} solid ${isOpen ? colors.accent : colors.border}`,
        borderRadius: STYLES.TRIGGER.BORDER_RADIUS,
        fontSize: sizing.fontSize,
        cursor: 'pointer',
        userSelect: 'none',
        position: 'relative',
        transition: STYLES.TRIGGER.TRANSITION,
        fontWeight: STYLES.TRIGGER.FONT_WEIGHT
      }}
    >
      {selectedOption?.label || value}
      {renderArrow()}
    </div>
  );
  
  /**
   * Render the animated dropdown arrow
   */
  const renderArrow = () => (
    <div 
      aria-hidden="true"
      style={{
        position: 'absolute',
        right: STYLES.ARROW.POSITION_RIGHT,
        top: '50%',
        transform: `translateY(-50%) rotate(${isOpen ? STYLES.ARROW.ROTATION_OPEN : STYLES.ARROW.ROTATION_CLOSED})`,
        transition: STYLES.ARROW.TRANSITION,
        borderLeft: `${STYLES.ARROW.SIZE} solid transparent`,
        borderRight: `${STYLES.ARROW.SIZE} solid transparent`,
        borderTop: `${STYLES.ARROW.SIZE} solid ${colors.text}`,
        width: 0,
        height: 0
      }} 
    />
  );
  
  /**
   * Render the backdrop overlay
   */
  const renderBackdrop = () => (
    <div 
      aria-hidden="true"
      onClick={handleClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: Z_INDEX.BACKDROP
      }}
    />
  );
  
  /**
   * Render a radio indicator for an option
   * @param {boolean} isSelected - Whether this option is selected
   */
  const renderRadioIndicator = (isSelected) => (
    <div 
      aria-hidden="true"
      style={{
        width: STYLES.RADIO.OUTER_SIZE,
        height: STYLES.RADIO.OUTER_SIZE,
        borderRadius: '50%',
        border: `${STYLES.RADIO.BORDER_WIDTH} solid ${isSelected ? colors.accent : colors.border}`,
        backgroundColor: colors.panel,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}
    >
      {isSelected && (
        <div style={{
          width: STYLES.RADIO.INNER_SIZE,
          height: STYLES.RADIO.INNER_SIZE,
          borderRadius: '50%',
          backgroundColor: colors.accent
        }} />
      )}
    </div>
  );
  
  /**
   * Render the dropdown menu with options
   */
  const renderMenu = () => (
    <div 
      role="listbox"
      aria-activedescendant={`option-${value}`}
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        marginTop: STYLES.MENU.MARGIN_TOP,
        background: colors.panel,
        border: `${STYLES.MENU.BORDER_WIDTH} solid ${colors.border}`,
        borderRadius: STYLES.MENU.BORDER_RADIUS,
        maxHeight: STYLES.MENU.MAX_HEIGHT,
        overflowY: 'auto',
        zIndex: Z_INDEX.MENU,
        boxShadow: STYLES.MENU.SHADOW
      }}
    >
      {options.map((option) => renderOption(option))}
    </div>
  );
  
  /**
   * Render a single option in the dropdown
   * @param {Object} option - Option object with value and label
   */
  const renderOption = (option) => {
    const isSelected = value === option.value;
    
    return (
      <div
        key={option.value}
        id={`option-${option.value}`}
        role="option"
        aria-selected={isSelected}
        onClick={() => handleSelect(option.value)}
        style={{
          padding: STYLES.OPTION.PADDING,
          cursor: 'pointer',
          background: isSelected ? colors.accent + STYLES.OPTION.SELECTED_BG_OPACITY : 'transparent',
          color: colors.text,
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: STYLES.OPTION.GAP,
          transition: STYLES.OPTION.TRANSITION
        }}
      >
        {renderRadioIndicator(isSelected)}
        <span>{option.label}</span>
      </div>
    );
  };
  
  // ============================================================================
  // Render
  // ============================================================================
  
  return (
    <div style={{ position: 'relative' }}>
      {renderTrigger()}
      
      {isOpen && (
        <>
          {renderBackdrop()}
          {renderMenu()}
        </>
      )}
    </div>
  );
};

// ============================================================================
// PropTypes Documentation
// ============================================================================

/**
 * @typedef {Object} DropdownOption
 * @property {string} value - The value of the option (used for identification)
 * @property {string} label - The display label for the option
 */

/**
 * @typedef {Object} ThemeColors
 * @property {string} panel - Background color for dropdown elements
 * @property {string} text - Text color
 * @property {string} border - Border color for default state
 * @property {string} accent - Accent color for active/selected states
 */

export default CustomDropdown;

