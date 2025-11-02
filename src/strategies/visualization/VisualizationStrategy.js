/**
 * Visualization Strategy Pattern
 * Defines interface for different visualization strategies following Strategy Pattern
 */

import { AppError, ERROR_CODES } from '../../errors/AppError.js';

/**
 * Base Visualization Strategy interface
 */
export class VisualizationStrategy {
  /**
   * Generate visualization points
   * @param {object} technique - Technique object
   * @returns {Array} - Array of visualization points
   */
  generatePoints(technique) {
    throw new Error('generatePoints method must be implemented by strategy');
  }

  /**
   * Get strategy name
   * @returns {string} - Strategy name
   */
  getName() {
    throw new Error('getName method must be implemented by strategy');
  }

  /**
   * Check if strategy supports technique
   * @param {object} technique - Technique object
   * @returns {boolean} - True if supported
   */
  supportsTechnique(technique) {
    throw new Error('supportsTechnique method must be implemented by strategy');
  }

  /**
   * Get strategy configuration
   * @returns {object} - Strategy configuration
   */
  getConfiguration() {
    return {};
  }
}

/**
 * Box Visualization Strategy
 * Generates box/square layout for 4-phase techniques
 */
export class BoxVisualizationStrategy extends VisualizationStrategy {
  constructor() {
    super();
    this.name = 'box';
    this.supportedPhaseCounts = [4];
  }

  /**
   * Generate box layout points
   * @param {object} technique - Technique object
   * @returns {Array} - Array of visualization points
   */
  generatePoints(technique) {
    const SIZE = 420;
    const PADDING = 30;
    const LEFT = PADDING;
    const RIGHT = SIZE - PADDING;
    const TOP = PADDING;
    const BOTTOM = SIZE - PADDING;

    const totalPoints = technique.getTotalDuration();
    const stepsPerPhase = technique.durationsSec[0]; // All phases should have same duration for box breathing

    const points = [];
    let pointIndex = 0;
    
    // Calculate points per side
    const pointsPerSide = stepsPerPhase;
    
    // Top side (left to right) - Inhale phase
    for (let i = 0; i < pointsPerSide && pointIndex < totalPoints; i++) {
      const t = (i + 1.5) / (pointsPerSide + 2);
      const x = LEFT + t * (RIGHT - LEFT);
      const stepNumber = i + 1;
      points.push({ x, y: TOP, label: String(stepNumber) });
      pointIndex++;
    }
    
    // Right side (top to bottom) - Hold 1 phase
    for (let i = 0; i < pointsPerSide && pointIndex < totalPoints; i++) {
      const t = (i + 1.5) / (pointsPerSide + 2);
      const y = TOP + t * (BOTTOM - TOP);
      const stepNumber = i + 1;
      points.push({ x: RIGHT, y, label: String(stepNumber) });
      pointIndex++;
    }
    
    // Bottom side (right to left) - Exhale phase
    for (let i = 0; i < pointsPerSide && pointIndex < totalPoints; i++) {
      const t = (i + 1.5) / (pointsPerSide + 2);
      const x = RIGHT - t * (RIGHT - LEFT);
      const stepNumber = i + 1;
      points.push({ x, y: BOTTOM, label: String(stepNumber) });
      pointIndex++;
    }
    
    // Left side (bottom to top) - Hold 2 phase
    for (let i = 0; i < pointsPerSide && pointIndex < totalPoints; i++) {
      const t = (i + 1.5) / (pointsPerSide + 2);
      const y = BOTTOM - t * (BOTTOM - TOP);
      const stepNumber = i + 1;
      points.push({ x: LEFT, y, label: String(stepNumber) });
      pointIndex++;
    }
    
    return points;
  }

  /**
   * Get strategy name
   * @returns {string} - Strategy name
   */
  getName() {
    return this.name;
  }

  /**
   * Check if strategy supports technique
   * @param {object} technique - Technique object
   * @returns {boolean} - True if supported
   */
  supportsTechnique(technique) {
    return this.supportedPhaseCounts.includes(technique.phases.length);
  }

  /**
   * Get strategy configuration
   * @returns {object} - Strategy configuration
   */
  getConfiguration() {
    return {
      name: this.name,
      supportedPhaseCounts: this.supportedPhaseCounts,
      layout: 'box',
      description: 'Box/square layout for 4-phase breathing techniques'
    };
  }
}

/**
 * Triangle Visualization Strategy
 * Generates triangle layout for 3-phase techniques
 */
export class TriangleVisualizationStrategy extends VisualizationStrategy {
  constructor() {
    super();
    this.name = 'triangle';
    this.supportedPhaseCounts = [3];
  }

