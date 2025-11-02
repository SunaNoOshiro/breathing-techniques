/**
 * Colorable Mixin
 * Provides color functionality for techniques that need custom colors
 * Implements IColorable interface
 */

import { IColorable } from '../interfaces/ITechnique.js';

export class ColorableMixin extends IColorable {
  constructor() {
    super();
  }

  /**
   * Get technique-specific color scheme
   * @returns {object} - Color scheme object
   */
  getColorScheme() {
    return {
      primary: '#4A90E2',
      secondary: '#7ED321',
      accent: '#F5A623',
      background: '#F8F9FA',
      text: '#333333',
      phases: {
        inhale: '#4A90E2',
        hold: '#7ED321',
        exhale: '#F5A623',
        pause: '#9013FE'
      }
    };
  }

  /**
   * Get phase-specific colors
   * @param {string} phaseKey - Phase key
   * @returns {object} - Phase colors
   */
  getPhaseColors(phaseKey) {
    const scheme = this.getColorScheme();
    
    return {
      primary: scheme.phases[phaseKey] || scheme.primary,
      secondary: this.lightenColor(scheme.phases[phaseKey] || scheme.primary, 0.3),
      accent: this.darkenColor(scheme.phases[phaseKey] || scheme.primary, 0.2),
      background: scheme.background,
      text: scheme.text
    };
  }

  /**
   * Lighten a color by a given amount
   * @param {string} color - Hex color
   * @param {number} amount - Amount to lighten (0-1)
   * @returns {string} - Lightened hex color
   */
  lightenColor(color, amount) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const newR = Math.min(255, Math.floor(r + (255 - r) * amount));
    const newG = Math.min(255, Math.floor(g + (255 - g) * amount));
    const newB = Math.min(255, Math.floor(b + (255 - b) * amount));
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  /**
   * Darken a color by a given amount
   * @param {string} color - Hex color
   * @param {number} amount - Amount to darken (0-1)
   * @returns {string} - Darkened hex color
   */
  darkenColor(color, amount) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const newR = Math.max(0, Math.floor(r * (1 - amount)));
    const newG = Math.max(0, Math.floor(g * (1 - amount)));
    const newB = Math.max(0, Math.floor(b * (1 - amount)));
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }
}
