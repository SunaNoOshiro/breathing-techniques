/**
 * Base class for all breathing techniques
 * Implements core ITechnique interface and provides common functionality
 * Follows Interface Segregation Principle by implementing only essential methods
 */

import { ITechnique } from './interfaces/ITechnique.js';

export class BaseTechnique extends ITechnique {
  constructor(config) {
    super();
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.benefits = config.benefits;
    this.phases = config.phases;
    this.durationsSec = config.durationsSec;
    this.pattern = config.pattern;
  }

  // ITechnique interface implementation
  getId() {
    return this.id;
  }

  getName() {
    return this.name;
  }

  getDescription() {
    return this.description;
  }

  getBenefits() {
    return this.benefits;
  }

  getPattern() {
    return this.pattern;
  }

  getPhases() {
    return this.phases;
  }

  getDurationsSec() {
    return this.durationsSec;
  }

  /**
   * Get the total duration of one complete cycle
   */
  getTotalDuration() {
    return this.durationsSec.reduce((sum, duration) => sum + duration, 0);
  }

  /**
   * Get the current phase based on elapsed time
   */
  getCurrentPhase(elapsedSeconds) {
    let accumulatedTime = 0;
    for (let i = 0; i < this.phases.length; i++) {
      accumulatedTime += this.durationsSec[i];
      if (elapsedSeconds < accumulatedTime) {
        return {
          phaseIndex: i,
          phase: this.phases[i],
          duration: this.durationsSec[i],
          timeInPhase: elapsedSeconds - (accumulatedTime - this.durationsSec[i]),
          timeLeft: accumulatedTime - elapsedSeconds
        };
      }
    }
    // If we've completed a full cycle, return the first phase
    return this.getCurrentPhase(elapsedSeconds % this.getTotalDuration());
  }

  /**
   * Get visualization points for the technique
   * Override this method for custom layouts
   */
  getVisualizationPoints() {
    // Determine layout type based on technique pattern
    if (this.phases.length === 4) {
      return this.generateBoxLayout();
    } else if (this.phases.length === 3) {
      return this.generateTriangleLayout();
    } else if (this.phases.length === 2) {
      return this.generateCircularLayout();
    } else {
      return this.generateSquareLayout();
    }
  }

  /**
   * Generate box layout points for 4-phase techniques (4-4-4-4, 6-6-6-6, etc.)
   */
  generateBoxLayout() {
    // Keep coordinates consistent with the 420x420 `squareWrap` with increased padding
    // to avoid overlap with the centered breathing person SVG (260x340)
    const SIZE = 420;
    const PADDING = 30; // Moderate padding now that SVG has more space
    const LEFT = PADDING;
    const RIGHT = SIZE - PADDING;
    const TOP = PADDING;
    const BOTTOM = SIZE - PADDING;

    const totalPoints = this.getTotalDuration();
    const stepsPerPhase = this.durationsSec[0]; // All phases should have same duration for box breathing

    const pts = [];
    let pointIndex = 0;
    
    // Calculate points per side
    const pointsPerSide = stepsPerPhase;
    
    // Top side (left to right) - Inhale phase: 1, 2, 3, 4
    // Use improved spacing: (i + 1.5) / (pointsPerSide + 2) to avoid corner overlaps
    for (let i = 0; i < pointsPerSide && pointIndex < totalPoints; i++) {
      const t = (i + 1.5) / (pointsPerSide + 2);
      const x = LEFT + t * (RIGHT - LEFT);
      const stepNumber = i + 1; // Sequential numbering: 1, 2, 3, 4
      pts.push({ x, y: TOP, label: String(stepNumber) });
      pointIndex++;
    }
    
    // Right side (top to bottom) - Hold 1 phase: 1, 2, 3, 4
    for (let i = 0; i < pointsPerSide && pointIndex < totalPoints; i++) {
      const t = (i + 1.5) / (pointsPerSide + 2);
      const y = TOP + t * (BOTTOM - TOP);
      const stepNumber = i + 1; // Sequential numbering: 1, 2, 3, 4
      pts.push({ x: RIGHT, y, label: String(stepNumber) });
      pointIndex++;
    }
    
    // Bottom side (right to left) - Exhale phase: 1, 2, 3, 4
    for (let i = 0; i < pointsPerSide && pointIndex < totalPoints; i++) {
      const t = (i + 1.5) / (pointsPerSide + 2);
      const x = RIGHT - t * (RIGHT - LEFT);
      const stepNumber = i + 1; // Sequential numbering: 1, 2, 3, 4
      pts.push({ x, y: BOTTOM, label: String(stepNumber) });
      pointIndex++;
    }
    
    // Left side (bottom to top) - Hold 2 phase: 1, 2, 3, 4
    for (let i = 0; i < pointsPerSide && pointIndex < totalPoints; i++) {
      const t = (i + 1.5) / (pointsPerSide + 2);
      const y = BOTTOM - t * (BOTTOM - TOP);
      const stepNumber = i + 1; // Sequential numbering: 1, 2, 3, 4
      pts.push({ x: LEFT, y, label: String(stepNumber) });
      pointIndex++;
    }
    
    return pts;
  }