  /**
   * Generate triangle layout points
   * @param {object} technique - Technique object
   * @returns {Array} - Array of visualization points
   */
  generatePoints(technique) {
    const totalPoints = technique.getTotalDuration();
    const points = [];
    let pointIndex = 0;

    // Points per side based on phase durations
    const inhaleSteps = technique.durationsSec[0];
    const holdSteps = technique.durationsSec[1];
    const exhaleSteps = technique.durationsSec[2];

    // Define an equilateral triangle inside the 420x420 square
    const SIZE = 420;
    const PADDING = 30;
    const TOP = PADDING;
    const BOTTOM = SIZE - PADDING;
    const LEFT = PADDING;
    const RIGHT = SIZE - PADDING;
    const CENTER_X = SIZE / 2;

    // Triangle vertices: top, bottom-right, bottom-left
    const V_TOP = { x: CENTER_X, y: TOP };
    const V_BR = { x: RIGHT, y: BOTTOM };
    const V_BL = { x: LEFT, y: BOTTOM };

    // Helper to interpolate between two vertices
    const lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

    // Side 1: top -> bottom-right (inhale)
    for (let i = 0; i < inhaleSteps && pointIndex < totalPoints; i++) {
      const t = (i + 1.5) / (inhaleSteps + 2);
      const p = lerp(V_TOP, V_BR, t);
      const stepNumber = i + 1;
      points.push({ x: p.x, y: p.y, label: String(stepNumber) });
      pointIndex++;
    }

    // Side 2: bottom-right -> bottom-left (hold)
    for (let i = 0; i < holdSteps && pointIndex < totalPoints; i++) {
      const t = (i + 1.5) / (holdSteps + 2);
      const p = lerp(V_BR, V_BL, t);
      const stepNumber = i + 1;
      points.push({ x: p.x, y: p.y, label: String(stepNumber) });
      pointIndex++;
    }

    // Side 3: bottom-left -> top (exhale)
    for (let i = 0; i < exhaleSteps && pointIndex < totalPoints; i++) {
      const t = (i + 1.5) / (exhaleSteps + 2);
      const p = lerp(V_BL, V_TOP, t);
      const stepNumber = i + 1;
      points.push({ x: p.x, y: p.y, label: String(stepNumber) });
      pointIndex++;
    }

    return points;
  }

  /**
   * Get strategy name
   * @returns {string} - Strategy name
   */
  getName() {
    return this.name;
  }

  /**
   * Check if strategy supports technique
   * @param {object} technique - Technique object
   * @returns {boolean} - True if supported
   */
  supportsTechnique(technique) {
    return this.supportedPhaseCounts.includes(technique.phases.length);
  }

  /**
   * Get strategy configuration
   * @returns {object} - Strategy configuration
   */
  getConfiguration() {
    return {
      name: this.name,
      supportedPhaseCounts: this.supportedPhaseCounts,
      layout: 'triangle',
      description: 'Triangle layout for 3-phase breathing techniques'
    };
  }
}

/**
 * Circular Visualization Strategy
 * Generates circular layout for 2-phase techniques
 */
export class CircularVisualizationStrategy extends VisualizationStrategy {
  constructor() {
    super();
    this.name = 'circular';
    this.supportedPhaseCounts = [2];
  }

  /**
   * Generate circular layout points
   * @param {object} technique - Technique object
   * @returns {Array} - Array of visualization points
   */
  generatePoints(technique) {
    const totalPoints = technique.getTotalDuration();
    const SIZE = 420;
    const PADDING = 30;
    const centerX = SIZE / 2;
    const centerY = SIZE / 2;
    const radius = (SIZE / 2) - PADDING;

    const points = [];

    for (let i = 0; i < totalPoints; i++) {
      const angle = (i / totalPoints) * 2 * Math.PI - Math.PI / 2; // start from top
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      const stepNumber = i + 1;
      points.push({ x, y, label: String(stepNumber) });
    }

    return points;
  }

  /**
   * Get strategy name
   * @returns {string} - Strategy name
   */
  getName() {
    return this.name;
  }

  /**
   * Check if strategy supports technique
   * @param {object} technique - Technique object
   * @returns {boolean} - True if supported
   */
  supportsTechnique(technique) {
    return this.supportedPhaseCounts.includes(technique.phases.length);
  }

  /**
   * Get strategy configuration
   * @returns {object} - Strategy configuration
   */
  getConfiguration() {
    return {
      name: this.name,
      supportedPhaseCounts: this.supportedPhaseCounts,
      layout: 'circular',
      description: 'Circular layout for 2-phase breathing techniques'
    };
  }
}

/**
 * Square Visualization Strategy
 * Generates square layout as fallback for other techniques
 */
export class SquareVisualizationStrategy extends VisualizationStrategy {
  constructor() {
    super();
    this.name = 'square';
    this.supportedPhaseCounts = [1, 5, 6, 7, 8]; // Fallback for unusual phase counts
  }

