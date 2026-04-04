import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { AudioService } from '../../services/AudioService.js';

describe('AudioService', () => {
  let audioService;
  let mockAudioContext;
  let mockOscillator;
  let mockGainNode;

  beforeEach(() => {
    mockGainNode = {
      connect: vi.fn(() => mockAudioContext.destination),
      gain: {
        value: 0.5,
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn()
      }
    };

    mockOscillator = {
      connect: vi.fn(() => mockGainNode),
      start: vi.fn(),
      stop: vi.fn(),
      frequency: { value: 440 },
      type: 'sine'
    };

    mockAudioContext = {
      currentTime: 0,
      createOscillator: vi.fn(() => mockOscillator),
      createGain: vi.fn(() => mockGainNode),
      destination: {},
      state: 'running',
      resume: vi.fn(async () => undefined),
      close: vi.fn()
    };

    const AudioContextMock = vi.fn(function AudioContextMock() {
      return mockAudioContext;
    });

    Object.defineProperty(window, 'AudioContext', {
      writable: true,
      value: AudioContextMock
    });

    Object.defineProperty(window, 'webkitAudioContext', {
      writable: true,
      value: AudioContextMock
    });

    audioService = new AudioService();
  });

  afterEach(() => {
    audioService.stopAll();
  });

  test('starts with default settings', () => {
    expect(audioService.getEnabled()).toBe(true);
    expect(audioService.getVolume()).toBe(0.25);
    expect(audioService.isSupported()).toBe(true);
  });

  test('initializes the audio context lazily', async () => {
    await audioService.initialize();

    expect(window.AudioContext).toHaveBeenCalled();
    expect(mockAudioContext.createGain).toHaveBeenCalled();
    expect(audioService.getCapabilities()).toMatchObject({
      initialized: true,
      enabled: true
    });
  });

  test('plays a beep when initialized and enabled', async () => {
    await audioService.initialize();
    await audioService.playBeep(800, 120);

    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    expect(mockOscillator.start).toHaveBeenCalled();
    expect(mockOscillator.stop).toHaveBeenCalled();
  });

  test('does not play audio when disabled', async () => {
    await audioService.initialize();
    audioService.setEnabled(false);

    await audioService.playBeep(800, 120);

    expect(mockOscillator.start).not.toHaveBeenCalled();
  });

  test('resumes the audio context when suspended', async () => {
    await audioService.initialize();
    mockAudioContext.state = 'suspended';

    await audioService.playBeep(640, 80);

    expect(mockAudioContext.resume).toHaveBeenCalled();
  });

  test('clamps volume updates to the valid range', () => {
    audioService.setVolume(2);
    expect(audioService.getVolume()).toBe(1);

    audioService.setVolume(-1);
    expect(audioService.getVolume()).toBe(0);
  });
});
