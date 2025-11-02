import { BaseTechnique } from './BaseTechnique.js';

/**
 * 4-7-8 Breathing Technique
 * Calming technique for relaxation and sleep preparation
 */
export class FourSevenEightTechnique extends BaseTechnique {
  constructor() {
    super({
      id: '478',
      name: '4-7-8 Breathing',
      description: 'Calming technique for relaxation',
      benefits: 'Promotes sleep, reduces anxiety, activates parasympathetic nervous system',
      phases: [
        { key: 'inhale', name: 'Inhale' },
        { key: 'hold1', name: 'Hold' },
        { key: 'exhale', name: 'Exhale' },
      ],
      durationsSec: [4, 7, 8],
      pattern: '4-7-8',
    });
  }

  getInstructions() {
    return [
      'Place the tip of your tongue behind your upper front teeth',
      'Exhale completely through your mouth',
      'Close your mouth and inhale through your nose for 4 seconds',
      'Hold your breath for 7 seconds',
      'Exhale through your mouth for 8 seconds',
      'Repeat 3-4 times'
    ];
  }

  getColorScheme() {
    return {
      primary: '#8B5CF6',
      secondary: '#34D399',
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
