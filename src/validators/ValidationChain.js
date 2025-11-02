/**
 * Validation Chain
 * Implements Chain of Responsibility pattern for comprehensive validation
 * Allows chaining multiple validators for complex validation scenarios
 */

export class ValidationChain {
  constructor() {
    this.validators = [];
  }

  /**
   * Add a validator to the chain
   * @param {object} validator - Validator object with validate method
   * @returns {ValidationChain} - This chain instance
   */
  addValidator(validator) {
    this.validators.push(validator);
    return this;
  }

  /**
   * Execute validation chain
   * @param {any} data - Data to validate
   * @returns {object} - Validation result
   */
  validate(data) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    };

    for (const validator of this.validators) {
      try {
        const validatorResult = validator.validate(data);
        
        if (!validatorResult.isValid) {
          result.isValid = false;
          result.errors.push(...validatorResult.errors);
        }
        
        if (validatorResult.warnings) {
          result.warnings.push(...validatorResult.warnings);
        }
      } catch (error) {
        result.isValid = false;
        result.errors.push({
          validator: validator.constructor.name,
          message: `Validation error: ${error.message}`,
          type: 'validator_error'
        });
      }
    }

    return result;
  }

  /**
   * Clear all validators from the chain
   * @returns {ValidationChain} - This chain instance
   */
  clear() {
    this.validators = [];
    return this;
  }

  /**
   * Get number of validators in chain
   * @returns {number} - Number of validators
   */
  getValidatorCount() {
    return this.validators.length;
  }
}
