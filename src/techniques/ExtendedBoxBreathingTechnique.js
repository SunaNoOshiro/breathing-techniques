import { BaseTechnique } from './BaseTechnique.js';

/**
 * Extended Box Breathing 6-6-6-6 Technique
 * Longer box breathing for deep focus and meditation
 */
export class ExtendedBoxBreathingTechnique extends BaseTechnique {
  constructor() {
    super({
      id: '4444-extended',
      name: 'Extended Box 6-6-6-6',
      description: 'Longer box breathing for deep focus',
      benefits: 'Deep focus, meditation preparation, advanced relaxation',
      phases: [
        { key: 'inhale', name: 'Inhale' },
        { key: 'hold1', name: 'Hold' },
        { key: 'exhale', name: 'Exhale' },
        { key: 'hold2', name: 'Hold' },
      ],
      durationsSec: [6, 6, 6, 6],
      pattern: '6-6-6-6',
    });
  }

  getInstructions() {
    return [
      'Advanced box breathing technique',
      'Inhale slowly for 6 seconds',
      'Hold your breath for 6 seconds',
      'Exhale slowly for 6 seconds',
      'Hold empty for 6 seconds',
      'Perfect for deep meditation'
    ];
  }

  getColorScheme() {
    return {
      primary: '#7C2D12',
      secondary: '#059669',
      accent: '#7C3AED',
      background: '#0b1020',
      panel: '#0f172a',
      text: '#e5e7eb'
    };
  }
}
