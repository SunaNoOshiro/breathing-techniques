/**
 * Visualization Mixin
 * Provides visualization functionality for techniques that need it
 * Implements IVisualization interface
 */

import { IVisualization } from '../interfaces/ITechnique.js';

export class VisualizationMixin extends IVisualization {
  constructor() {
    super();
  }

  /**
   * Get visualization points for the technique
   * Default implementation creates points based on phase count
   * @returns {Array<{x: number, y: number, label: string}>} - Visualization points
   */
  getVisualizationPoints() {
    const phases = this.getPhases();
    const points = [];
    
    // Create points in a circle pattern
    const centerX = 0.5;
    const centerY = 0.5;
    const radius = 0.3;
    
    phases.forEach((phase, index) => {
      const angle = (2 * Math.PI * index) / phases.length;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      points.push({
        x,
        y,
        label: phase.name,
        phaseKey: phase.key
      });
    });
    
    return points;
  }

  /**
   * Get lung scaling based on current phase
   * @param {string} phaseKey - Current phase key
   * @param {number} timeInPhase - Time in current phase
   * @param {number} duration - Phase duration
   * @returns {number} - Lung scaling factor
   */
  getLungScaling(phaseKey, timeInPhase, duration) {
    // Start changing immediately on first second and reach target at last second
    // Using (timeInPhase + 1) ensures lungs start changing from second 1
    const progress = duration > 0 ? (timeInPhase + 1) / duration : 1;
    
    switch (phaseKey) {
      case 'inhale':
        return 0.8 + (0.4 * progress); // Scale from ~0.9 to 1.2
      case 'exhale':
        return 1.2 - (0.4 * progress); // Scale from ~1.1 to 0.8
      case 'hold1':
        return 1.2; // Hold after inhale: keep lungs full
      case 'hold2':
        return 0.8; // Hold after exhale: keep lungs empty
      case 'hold':
        return 1.0; // Backward compatibility
      default:
        return 1.0;
    }
  }

  /**
   * Get diaphragm offset based on lung scaling
   * @param {number} lungScaling - Lung scaling factor
   * @returns {number} - Diaphragm Y offset
   */
  getDiaphragmOffset(lungScaling) {
    // Diaphragm moves down when lungs expand (higher scaling)
    return (lungScaling - 1.0) * 20; // 20px offset per scaling unit
  }
}
