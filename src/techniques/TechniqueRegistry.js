import { BaseTechnique } from './BaseTechnique.js';
import { BoxBreathingTechnique } from './BoxBreathingTechnique.js';
import { FourSevenEightTechnique } from './FourSevenEightTechnique.js';
import { ExtendedFourSevenEightTechnique } from './ExtendedFourSevenEightTechnique.js';
import { TriangleBreathingTechnique } from './TriangleBreathingTechnique.js';
import { EqualBreathingTechnique } from './EqualBreathingTechnique.js';
import { EnergyBreathingTechnique } from './EnergyBreathingTechnique.js';
import { ExtendedBoxBreathingTechnique } from './ExtendedBoxBreathingTechnique.js';
import { CoherentBreathingTechnique } from './CoherentBreathingTechnique.js';

/**
 * Technique Registry and Factory
 * Manages all available breathing techniques and provides factory methods
 */
export class TechniqueRegistry {
  constructor() {
    this.techniques = new Map();
    this.registerDefaultTechniques();
  }

  /**
   * Register all default techniques
   */
  registerDefaultTechniques() {
    const techniqueClasses = [
      BoxBreathingTechnique,
      FourSevenEightTechnique,
      ExtendedFourSevenEightTechnique,
      TriangleBreathingTechnique,
      EqualBreathingTechnique,
      EnergyBreathingTechnique,
      ExtendedBoxBreathingTechnique,
      CoherentBreathingTechnique,
    ];

    techniqueClasses.forEach(TechniqueClass => {
      const technique = new TechniqueClass();
      this.register(technique);
    });
  }

  /**
   * Register a new technique
   */
  register(technique) {
    if (!(technique instanceof BaseTechnique)) {
      throw new Error('Technique must extend BaseTechnique');
    }
    
    technique.validate();
    this.techniques.set(technique.id, technique);
  }

  /**
   * Get a technique by ID
   */
  getTechnique(id) {
    const technique = this.techniques.get(id);
    if (!technique) {
      throw new Error(`Technique with ID '${id}' not found`);
    }
    return technique;
  }

  /**
   * Get all registered techniques
   */
  getAllTechniques() {
    return Array.from(this.techniques.values());
  }

  /**
   * Get technique IDs
   */
  getTechniqueIds() {
    return Array.from(this.techniques.keys());
  }

  /**
   * Check if a technique exists
   */
  hasTechnique(id) {
    return this.techniques.has(id);
  }

  /**
   * Get techniques by category (if implemented)
   */
  getTechniquesByCategory(category) {
    return this.getAllTechniques().filter(technique => 
      technique.category === category
    );
  }

  /**
   * Get techniques sorted by difficulty (if implemented)
   */
  getTechniquesByDifficulty(difficulty) {
    return this.getAllTechniques().filter(technique => 
      technique.difficulty === difficulty
    );
  }

  /**
   * Create a technique instance (factory method)
   */
  createTechnique(id) {
    const technique = this.getTechnique(id);
    // Return a new instance to avoid shared state
    return new technique.constructor();
  }

  /**
   * Get technique metadata for UI
   */
  getTechniqueMetadata() {
    return this.getAllTechniques().map(technique => ({
      id: technique.id,
      name: technique.name,
      description: technique.description,
      benefits: technique.benefits,
      pattern: technique.pattern,
      totalDuration: technique.getTotalDuration(),
      phaseCount: technique.phases.length,
      colorScheme: technique.getColorScheme()
    }));
  }

  /**
   * Search techniques by name or description
   */
  searchTechniques(query) {
    const lowerQuery = query.toLowerCase();
    return this.getAllTechniques().filter(technique => 
      technique.name.toLowerCase().includes(lowerQuery) ||
      technique.description.toLowerCase().includes(lowerQuery) ||
      technique.benefits.toLowerCase().includes(lowerQuery) ||
      technique.pattern.includes(query)
    );
  }

  /**
   * Get recommended techniques based on criteria
   */
  getRecommendedTechniques(criteria = {}) {
    let techniques = this.getAllTechniques();

    // Filter by duration if specified
    if (criteria.maxDuration) {
      techniques = techniques.filter(t => t.getTotalDuration() <= criteria.maxDuration);
    }

    if (criteria.minDuration) {
      techniques = techniques.filter(t => t.getTotalDuration() >= criteria.minDuration);
    }

    // Filter by phase count if specified
    if (criteria.maxPhases) {
      techniques = techniques.filter(t => t.phases.length <= criteria.maxPhases);
    }

    if (criteria.minPhases) {
      techniques = techniques.filter(t => t.phases.length >= criteria.minPhases);
    }

    // Sort by total duration (ascending)
    techniques.sort((a, b) => a.getTotalDuration() - b.getTotalDuration());

    return techniques;
  }
}

// Create and export a singleton instance
export const techniqueRegistry = new TechniqueRegistry();

// Export individual technique classes for advanced usage
export {
  BaseTechnique,
  BoxBreathingTechnique,
  FourSevenEightTechnique,
  ExtendedFourSevenEightTechnique,
  TriangleBreathingTechnique,
  EqualBreathingTechnique,
  EnergyBreathingTechnique,
  ExtendedBoxBreathingTechnique,
  CoherentBreathingTechnique,
};
