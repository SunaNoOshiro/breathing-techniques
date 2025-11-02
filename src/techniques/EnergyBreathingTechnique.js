import { BaseTechnique } from './BaseTechnique.js';

/**
 * Energy Breathing 6-2-8 Technique
 * Quick inhale, short hold, long exhale for energy and alertness
 */
export class EnergyBreathingTechnique extends BaseTechnique {
  constructor() {
    super({
      id: '628',
      name: 'Energy Breathing 6-2-8',
      description: 'Quick inhale, short hold, long exhale',
      benefits: 'Increases energy, improves alertness, quick stress relief',
      phases: [
        { key: 'inhale', name: 'Inhale' },
        { key: 'hold1', name: 'Hold' },
        { key: 'exhale', name: 'Exhale' },
      ],
      durationsSec: [6, 2, 8],
      pattern: '6-2-8',
    });
  }

  getInstructions() {
    return [
      'Energizing breathing pattern',
      'Quick, sharp inhale for 6 seconds',
      'Brief hold for 2 seconds',
      'Long, controlled exhale for 8 seconds',
      'Feel the energy building up',
      'Use when you need a quick boost'
    ];
  }

  getColorScheme() {
    return {
      primary: '#DC2626',
      secondary: '#F59E0B',
      accent: '#10B981',
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
    const targetInhale = 1.4; // Larger for energy
    const targetExhale = 0.8; // Smaller for energy release
    
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
