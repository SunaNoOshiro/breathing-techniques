/**
 * TimerService Tests
 * Tests for the TimerService class
 */

import { TimerService } from '../../services/TimerService.js';
import { TestUtils, TestAssertions } from '../TestUtils.js';

describe('TimerService', () => {
  let timerService;
  let mockTechnique;

  beforeEach(() => {
    mockTechnique = TestUtils.createMockTechnique();
    timerService = new TimerService();
  });

  afterEach(() => {
    timerService.stop();
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    test('should initialize with default state', () => {
      const state = timerService.getState();
      
      expect(state.isRunning).toBe(false);
      expect(state.isPaused).toBe(false);
      expect(state.currentTime).toBe(0);
      expect(state.currentPhase).toBeNull();
    });

    test('should set technique correctly', () => {
      timerService.setTechnique(mockTechnique);
      
      const state = timerService.getState();
      expect(state.technique).toBe(mockTechnique);
    });
  });

  describe('timer control', () => {
    beforeEach(() => {
      timerService.setTechnique(mockTechnique);
    });

    test('should start timer', async () => {
      const startPromise = timerService.start();
      
      expect(timerService.getState().isRunning).toBe(true);
      
      await startPromise;
    });

    test('should pause timer', () => {
      timerService.start();
      timerService.pause();
      
      const state = timerService.getState();
      expect(state.isRunning).toBe(false);
      expect(state.isPaused).toBe(true);
    });

    test('should resume timer', () => {
      timerService.start();
      timerService.pause();
      timerService.resume();
      
      const state = timerService.getState();
      expect(state.isRunning).toBe(true);
      expect(state.isPaused).toBe(false);
    });

    test('should stop timer', () => {
      timerService.start();
      timerService.stop();
      
      const state = timerService.getState();
      expect(state.isRunning).toBe(false);
      expect(state.isPaused).toBe(false);
      expect(state.currentTime).toBe(0);
    });

    test('should reset timer', () => {
      timerService.start();
      timerService.reset();
      
      const state = timerService.getState();
      expect(state.isRunning).toBe(false);
      expect(state.isPaused).toBe(false);
      expect(state.currentTime).toBe(0);
      expect(state.currentPhase).toBeNull();
    });
  });

  describe('phase management', () => {
    beforeEach(() => {
      timerService.setTechnique(mockTechnique);
    });

    test('should calculate current phase correctly', () => {
      timerService.setTechnique(mockTechnique);
      
      // Simulate time progression
      timerService.start();
      
      // Wait for phase calculation
      setTimeout(() => {
        const state = timerService.getState();
        expect(state.currentPhase).toBeDefined();
      }, 100);
    });

    test('should handle phase transitions', () => {
      const phaseListener = jest.fn();
      timerService.addListener('phaseChange', phaseListener);
      
      timerService.start();
      
      // Wait for potential phase change
      setTimeout(() => {
        expect(phaseListener).toHaveBeenCalled();
      }, 1000);
    });
  });

  describe('event listeners', () => {
    test('should add and remove listeners', () => {
      const listener = jest.fn();
      
      const unsubscribe = timerService.addListener('update', listener);
      expect(typeof unsubscribe).toBe('function');
      
      timerService.start();
      
      setTimeout(() => {
        expect(listener).toHaveBeenCalled();
        unsubscribe();
      }, 100);
    });

    test('should notify listeners on timer events', () => {
      const startListener = jest.fn();
      const pauseListener = jest.fn();
      const stopListener = jest.fn();
      
      timerService.addListener('start', startListener);
      timerService.addListener('pause', pauseListener);
      timerService.addListener('stop', stopListener);
      
      timerService.start();
      expect(startListener).toHaveBeenCalled();
      
      timerService.pause();
      expect(pauseListener).toHaveBeenCalled();
      
      timerService.stop();
      expect(stopListener).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    test('should handle invalid technique gracefully', () => {
      expect(() => timerService.setTechnique(null)).not.toThrow();
      expect(() => timerService.setTechnique({})).not.toThrow();
    });

    test('should handle timer errors gracefully', () => {
      // Mock technique with invalid durations
      const invalidTechnique = {
        ...mockTechnique,
        durationsSec: []
      };
      
      timerService.setTechnique(invalidTechnique);
      
      expect(() => timerService.start()).not.toThrow();
    });
  });

  describe('capabilities', () => {
    test('should report capabilities correctly', () => {
      const capabilities = timerService.getCapabilities();
      
      expect(capabilities).toBeDefined();
      expect(typeof capabilities.supportsPause).toBe('boolean');
      expect(typeof capabilities.supportsResume).toBe('boolean');
      expect(typeof capabilities.maxDuration).toBe('number');
    });
  });
});

