/**
 * Technique Builder
 * Implements Builder pattern for creating complex technique objects
 * Allows fluent API for technique construction with optional features
 */

import { BaseTechnique } from '../techniques/BaseTechnique.js';
import { VisualizationMixin } from '../techniques/mixins/VisualizationMixin.js';
import { ColorableMixin } from '../techniques/mixins/ColorableMixin.js';
import { InstructableMixin } from '../techniques/mixins/InstructableMixin.js';
import { AudioEnabledMixin } from '../techniques/mixins/AudioEnabledMixin.js';

export class TechniqueBuilder {
  constructor() {
    this.reset();
  }

  /**
   * Reset the builder to initial state
   * @returns {TechniqueBuilder} - This builder instance
   */
  reset() {
    this.config = {
      id: '',
      name: '',
      description: '',
      benefits: '',
      phases: [],
      durationsSec: [],
      pattern: ''
    };
    this.mixins = [];
    this.customMethods = {};
    return this;
  }

  /**
   * Set basic technique information
   * @param {string} id - Technique ID
   * @param {string} name - Technique name
   * @param {string} description - Technique description
   * @param {string} benefits - Technique benefits
   * @returns {TechniqueBuilder} - This builder instance
   */
  withBasicInfo(id, name, description, benefits) {
    this.config.id = id;
    this.config.name = name;
    this.config.description = description;
    this.config.benefits = benefits;
    return this;
  }

  /**
   * Set breathing pattern
   * @param {Array<{key: string, name: string}>} phases - Breathing phases
   * @param {number[]} durationsSec - Phase durations in seconds
   * @param {string} pattern - Pattern string (e.g., "4-4-4-4")
   * @returns {TechniqueBuilder} - This builder instance
   */
  withPattern(phases, durationsSec, pattern) {
    this.config.phases = phases;
    this.config.durationsSec = durationsSec;
    this.config.pattern = pattern;
    return this;
  }

  /**
   * Add visualization capabilities
   * @returns {TechniqueBuilder} - This builder instance
   */
  withVisualization() {
    this.mixins.push(VisualizationMixin);
    return this;
  }

  /**
   * Add color capabilities
   * @returns {TechniqueBuilder} - This builder instance
   */
  withColors() {
    this.mixins.push(ColorableMixin);
    return this;
  }

  /**
   * Add instruction capabilities
   * @returns {TechniqueBuilder} - This builder instance
   */
  withInstructions() {
    this.mixins.push(InstructableMixin);
    return this;
  }

  /**
   * Add audio capabilities
   * @returns {TechniqueBuilder} - This builder instance
   */
  withAudio() {
    this.mixins.push(AudioEnabledMixin);
    return this;
  }

  /**
   * Add custom method to the technique
   * @param {string} methodName - Method name
   * @param {Function} method - Method implementation
   * @returns {TechniqueBuilder} - This builder instance
   */
  withCustomMethod(methodName, method) {
    this.customMethods[methodName] = method;
    return this;
  }

  /**
   * Build the technique instance
   * @returns {BaseTechnique} - Built technique instance
   */
  build() {
    // Validate required fields
    this.validate();

    // Create technique class dynamically
    const TechniqueClass = this.createTechniqueClass();
    
    // Instantiate and return
    return new TechniqueClass(this.config);
  }

  /**
   * Validate the builder configuration
   * @throws {Error} - If validation fails
   */
  validate() {
    const required = ['id', 'name', 'description', 'benefits', 'phases', 'durationsSec', 'pattern'];
    
    for (const field of required) {
      if (!this.config[field]) {
        throw new Error(`Required field '${field}' is missing`);
      }
    }

    if (this.config.phases.length !== this.config.durationsSec.length) {
      throw new Error('Phases and durations must have the same length');
    }
  }

  /**
   * Create technique class with mixins
   * @returns {Class} - Technique class
   */
  createTechniqueClass() {
    // Start with BaseTechnique
    let TechniqueClass = class extends BaseTechnique {};

    // Apply mixins
    this.mixins.forEach(MixinClass => {
      const MixinInstance = new MixinClass();
      const mixinMethods = Object.getOwnPropertyNames(MixinClass.prototype)
        .filter(name => name !== 'constructor');

      mixinMethods.forEach(methodName => {
        TechniqueClass.prototype[methodName] = MixinInstance[methodName].bind(MixinInstance);
      });
    });

    // Add custom methods
    Object.entries(this.customMethods).forEach(([methodName, method]) => {
      TechniqueClass.prototype[methodName] = method;
    });

    return TechniqueClass;
  }
}
