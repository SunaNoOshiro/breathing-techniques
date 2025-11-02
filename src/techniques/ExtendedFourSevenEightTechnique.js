import { BaseTechnique } from './BaseTechnique.js';

/**
 * Extended 4-7-8 Breathing Technique
 * Longer version for deep relaxation
 */
export class ExtendedFourSevenEightTechnique extends BaseTechnique {
  constructor() {
    super({
      id: '478-extended',
      name: 'Extended 4-7-8',
      description: 'Longer version for deep relaxation',
      benefits: 'Deep relaxation, stress relief, better sleep preparation',
      phases: [
        { key: 'inhale', name: 'Inhale' },
        { key: 'hold1', name: 'Hold' },
        { key: 'exhale', name: 'Exhale' },
      ],
      durationsSec: [6, 10, 12],
      pattern: '6-10-12',
    });
  }

  getInstructions() {
    return [
      'This is an extended version of 4-7-8 breathing',
      'Inhale slowly and deeply for 6 seconds',
      'Hold your breath for 10 seconds',
      'Exhale slowly and completely for 12 seconds',
      'Focus on the longer exhale for maximum relaxation',
      'Repeat 2-3 times for deep relaxation'
    ];
  }

  getColorScheme() {
    return {
      primary: '#7C3AED',
      secondary: '#10B981',
      accent: '#F59E0B',
      background: '#0b1020',
      panel: '#0f172a',
      text: '#e5e7eb'
    };
  }

  getPhaseColors(phaseKey) {
    // Зеленіє під час вдиху, червоніє перед вдихом
    // Для 3-фазної техніки: червоний → зелений → синій → червоний
    const colors = {
      inhale: { from: '#F87171', to: '#34D399' },    // вдих: червоний → зелений (зеленіє!)
      hold1: { from: '#34D399', to: '#60A5FA' },     // затримка: зелений → синій
      exhale: { from: '#60A5FA', to: '#F87171' }     // видих: синій → червоний (червоніє перед вдихом!)
    };
    return colors[phaseKey] || colors.inhale;
  }

  getLungScaling(phaseKey, timeInPhase, duration) {
    const targetInhale = 1.3; // Slightly larger for extended inhale
    const targetExhale = 0.9; // Slightly smaller for extended exhale
    
    switch (phaseKey) {
      case 'inhale':
        const inhaleStep = (targetInhale - 1) / duration;
        return 1 + inhaleStep * Math.min(timeInPhase + 1, duration);
      case 'exhale':
        const exhaleStep = (targetInhale - targetExhale) / duration;
        return targetInhale - exhaleStep * Math.min(timeInPhase + 1, duration);
      case 'hold1':
        return targetInhale;
      default:
        return 1.0;
    }
  }
}
