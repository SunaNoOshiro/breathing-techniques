/**
 * Main export file for the breathing techniques framework
 * Provides clean imports for the entire system
 */

// Core framework
export { BaseTechnique } from './techniques/BaseTechnique.js';
export { techniqueRegistry } from './techniques/TechniqueRegistry.js';

// Individual techniques
export { BoxBreathingTechnique } from './techniques/BoxBreathingTechnique.js';
export { FourSevenEightTechnique } from './techniques/FourSevenEightTechnique.js';
export { ExtendedFourSevenEightTechnique } from './techniques/ExtendedFourSevenEightTechnique.js';
export { TriangleBreathingTechnique } from './techniques/TriangleBreathingTechnique.js';
export { EqualBreathingTechnique } from './techniques/EqualBreathingTechnique.js';
export { EnergyBreathingTechnique } from './techniques/EnergyBreathingTechnique.js';
export { ExtendedBoxBreathingTechnique } from './techniques/ExtendedBoxBreathingTechnique.js';
export { CoherentBreathingTechnique } from './techniques/CoherentBreathingTechnique.js';

// Utilities
export { 
  COLORS, 
  computeLungPaint, 
  generateThemeColors, 
  AudioManager, 
  VibrationManager, 
  LAYOUT_STYLES, 
  ANIMATION_CONFIG 
} from './utils/breathingUtils.js';
