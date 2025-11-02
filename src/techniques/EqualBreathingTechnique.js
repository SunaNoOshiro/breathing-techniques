import { BaseTechnique } from './BaseTechnique.js';

/**
 * Equal Breathing 5-5-5 Technique
 * Balanced breathing pattern for focus and stress reduction
 */
export class EqualBreathingTechnique extends BaseTechnique {
  constructor() {
    super({
      id: '555',
      name: 'Equal Breathing 5-5-5',
      description: 'Balanced breathing pattern',
      benefits: 'Improves focus, reduces stress, easy to maintain',
      phases: [
        { key: 'inhale', name: 'Inhale' },
        { key: 'hold1', name: 'Hold' },
        { key: 'exhale', name: 'Exhale' },
      ],
      durationsSec: [5, 5, 5],
      pattern: '5-5-5',
    });
  }

  getInstructions() {
    return [
      'Equal timing for all phases',
      'Inhale slowly for 5 seconds',
      'Hold your breath for 5 seconds',
      'Exhale slowly for 5 seconds',
      'Maintain steady rhythm',
      'Great for meditation and focus'
    ];
  }

  getColorScheme() {
    return {
      primary: '#059669',
      secondary: '#0891B2',
      accent: '#DC2626',
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
}
