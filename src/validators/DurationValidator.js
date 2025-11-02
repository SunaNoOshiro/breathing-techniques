/**
 * Duration Validator
 * Validates duration-related data
 * Part of Chain of Responsibility pattern
 */

export class DurationValidator {
  constructor() {
    this.name = 'DurationValidator';
  }

  /**
   * Validate duration data
   * @param {any} data - Data to validate (can be number, array, or object)
   * @returns {object} - Validation result
   */
  validate(data) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    };

    if (typeof data === 'number') {
      this.validateSingleDuration(data, result);
    } else if (Array.isArray(data)) {
      this.validateDurationArray(data, result);
    } else if (typeof data === 'object' && data.durationsSec) {
      this.validateDurationArray(data.durationsSec, result);
    } else {
      result.isValid = false;
      result.errors.push({
        field: 'duration',
        message: 'Duration data must be a number, array, or object with durationsSec property',
        type: 'type_error'
      });
    }

    return result;
  }

  /**
   * Validate single duration value
   * @param {number} duration - Duration to validate
   * @param {object} result - Result object to update
   */
  validateSingleDuration(duration, result) {
    if (typeof duration !== 'number') {
      result.isValid = false;
      result.errors.push({
        field: 'duration',
        message: 'Duration must be a number',
        type: 'type_error'
      });
      return;
    }

    if (duration <= 0) {
      result.isValid = false;
      result.errors.push({
        field: 'duration',
        message: 'Duration must be positive',
        type: 'range_error'
      });
    }

    if (duration < 1) {
      result.warnings.push({
        field: 'duration',
        message: 'Duration less than 1 second may be too short for effective breathing',
        type: 'warning'
      });
    }

    if (duration > 60) {
      result.warnings.push({
        field: 'duration',
        message: 'Duration longer than 60 seconds may be difficult to follow',
        type: 'warning'
      });
    }

    if (duration > 300) {
      result.warnings.push({
        field: 'duration',
        message: 'Duration longer than 5 minutes may be too long for most users',
        type: 'warning'
      });
    }
  }

  /**
   * Validate array of durations
   * @param {number[]} durations - Array of durations to validate
   * @param {object} result - Result object to update
   */
  validateDurationArray(durations, result) {
    if (!Array.isArray(durations)) {
      result.isValid = false;
      result.errors.push({
        field: 'durations',
        message: 'Durations must be an array',
        type: 'type_error'
      });
      return;
    }

    if (durations.length === 0) {
      result.isValid = false;
      result.errors.push({
        field: 'durations',
        message: 'Durations array cannot be empty',
        type: 'empty_array'
      });
      return;
    }

    durations.forEach((duration, index) => {
      this.validateSingleDuration(duration, result);
      
      // Update field name for array elements
      if (result.errors.length > 0) {
        const lastError = result.errors[result.errors.length - 1];
        if (lastError.field === 'duration') {
          lastError.field = `durations[${index}]`;
        }
      }
      
      if (result.warnings.length > 0) {
        const lastWarning = result.warnings[result.warnings.length - 1];
        if (lastWarning.field === 'duration') {
          lastWarning.field = `durations[${index}]`;
        }
      }
    });

    // Validate total duration
    const totalDuration = durations.reduce((sum, duration) => sum + duration, 0);
    
    if (totalDuration < 4) {
      result.warnings.push({
        field: 'totalDuration',
        message: 'Total cycle duration less than 4 seconds may be too short',
        type: 'warning'
      });
    }

    if (totalDuration > 120) {
      result.warnings.push({
        field: 'totalDuration',
        message: 'Total cycle duration longer than 2 minutes may be too long',
        type: 'warning'
      });
    }

    // Check for balanced durations
    const avgDuration = totalDuration / durations.length;
    const unbalancedDurations = durations.filter(d => Math.abs(d - avgDuration) > avgDuration * 0.5);
    
    if (unbalancedDurations.length > 0) {
      result.warnings.push({
        field: 'durations',
        message: 'Some durations are significantly different from the average, which may affect breathing rhythm',
        type: 'warning'
      });
    }
  }
}