  /**
   * Generate triangle layout points for 3-phase techniques (4-4-4, 4-7-8, etc.)
   * Places points evenly distributed along triangle sides with improved spacing to prevent overlaps
   */
  generateTriangleLayout() {
    const totalPoints = this.getTotalDuration();
    const pts = [];
    let pointIndex = 0;

    // Points per side based on phase durations
    const inhaleSteps = this.durationsSec[0];
    const holdSteps = this.durationsSec[1];
    const exhaleSteps = this.durationsSec[2];

    // Define an equilateral triangle inside the 420x420 square with increased padding
    // to avoid overlap with the centered breathing person SVG (260x340)
    // The SVG is centered, so it occupies roughly X: 80-340, Y: 40-380
    // No padding to ensure points are at the very edges, completely outside the body outline
    const SIZE = 420;
    const PADDING = 30; // Moderate padding now that SVG has more space
    const TOP = PADDING; // y for top vertex
    const BOTTOM = SIZE - PADDING; // y for base vertices
    const LEFT = PADDING;
    const RIGHT = SIZE - PADDING;
    const CENTER_X = SIZE / 2; // 210

    // Triangle vertices: top, bottom-right, bottom-left
    const V_TOP = { x: CENTER_X, y: TOP };
    const V_BR = { x: RIGHT, y: BOTTOM };
    const V_BL = { x: LEFT, y: BOTTOM };

    // Helper to interpolate between two vertices with improved spacing
    const lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

    // Side 1: top -> bottom-right (inhale)
    // Use improved spacing: (i + 1.5) / (inhaleSteps + 2) to avoid corner overlaps
    for (let i = 0; i < inhaleSteps && pointIndex < totalPoints; i++) {
      const t = (i + 1.5) / (inhaleSteps + 2);
      const p = lerp(V_TOP, V_BR, t);
      const stepNumber = i + 1; // Sequential numbering: 1, 2, 3, 4...
      pts.push({ x: p.x, y: p.y, label: String(stepNumber) });
      pointIndex++;
    }

    // Side 2: bottom-right -> bottom-left (hold)
    // Use improved spacing to avoid overlaps
    for (let i = 0; i < holdSteps && pointIndex < totalPoints; i++) {
      const t = (i + 1.5) / (holdSteps + 2);
      const p = lerp(V_BR, V_BL, t);
      const stepNumber = i + 1; // Sequential numbering: 1, 2, 3, 4...
      pts.push({ x: p.x, y: p.y, label: String(stepNumber) });
      pointIndex++;
    }

    // Side 3: bottom-left -> top (exhale)
    // Use improved spacing to avoid overlaps
    for (let i = 0; i < exhaleSteps && pointIndex < totalPoints; i++) {
      const t = (i + 1.5) / (exhaleSteps + 2);
      const p = lerp(V_BL, V_TOP, t);
      const stepNumber = i + 1; // Sequential numbering: 1, 2, 3, 4...
      pts.push({ x: p.x, y: p.y, label: String(stepNumber) });
      pointIndex++;
    }

    return pts;
  }

  /**
   * Generate circular layout points for 2-phase techniques (5-5, etc.)
   */
  generateCircularLayout() {
    const totalPoints = this.getTotalDuration();
    // Keep consistent with squareWrap with increased padding to avoid overlap with human body
    const SIZE = 420;
    const PADDING = 30; // Moderate padding now that SVG has more space
    const centerX = SIZE / 2; // 210
    const centerY = SIZE / 2; // 210
    const radius = (SIZE / 2) - PADDING; // 70 (reduced from 170)

    const pts = [];

    for (let i = 0; i < totalPoints; i++) {
      const angle = (i / totalPoints) * 2 * Math.PI - Math.PI / 2; // start from top
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      const stepNumber = i + 1;
      pts.push({ x, y, label: String(stepNumber) });
    }

    return pts;
  }

