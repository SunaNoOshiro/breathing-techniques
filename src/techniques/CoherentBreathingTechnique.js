import { BaseTechnique } from './BaseTechnique.js';

/**
 * Coherent Breathing 5-5 Technique
 * Simple two-phase breathing for heart coherence
 */
export class CoherentBreathingTechnique extends BaseTechnique {
  constructor() {
    super({
      id: 'coherent',
      name: 'Coherent Breathing 5-5',
      description: 'Simple two-phase breathing',
      benefits: 'Heart coherence, emotional balance, stress reduction',
      phases: [
        { key: 'inhale', name: 'Inhale' },
        { key: 'exhale', name: 'Exhale' },
      ],
      durationsSec: [5, 5],
      pattern: '5-5',
    });
  }

  getInstructions() {
    return [
      'Simple and effective breathing',
      'Inhale slowly for 5 seconds',
      'Exhale slowly for 5 seconds',
      'No holds - continuous flow',
      'Promotes heart coherence',
      'Great for emotional regulation'
    ];
  }

  getColorScheme() {
    return {
      primary: '#0891B2',
      secondary: '#059669',
      accent: '#DC2626',
      background: '#0b1020',
      panel: '#0f172a',
      text: '#e5e7eb'
    };
  }

  getPhaseColors(phaseKey) {
    // Зеленіє під час вдиху, червоніє перед вдихом
    // Для 2-фазної техніки: червоний → зелений → червоний
    const colors = {
      inhale: { from: '#F87171', to: '#34D399' },    // вдих: червоний → зелений (зеленіє!)
      exhale: { from: '#34D399', to: '#F87171' }     // видих: зелений → червоний (червоніє перед вдихом!)
    };
    return colors[phaseKey] || colors.inhale;
  }


  getLungScaling(phaseKey, timeInPhase, duration) {
    const targetInhale = 1.2;
    const targetExhale = 0.9;
    
    switch (phaseKey) {
      case 'inhale':
        const inhaleStep = (targetInhale - 1) / duration;
        return 1 + inhaleStep * Math.min(timeInPhase + 1, duration);
      case 'exhale':
        const exhaleStep = (targetInhale - targetExhale) / duration;
        return targetInhale - exhaleStep * Math.min(timeInPhase + 1, duration);
      default:
        return 1.0;
    }
  }
}