  /**
   * Generate square layout points
   * @param {object} technique - Technique object
   * @returns {Array} - Array of visualization points
   */
  generatePoints(technique) {
    const SIZE = 420;
    const PADDING = 30;
    const LEFT = PADDING;
    const RIGHT = SIZE - PADDING;
    const TOP = PADDING;
    const BOTTOM = SIZE - PADDING;

    const totalPoints = technique.getTotalDuration();
    const pointsPerSide = Math.ceil(totalPoints / 4);

    const points = [];
    let pointIndex = 0;
    
    // Top side (left to right)
    for (let i = 0; i < pointsPerSide && pointIndex < totalPoints; i++) {
      const t = (i + 1.5) / (pointsPerSide + 2);
      const x = LEFT + t * (RIGHT - LEFT);
      const stepNumber = i + 1;
      points.push({ x, y: TOP, label: String(stepNumber) });
      pointIndex++;
    }
    
    // Right side (top to bottom)
    for (let i = 0; i < pointsPerSide && pointIndex < totalPoints; i++) {
      const t = (i + 1.5) / (pointsPerSide + 2);
      const y = TOP + t * (BOTTOM - TOP);
      const stepNumber = i + 1;
      points.push({ x: RIGHT, y, label: String(stepNumber) });
      pointIndex++;
    }
    
    // Bottom side (right to left)
    for (let i = 0; i < pointsPerSide && pointIndex < totalPoints; i++) {
      const t = (i + 1.5) / (pointsPerSide + 2);
      const x = RIGHT - t * (RIGHT - LEFT);
      const stepNumber = i + 1;
      points.push({ x, y: BOTTOM, label: String(stepNumber) });
      pointIndex++;
    }
    
    // Left side (bottom to top)
    for (let i = 0; i < pointsPerSide && pointIndex < totalPoints; i++) {
      const t = (i + 1.5) / (pointsPerSide + 2);
      const y = BOTTOM - t * (BOTTOM - TOP);
      const stepNumber = i + 1;
      points.push({ x: LEFT, y, label: String(stepNumber) });
      pointIndex++;
    }
    
    return points;
  }

  /**
   * Get strategy name
   * @returns {string} - Strategy name
   */
  getName() {
    return this.name;
  }

  /**
   * Check if strategy supports technique
   * @param {object} technique - Technique object
   * @returns {boolean} - True if supported
   */
  supportsTechnique(technique) {
    return this.supportedPhaseCounts.includes(technique.phases.length);
  }

  /**
   * Get strategy configuration
   * @returns {object} - Strategy configuration
   */
  getConfiguration() {
    return {
      name: this.name,
      supportedPhaseCounts: this.supportedPhaseCounts,
      layout: 'square',
      description: 'Square layout as fallback for unusual phase counts'
    };
  }
}

/**
 * Visualization Strategy Manager
 * Manages visualization strategies and selects appropriate one
 */
export class VisualizationStrategyManager {
  constructor() {
    this.strategies = new Map();
    this.registerDefaultStrategies();
  }

  /**
   * Register default strategies
   */
  registerDefaultStrategies() {
    this.registerStrategy(new BoxVisualizationStrategy());
    this.registerStrategy(new TriangleVisualizationStrategy());
    this.registerStrategy(new CircularVisualizationStrategy());
    this.registerStrategy(new SquareVisualizationStrategy());
  }

  /**
   * Register a visualization strategy
   * @param {VisualizationStrategy} strategy - Strategy to register
   */
  registerStrategy(strategy) {
    if (!(strategy instanceof VisualizationStrategy)) {
      throw new AppError(
        'Strategy must extend VisualizationStrategy',
        ERROR_CODES.CONFIGURATION_INVALID,
        { strategy }
      );
    }

    this.strategies.set(strategy.getName(), strategy);
  }

  /**
   * Get strategy for technique
   * @param {object} technique - Technique object
   * @returns {VisualizationStrategy} - Appropriate strategy
   */
  getStrategyForTechnique(technique) {
    for (const strategy of this.strategies.values()) {
      if (strategy.supportsTechnique(technique)) {
        return strategy;
      }
    }

    // Fallback to square strategy
    return this.strategies.get('square');
  }

  /**
   * Generate visualization points for technique
   * @param {object} technique - Technique object
   * @returns {Array} - Array of visualization points
   */
  generatePoints(technique) {
    const strategy = this.getStrategyForTechnique(technique);
    return strategy.generatePoints(technique);
  }

  /**
   * Get all registered strategies
   * @returns {Array} - Array of strategies
   */
  getAllStrategies() {
    return Array.from(this.strategies.values());
  }

  /**
   * Get strategy by name
   * @param {string} name - Strategy name
   * @returns {VisualizationStrategy|null} - Strategy or null
   */
  getStrategy(name) {
    return this.strategies.get(name) || null;
  }

  /**
   * Get strategy capabilities
   * @returns {object} - Strategy capabilities
   */
  getCapabilities() {
    return {
      strategyCount: this.strategies.size,
      strategies: Array.from(this.strategies.keys()),
      configurations: Array.from(this.strategies.values()).map(s => s.getConfiguration())
    };
  }
}

// Create and export singleton instance
export const visualizationStrategyManager = new VisualizationStrategyManager();
