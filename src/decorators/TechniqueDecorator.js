/**
 * Technique Decorator
 * Base decorator class implementing Decorator pattern
 * Allows adding features to techniques without modifying their core implementation
 */

export class TechniqueDecorator {
  constructor(technique) {
    this.technique = technique;
  }

  // Delegate all basic methods to wrapped technique
  getId() { return this.technique.getId(); }
  getName() { return this.technique.getName(); }
  getDescription() { return this.technique.getDescription(); }
  getBenefits() { return this.technique.getBenefits(); }
  getPattern() { return this.technique.getPattern(); }
  getPhases() { return this.technique.getPhases(); }
  getDurationsSec() { return this.technique.getDurationsSec(); }
  getTotalDuration() { return this.technique.getTotalDuration(); }
  getCurrentPhase(elapsedSeconds) { return this.technique.getCurrentPhase(elapsedSeconds); }
  validate() { return this.technique.validate(); }

  // Optional methods - delegate if they exist
  getVisualizationPoints() { 
    return this.technique.getVisualizationPoints?.() || []; 
  }
  getLungScaling(phaseKey, timeInPhase, duration) { 
    return this.technique.getLungScaling?.(phaseKey, timeInPhase, duration) || 1.0; 
  }
  getDiaphragmOffset(lungScaling) { 
    return this.technique.getDiaphragmOffset?.(lungScaling) || 0; 
  }
  getColorScheme() { 
    return this.technique.getColorScheme?.() || {}; 
  }
  getPhaseColors(phaseKey) { 
    return this.technique.getPhaseColors?.(phaseKey) || {}; 
  }
  getInstructions() { 
    return this.technique.getInstructions?.() || []; 
  }
  getTips() { 
    return this.technique.getTips?.() || []; 
  }
}
