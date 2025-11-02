import { BaseTechnique } from './BaseTechnique.js';

/**
 * Triangle Breathing 4-4-4 Technique
 * Simple three-phase breathing for beginners
 */
export class TriangleBreathingTechnique extends BaseTechnique {
  constructor() {
    super({
      id: 'triangle',
      name: 'Triangle Breathing 4-4-4',
      description: 'Simple three-phase breathing',
      benefits: 'Easy to learn, good for beginners, promotes calm',
      phases: [
        { key: 'inhale', name: 'Inhale' },
        { key: 'hold1', name: 'Hold' },
        { key: 'exhale', name: 'Exhale' },
      ],
      durationsSec: [4, 4, 4],
      pattern: '4-4-4',
    });
  }

  getInstructions() {
    return [
      'Perfect for beginners',
      'Inhale slowly for 4 seconds',
      'Hold your breath for 4 seconds',
      'Exhale slowly for 4 seconds',
      'No pause between cycles',
      'Focus on smooth, even breathing'
    ];
  }

  getColorScheme() {
    return {
      primary: '#06B6D4',
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

}
