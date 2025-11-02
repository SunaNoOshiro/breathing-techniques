/**
 * Audio Enabled Mixin
 * Provides audio functionality for techniques that support custom audio
 * Implements IAudioEnabled interface
 */

import { IAudioEnabled } from '../interfaces/ITechnique.js';

export class AudioEnabledMixin extends IAudioEnabled {
  constructor() {
    super();
  }

  /**
   * Get audio configuration for technique
   * @returns {object} - Audio configuration
   */
  getAudioConfig() {
    return {
      enabled: true,
      volume: 0.7,
      beepFrequency: 800,
      customTones: false,
      phaseTransitions: true
    };
  }

  /**
   * Get phase-specific audio settings
   * @param {string} phaseKey - Phase key
   * @returns {object} - Phase audio settings
   */
  getPhaseAudio(phaseKey) {
    const baseConfig = this.getAudioConfig();
    
    const phaseSettings = {
      inhale: {
        frequency: 600,
        duration: 0.1,
        volume: baseConfig.volume,
        type: 'beep'
      },
      hold: {
        frequency: 800,
        duration: 0.05,
        volume: baseConfig.volume * 0.8,
        type: 'beep'
      },
      exhale: {
        frequency: 400,
        duration: 0.15,
        volume: baseConfig.volume,
        type: 'beep'
      },
      pause: {
        frequency: 200,
        duration: 0.05,
        volume: baseConfig.volume * 0.5,
        type: 'beep'
      }
    };
    
    return phaseSettings[phaseKey] || phaseSettings.inhale;
  }

  /**
   * Get custom audio tones for technique
   * @returns {object} - Custom tones configuration
   */
  getCustomTones() {
    return {
      inhale: {
        frequency: 440, // A4 note
        duration: 0.2,
        type: 'tone'
      },
      exhale: {
        frequency: 330, // E4 note
        duration: 0.3,
        type: 'tone'
      }
    };
  }
}