  /**
   * Generate square layout points (fallback for other techniques)
   */
  generateSquareLayout() {
    const SIZE = 420;
    const PADDING = 30; // Moderate padding now that SVG has more space
    const LEFT = PADDING;
    const RIGHT = SIZE - PADDING;
    const TOP = PADDING;
    const BOTTOM = SIZE - PADDING;

    const totalPoints = this.getTotalDuration();
    const pointsPerSide = Math.ceil(totalPoints / 4);

    const pts = [];
    let pointIndex = 0;
    
    // Top side (left to right): 1, 2, 3, 4...
    // Use improved spacing: (i + 1.5) / (pointsPerSide + 2) to avoid corner overlaps
    for (let i = 0; i < pointsPerSide && pointIndex < totalPoints; i++) {
      const t = (i + 1.5) / (pointsPerSide + 2);
      const x = LEFT + t * (RIGHT - LEFT);
      const stepNumber = i + 1; // Sequential numbering: 1, 2, 3, 4...
      pts.push({ x, y: TOP, label: String(stepNumber) });
      pointIndex++;
    }
    
    // Right side (top to bottom): 1, 2, 3, 4...
    for (let i = 0; i < pointsPerSide && pointIndex < totalPoints; i++) {
      const t = (i + 1.5) / (pointsPerSide + 2);
      const y = TOP + t * (BOTTOM - TOP);
      const stepNumber = i + 1; // Sequential numbering: 1, 2, 3, 4...
      pts.push({ x: RIGHT, y, label: String(stepNumber) });
      pointIndex++;
    }
    
    // Bottom side (right to left): 1, 2, 3, 4...
    for (let i = 0; i < pointsPerSide && pointIndex < totalPoints; i++) {
      const t = (i + 1.5) / (pointsPerSide + 2);
      const x = RIGHT - t * (RIGHT - LEFT);
      const stepNumber = i + 1; // Sequential numbering: 1, 2, 3, 4...
      pts.push({ x, y: BOTTOM, label: String(stepNumber) });
      pointIndex++;
    }
    
    // Left side (bottom to top): 1, 2, 3, 4...
    for (let i = 0; i < pointsPerSide && pointIndex < totalPoints; i++) {
      const t = (i + 1.5) / (pointsPerSide + 2);
      const y = BOTTOM - t * (BOTTOM - TOP);
      const stepNumber = i + 1; // Sequential numbering: 1, 2, 3, 4...
      pts.push({ x: LEFT, y, label: String(stepNumber) });
      pointIndex++;
    }
    
    return pts;
  }

  /**
   * Get lung scaling based on current phase
   * Override this method for custom scaling behavior
   */
  getLungScaling(phaseKey, timeInPhase, duration) {
    const targetInhale = 1.25;
    const targetExhale = 1.0;
    
    switch (phaseKey) {
      case 'inhale':
        // Start growing immediately on first second and reach full size at last second
        // Using (timeInPhase + 1) ensures lungs start growing from second 1
        if (duration <= 0) return 1.0;
        {
          const progress = (timeInPhase + 1) / duration;
          return 1 + (targetInhale - 1) * progress;
        }
      case 'exhale':
        // Start shrinking immediately on first second and reach empty at last second
        // Using (timeInPhase + 1) ensures lungs start shrinking from second 1
        if (duration <= 0) return targetExhale;
        {
          const progress = (timeInPhase + 1) / duration;
          return targetInhale - (targetInhale - targetExhale) * progress;
        }
      case 'hold1':
        return targetInhale;
      case 'hold2':
        return targetExhale;
      default:
        return 1.0;
    }
  }

  /**
   * Get diaphragm Y offset based on lung scaling
   */
  getDiaphragmOffset(lungScaling) {
    return (lungScaling - 1) * 28;
  }

  /**
   * Get technique-specific color scheme
   * Override this method for custom colors
   */
  getColorScheme() {
    return {
      primary: '#60A5FA',
      secondary: '#34D399',
      accent: '#F59E0B',
      background: '#0b1020',
      panel: '#0f172a',
      text: '#e5e7eb'
    };
  }

  /**
   * Get phase-specific colors
   * Зеленіє під час вдиху, червоніє перед вдихом
   * Червоний → Зелений → Синій → Сірий → Червоний
   * Override this method for custom phase colors
   */
  getPhaseColors(phaseKey) {
    const colors = {
      inhale: { from: '#F87171', to: '#34D399' },   // вдих: червоний → зелений (зеленіє!)
      hold1: { from: '#34D399', to: '#60A5FA' },    // затримка1: зелений → синій
      exhale: { from: '#60A5FA', to: '#9CA3AF' },   // видих: синій → сірий
      hold2: { from: '#9CA3AF', to: '#F87171' }     // затримка2: сірий → червоний (червоніє перед вдихом!)
    };
    return colors[phaseKey] || colors.inhale;
  }

  /**
   * Get technique-specific instructions or tips
   * Override this method for custom instructions
   */
  getInstructions() {
    return [];
  }

  /**
   * Validate technique configuration
   */
  validate() {
    if (!this.id || !this.name || !this.phases || !this.durationsSec) {
      throw new Error(`Invalid technique configuration for ${this.id}`);
    }
    if (this.phases.length !== this.durationsSec.length) {
      throw new Error(`Phase count mismatch for technique ${this.id}`);
    }
    return true;
  }
}
