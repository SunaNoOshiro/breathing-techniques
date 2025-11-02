import { BaseTechnique } from './BaseTechnique.js';

/**
 * Box Breathing 4-4-4-4 Technique
 * Classic square breathing pattern for stress reduction and focus
 */
export class BoxBreathingTechnique extends BaseTechnique {
  constructor() {
    super({
      id: 'box4',
      name: 'Box Breathing 4-4-4-4',
      description: 'Classic square breathing technique',
      benefits: 'Reduces stress, improves focus, balances nervous system',
      phases: [
        { key: 'inhale', name: 'Inhale' },
        { key: 'hold1', name: 'Hold' },
        { key: 'exhale', name: 'Exhale' },
        { key: 'hold2', name: 'Hold' },
      ],
      durationsSec: [4, 4, 4, 4],
      pattern: '4-4-4-4',
    });
  }

  getInstructions() {
    return [
      'Breathe in slowly for 4 seconds',
      'Hold your breath for 4 seconds',
      'Exhale slowly for 4 seconds',
      'Hold empty for 4 seconds',
      'Repeat the cycle'
    ];
  }

  getColorScheme() {
    return {
      primary: '#60A5FA',
      secondary: '#34D399',
      accent: '#F59E0B',
      background: '#0b1020',
      panel: '#0f172a',
      text: '#e5e7eb'
    };
  }
}
