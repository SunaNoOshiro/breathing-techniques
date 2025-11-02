/**
 * Phase Validator
 * Validates individual breathing phases
 * Part of Chain of Responsibility pattern
 */

export class PhaseValidator {
  constructor() {
    this.name = 'PhaseValidator';
  }

  /**
   * Validate phase data
   * @param {object} phase - Phase object to validate
   * @returns {object} - Validation result
   */
  validate(phase) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Required fields
    if (!phase.key) {
      result.isValid = false;
      result.errors.push({
        field: 'key',
        message: 'Phase key is required',
        type: 'required_field'
      });
    }

    if (!phase.name) {
      result.isValid = false;
      result.errors.push({
        field: 'name',
        message: 'Phase name is required',
        type: 'required_field'
      });
    }

    // Key validation
    if (phase.key && typeof phase.key !== 'string') {
      result.isValid = false;
      result.errors.push({
        field: 'key',
        message: 'Phase key must be a string',
        type: 'type_error'
      });
    }

    // Valid phase keys
    const validKeys = ['inhale', 'hold', 'exhale', 'pause'];
    if (phase.key && !validKeys.includes(phase.key)) {
      result.warnings.push({
        field: 'key',
        message: `Phase key '${phase.key}' is not a standard breathing phase`,
        type: 'warning'
      });
    }

    // Name validation
    if (phase.name && typeof phase.name !== 'string') {
      result.isValid = false;
      result.errors.push({
        field: 'name',
        message: 'Phase name must be a string',
        type: 'type_error'
      });
    }

    // Duration validation
    if (phase.duration !== undefined) {
      if (typeof phase.duration !== 'number' || phase.duration <= 0) {
        result.isValid = false;
        result.errors.push({
          field: 'duration',
          message: 'Phase duration must be a positive number',
          type: 'duration_validation'
        });
      }

      if (phase.duration > 60) {
        result.warnings.push({
          field: 'duration',
          message: 'Phase duration longer than 60 seconds may be difficult to follow',
          type: 'warning'
        });
      }
    }

    // Color validation
    if (phase.color) {
      if (typeof phase.color !== 'string') {
        result.isValid = false;
        result.errors.push({
          field: 'color',
          message: 'Phase color must be a string',
          type: 'type_error'
        });
      } else if (!this.isValidColor(phase.color)) {
        result.warnings.push({
          field: 'color',
          message: 'Phase color format may not be valid',
          type: 'warning'
        });
      }
    }

    return result;
  }

  /**
   * Check if color string is valid
   * @param {string} color - Color string to validate
   * @returns {boolean} - True if valid color format
   */
  isValidColor(color) {
    // Basic color validation (hex, rgb, rgba, named colors)
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    const rgbPattern = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/;
    const rgbaPattern = /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/;
    
    return hexPattern.test(color) || rgbPattern.test(color) || rgbaPattern.test(color);
  }
}
