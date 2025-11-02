/**
 * Audio Enhanced Technique Decorator
 * Adds audio capabilities to any technique
 * Implements IAudioEnabled interface
 */

import { TechniqueDecorator } from './TechniqueDecorator.js';
import { IAudioEnabled } from '../techniques/interfaces/ITechnique.js';

export class AudioEnhancedTechnique extends TechniqueDecorator {
  constructor(technique, audioConfig = {}) {
    super(technique);
    this.audioConfig = {
      enabled: true,
      volume: 0.7,
      beepFrequency: 800,
      customTones: false,
      phaseTransitions: true,
      ...audioConfig
    };
  }

  /**
   * Get audio configuration for technique
   * @returns {object} - Audio configuration
   */
  getAudioConfig() {
    return { ...this.audioConfig };
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
        type: 'beep',
        pattern: 'single'
      },
      hold: {
        frequency: 800,
        duration: 0.05,
        volume: baseConfig.volume * 0.8,
        type: 'beep',
        pattern: 'single'
      },
      exhale: {
        frequency: 400,
        duration: 0.15,
        volume: baseConfig.volume,
        type: 'beep',
        pattern: 'single'
      },
      pause: {
        frequency: 200,
        duration: 0.05,
        volume: baseConfig.volume * 0.5,
        type: 'beep',
        pattern: 'single'
      }
    };
    
    return phaseSettings[phaseKey] || phaseSettings.inhale;
  }

  /**
   * Get custom audio tones for technique
   * @returns {object} - Custom tones configuration
   */
  getCustomTones() {
    if (!this.audioConfig.customTones) {
      return null;
    }

    return {
      inhale: {
        frequency: 440, // A4 note
        duration: 0.2,
        type: 'tone',
        envelope: {
          attack: 0.01,
          decay: 0.1,
          sustain: 0.7,
          release: 0.2
        }
      },
      exhale: {
        frequency: 330, // E4 note
        duration: 0.3,
        type: 'tone',
        envelope: {
          attack: 0.01,
          decay: 0.1,
          sustain: 0.7,
          release: 0.3
        }
      }
    };
  }

  /**
   * Get audio cues for phase transitions
   * @returns {object} - Transition audio cues
   */
  getTransitionAudio() {
    return {
      phaseStart: {
        frequency: 1000,
        duration: 0.05,
        volume: this.audioConfig.volume * 0.6,
        type: 'beep',
        pattern: 'single'
      },
      phaseEnd: {
        frequency: 500,
        duration: 0.05,
        volume: this.audioConfig.volume * 0.4,
        type: 'beep',
        pattern: 'single'
      },
      cycleComplete: {
        frequency: 1200,
        duration: 0.1,
        volume: this.audioConfig.volume * 0.8,
        type: 'beep',
        pattern: 'double'
      }
    };
  }

  /**
   * Update audio configuration
   * @param {object} config - New audio configuration
   */
  updateAudioConfig(config) {
    this.audioConfig = { ...this.audioConfig, ...config };
  }

  /**
   * Enable/disable audio
   * @param {boolean} enabled - Audio enabled state
   */
  setAudioEnabled(enabled) {
    this.audioConfig.enabled = enabled;
  }

  /**
   * Set audio volume
   * @param {number} volume - Volume level (0-1)
   */
  setVolume(volume) {
    this.audioConfig.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Check if audio is enabled
   * @returns {boolean} - Audio enabled state
   */
  isAudioEnabled() {
    return this.audioConfig.enabled;
  }
}
