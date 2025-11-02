/**
 * Technique Validator
 * Validates technique configuration and structure
 * Part of Chain of Responsibility pattern
 */

export class TechniqueValidator {
  constructor() {
    this.name = 'TechniqueValidator';
  }

  /**
   * Validate technique data
   * @param {object} technique - Technique object to validate
   * @returns {object} - Validation result
   */
  validate(technique) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Required fields validation
    const requiredFields = ['id', 'name', 'description', 'benefits', 'phases', 'durationsSec', 'pattern'];
    
    for (const field of requiredFields) {
      if (!technique[field]) {
        result.isValid = false;
        result.errors.push({
          field,
          message: `Required field '${field}' is missing`,
          type: 'required_field'
        });
      }
    }

    // ID validation
    if (technique.id && typeof technique.id !== 'string') {
      result.isValid = false;
      result.errors.push({
        field: 'id',
        message: 'ID must be a string',
        type: 'type_error'
      });
    }

    // Name validation
    if (technique.name && technique.name.length < 3) {
      result.warnings.push({
        field: 'name',
        message: 'Technique name should be at least 3 characters long',
        type: 'warning'
      });
    }

    // Phases and durations validation
    if (technique.phases && technique.durationsSec) {
      if (!Array.isArray(technique.phases)) {
        result.isValid = false;
        result.errors.push({
          field: 'phases',
          message: 'Phases must be an array',
          type: 'type_error'
        });
      }

      if (!Array.isArray(technique.durationsSec)) {
        result.isValid = false;
        result.errors.push({
          field: 'durationsSec',
          message: 'Durations must be an array',
          type: 'type_error'
        });
      }

      if (technique.phases.length !== technique.durationsSec.length) {
        result.isValid = false;
        result.errors.push({
          field: 'phases',
          message: 'Phases and durations arrays must have the same length',
          type: 'length_mismatch'
        });
      }

      // Validate phase structure
      if (Array.isArray(technique.phases)) {
        technique.phases.forEach((phase, index) => {
          if (!phase.key || !phase.name) {
            result.isValid = false;
            result.errors.push({
              field: `phases[${index}]`,
              message: 'Each phase must have key and name properties',
              type: 'phase_structure'
            });
          }
        });
      }

      // Validate durations
      if (Array.isArray(technique.durationsSec)) {
        technique.durationsSec.forEach((duration, index) => {
          if (typeof duration !== 'number' || duration <= 0) {
            result.isValid = false;
            result.errors.push({
              field: `durationsSec[${index}]`,
              message: 'Each duration must be a positive number',
              type: 'duration_validation'
            });
          }
        });
      }
    }

    // Pattern validation
    if (technique.pattern && typeof technique.pattern !== 'string') {
      result.isValid = false;
      result.errors.push({
        field: 'pattern',
        message: 'Pattern must be a string',
        type: 'type_error'
      });
    }

    return result;
  }
}
