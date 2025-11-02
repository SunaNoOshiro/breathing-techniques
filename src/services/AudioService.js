/**
 * Audio Service
 * Handles audio playback and management following Single Responsibility Principle
 */

import { ServiceError, ERROR_CODES } from '../errors/AppError.js';
import { errorHandler } from '../errors/ErrorHandler.js';

/**
 * Audio Service class
 * Manages Web Audio API context and audio playback
 */
export class AudioService {
  constructor() {
    this.audioContext = null;
    this.isEnabled = true;
    this.volume = 0.25;
    this.isInitialized = false;
    this.gainNode = null;
    this.isPlaying = false;
  }

  /**
   * Initialize audio context
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create gain node for volume control
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = this.volume;

      this.isInitialized = true;
    } catch (error) {
      throw new ServiceError(
        'Failed to initialize audio context',
        'AudioService',
        { originalError: error.message }
      );
    }
  }

  /**
   * Ensure audio context is initialized and resumed
   * @returns {AudioContext|null} - Audio context or null if failed
   */
  ensureAudioContext() {
    if (!this.isInitialized) {
      this.initialize().catch(error => {
        errorHandler.handleError(error);
      });
      return null;
    }

    // Resume context if suspended
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume().catch(error => {
        errorHandler.handleError(
          new ServiceError(
            'Failed to resume audio context',
            'AudioService',
            { originalError: error.message }
          )
        );
      });
    }

    return this.audioContext;
  }

  /**
   * Set audio enabled state
   * @param {boolean} enabled - Whether audio is enabled
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  /**
   * Get audio enabled state
   * @returns {boolean} - Whether audio is enabled
   */
  getEnabled() {
    return this.isEnabled;
  }

  /**
   * Set audio volume
   * @param {number} volume - Volume level (0-1)
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    
    if (this.gainNode) {
      this.gainNode.gain.value = this.volume;
    }
  }

  /**
   * Get audio volume
   * @returns {number} - Current volume level
   */
  getVolume() {
    return this.volume;
  }

  /**
   * Play a beep sound
   * @param {number} frequency - Frequency in Hz
   * @param {number} duration - Duration in milliseconds
   * @param {number} volume - Volume override (optional)
   * @returns {Promise<void>}
   */
  async playBeep(frequency = 520, duration = 100, volume = null) {
    if (!this.isEnabled) return;

    const context = this.ensureAudioContext();
    if (!context) return;

    try {
      const osc = context.createOscillator();
      const gain = context.createGain();
      const currentTime = context.currentTime;
      const volumeLevel = volume !== null ? volume : this.volume;

      // Set up gain envelope
      gain.gain.setValueAtTime(0, currentTime);
      gain.gain.linearRampToValueAtTime(volumeLevel, currentTime + 0.02);
      gain.gain.linearRampToValueAtTime(0.0001, currentTime + duration / 1000);

      // Set up oscillator
      osc.type = 'sine';
      osc.frequency.value = frequency;

      // Connect nodes
      osc.connect(gain).connect(context.destination);

      // Start and stop oscillator
      osc.start(currentTime);
      osc.stop(currentTime + duration / 1000);

      this.isPlaying = true;

      // Reset playing state after duration
      setTimeout(() => {
        this.isPlaying = false;
      }, duration);

    } catch (error) {
      throw new ServiceError(
        'Failed to play beep',
        'AudioService',
        { 
          frequency, 
          duration, 
          volume, 
          originalError: error.message 
        }
      );
    }
  }

  /**
   * Play a tone with custom envelope
   * @param {object} config - Tone configuration
   * @returns {Promise<void>}
   */
  async playTone(config) {
    if (!this.isEnabled) return;

    const context = this.ensureAudioContext();
    if (!context) return;

    const {
      frequency = 440,
      duration = 1000,
      type = 'sine',
      attack = 0.02,
      decay = 0.1,
      sustain = 0.7,
      release = 0.3,
      volume = null
    } = config;

    try {
      const osc = context.createOscillator();
      const gain = context.createGain();
      const currentTime = context.currentTime;
      const volumeLevel = volume !== null ? volume : this.volume;

      // Set up oscillator
      osc.type = type;
      osc.frequency.value = frequency;

      // Set up ADSR envelope
      const totalDuration = duration / 1000;
      const attackTime = attack;
      const decayTime = attackTime + decay;
      const releaseTime = totalDuration - release;

      gain.gain.setValueAtTime(0, currentTime);
      gain.gain.linearRampToValueAtTime(volumeLevel, currentTime + attackTime);
      gain.gain.linearRampToValueAtTime(volumeLevel * sustain, currentTime + decayTime);
      gain.gain.setValueAtTime(volumeLevel * sustain, currentTime + releaseTime);
      gain.gain.linearRampToValueAtTime(0, currentTime + totalDuration);

      // Connect nodes
      osc.connect(gain).connect(context.destination);

      // Start and stop oscillator
      osc.start(currentTime);
      osc.stop(currentTime + totalDuration);

      this.isPlaying = true;

      // Reset playing state after duration
      setTimeout(() => {
        this.isPlaying = false;
      }, duration);

    } catch (error) {
      throw new ServiceError(
        'Failed to play tone',
        'AudioService',
        { 
          config, 
          originalError: error.message 
        }
      );
    }
  }

  /**
   * Stop all audio playback
   */
  stopAll() {
    if (this.audioContext) {
      // Close and recreate context to stop all sounds
      this.audioContext.close();
      this.audioContext = null;
      this.isInitialized = false;
      this.isPlaying = false;
    }
  }

  /**
   * Check if audio is currently playing
   * @returns {boolean} - True if playing
   */
  isCurrentlyPlaying() {
    return this.isPlaying;
  }

  /**
   * Get audio context state
   * @returns {string} - Audio context state
   */
  getContextState() {
    return this.audioContext?.state || 'closed';
  }

  /**
   * Check if audio is supported
   * @returns {boolean} - True if audio is supported
   */
  isSupported() {
    return !!(window.AudioContext || window.webkitAudioContext);
  }

  /**
   * Get audio capabilities
   * @returns {object} - Audio capabilities
   */
  getCapabilities() {
    return {
      supported: this.isSupported(),
      initialized: this.isInitialized,
      enabled: this.isEnabled,
      volume: this.volume,
      contextState: this.getContextState(),
      isPlaying: this.isPlaying
    };
  }

  /**
   * Dispose of audio service
   */
  dispose() {
    this.stopAll();
    this.isEnabled = false;
    this.volume = 0;
  }
}
