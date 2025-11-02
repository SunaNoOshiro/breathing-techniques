/**
 * AudioService Tests
 * Tests for the AudioService class
 */

import { AudioService } from '../../services/AudioService.js';
import { TestUtils, TestAssertions } from '../TestUtils.js';

describe('AudioService', () => {
  let audioService;
  let mockAudioContext;
  let mockOscillator;
  let mockGainNode;

  beforeEach(() => {
    // Mock Web Audio API
    mockOscillator = {
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      frequency: { value: 440 },
      type: 'sine'
    };

    mockGainNode = {
      connect: jest.fn(),
      gain: { value: 0.5 }
    };

    mockAudioContext = {
      createOscillator: jest.fn(() => mockOscillator),
      createGain: jest.fn(() => mockGainNode),
      destination: {},
      state: 'running',
      resume: jest.fn()
    };

    global.AudioContext = jest.fn(() => mockAudioContext);
    global.webkitAudioContext = jest.fn(() => mockAudioContext);

    audioService = new AudioService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    test('should initialize with default settings', () => {
      expect(audioService.isEnabled()).toBe(true);
      expect(audioService.getVolume()).toBe(0.7);
    });

    test('should create audio context on initialization', () => {
      expect(mockAudioContext).toBeDefined();
    });
  });

  describe('playSound', () => {
    test('should play beep sound when enabled', async () => {
      await audioService.playSound('beep', { frequency: 800, duration: 0.1 });

      expect(mockOscillator.connect).toHaveBeenCalled();
      expect(mockOscillator.start).toHaveBeenCalled();
      expect(mockOscillator.stop).toHaveBeenCalled();
    });

    test('should not play sound when disabled', async () => {
      audioService.setEnabled(false);
      
      await audioService.playSound('beep', { frequency: 800, duration: 0.1 });

      expect(mockOscillator.start).not.toHaveBeenCalled();
    });

    test('should handle audio context suspension', async () => {
      mockAudioContext.state = 'suspended';
      
      await audioService.playSound('beep', { frequency: 800, duration: 0.1 });

      expect(mockAudioContext.resume).toHaveBeenCalled();
    });
  });

  describe('volume control', () => {
    test('should set volume correctly', () => {
      audioService.setVolume(0.5);
      expect(audioService.getVolume()).toBe(0.5);
    });

    test('should clamp volume to valid range', () => {
      audioService.setVolume(1.5);
      expect(audioService.getVolume()).toBe(1.0);

      audioService.setVolume(-0.5);
      expect(audioService.getVolume()).toBe(0.0);
    });
  });

  describe('enable/disable', () => {
    test('should enable and disable audio', () => {
      audioService.setEnabled(false);
      expect(audioService.isEnabled()).toBe(false);

      audioService.setEnabled(true);
      expect(audioService.isEnabled()).toBe(true);
    });
  });

  describe('error handling', () => {
    test('should handle audio context creation failure', () => {
      global.AudioContext = jest.fn(() => {
        throw new Error('Audio context creation failed');
      });

      expect(() => new AudioService()).not.toThrow();
    });

    test('should handle oscillator creation failure', async () => {
      mockAudioContext.createOscillator = jest.fn(() => {
        throw new Error('Oscillator creation failed');
      });

      await expect(audioService.playSound('beep')).rejects.toThrow();
    });
  });
});
