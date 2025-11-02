/**
 * Hook Tests
 * Tests for custom hooks
 */

import { renderHook, act } from '@testing-library/react';
import { TestUtils } from '../TestUtils.js';

// Mock the contexts
jest.mock('../../contexts/ServicesContext.jsx', () => ({
  useServices: () => TestUtils.createMockServices()
}));

jest.mock('../../contexts/ThemeContext.jsx', () => ({
  useThemeColors: () => TestUtils.createMockTheme().colors
}));

jest.mock('../../contexts/LocalizationContext.jsx', () => ({
  useLocalization: () => ({
    t: (key) => key,
    currentLanguage: 'en',
    changeLanguage: jest.fn(),
    availableLanguages: [{ code: 'en', name: 'English' }]
  })
}));

jest.mock('../../contexts/BreathingContext.jsx', () => ({
  useBreathing: () => ({
    isSessionRunning: () => false,
    isSessionPaused: () => false,
    isSessionActive: () => false,
    getCurrentPhase: () => null,
    getSessionStats: () => ({}),
    getSessionProgress: () => 0,
    getCycleProgress: () => 0,
    startSession: jest.fn(),
    pauseSession: jest.fn(),
    resumeSession: jest.fn(),
    stopSession: jest.fn(),
    resetSession: jest.fn(),
    changeTechnique: jest.fn(),
    undo: jest.fn(),
    redo: jest.fn(),
    canUndo: () => false,
    canRedo: () => false,
    getCommandHistory: () => []
  })
}));

describe('Hook Tests', () => {
  describe('useBreathingSession', () => {
    let useBreathingSession;

    beforeEach(async () => {
      const module = await import('../../hooks/index.js');
      useBreathingSession = module.useBreathingSession;
    });

    test('should return breathing session state and actions', () => {
      const { result } = renderHook(() => useBreathingSession());
      
      expect(result.current).toBeDefined();
      expect(typeof result.current.isRunning).toBe('boolean');
      expect(typeof result.current.isPaused).toBe('boolean');
      expect(typeof result.current.start).toBe('function');
      expect(typeof result.current.pause).toBe('function');
      expect(typeof result.current.stop).toBe('function');
    });

    test('should provide session statistics', () => {
      const { result } = renderHook(() => useBreathingSession());
      
      expect(result.current.sessionStats).toBeDefined();
      expect(result.current.progress).toBeDefined();
      expect(result.current.cycleProgress).toBeDefined();
    });
  });

  describe('useTechnique', () => {
    let useTechnique;

    beforeEach(async () => {
      const module = await import('../../hooks/index.js');
      useTechnique = module.useTechnique;
    });

    test('should return technique state and actions', () => {
      const { result } = renderHook(() => useTechnique());
      
      expect(result.current).toBeDefined();
      expect(typeof result.current.getCurrentTechnique).toBe('function');
      expect(typeof result.current.getTechniqueId).toBe('function');
      expect(typeof result.current.getTechniqueName).toBe('function');
      expect(typeof result.current.validateTechnique).toBe('function');
    });

    test('should handle missing technique gracefully', () => {
      const { result } = renderHook(() => useTechnique());
      
      expect(result.current.currentTechnique).toBeNull();
      expect(result.current.getTechniqueId()).toBeNull();
      expect(result.current.getTechniqueName()).toBe('');
    });
  });

  describe('useTheme', () => {
    let useTheme;

    beforeEach(async () => {
      const module = await import('../../hooks/index.js');
      useTheme = module.useTheme;
    });

    test('should return theme state and actions', () => {
      const { result } = renderHook(() => useTheme());
      
      expect(result.current).toBeDefined();
      expect(typeof result.current.getCurrentTheme).toBe('function');
      expect(typeof result.current.setTheme).toBe('function');
      expect(typeof result.current.getAvailableThemes).toBe('function');
    });

    test('should provide theme colors', () => {
      const { result } = renderHook(() => useTheme());
      
      expect(result.current.currentColors).toBeDefined();
      expect(result.current.currentColors.primary).toBeDefined();
      expect(result.current.currentColors.background).toBeDefined();
    });
  });

  describe('useResponsive', () => {
    let useResponsive;

    beforeEach(async () => {
      const module = await import('../../hooks/index.js');
      useResponsive = module.useResponsive;
    });

    test('should return responsive breakpoint information', () => {
      const { result } = renderHook(() => useResponsive());
      
      expect(result.current).toBeDefined();
      expect(typeof result.current.isMobile).toBe('boolean');
      expect(typeof result.current.isTablet).toBe('boolean');
      expect(typeof result.current.isDesktop).toBe('boolean');
    });

    test('should detect screen size correctly', () => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      const { result } = renderHook(() => useResponsive());
      
      expect(result.current.isDesktop).toBe(true);
      expect(result.current.isMobile).toBe(false);
    });
  });

  describe('useAudio', () => {
    let useAudio;

    beforeEach(async () => {
      const module = await import('../../hooks/index.js');
      useAudio = module.useAudio;
    });

    test('should return audio state and actions', () => {
      const { result } = renderHook(() => useAudio());
      
      expect(result.current).toBeDefined();
      expect(typeof result.current.isEnabled).toBe('boolean');
      expect(typeof result.current.volume).toBe('number');
      expect(typeof result.current.playSound).toBe('function');
      expect(typeof result.current.setAudioEnabled).toBe('function');
    });

    test('should handle audio playback', async () => {
      const { result } = renderHook(() => useAudio());
      
      await act(async () => {
        await result.current.playSound('beep');
      });
      
      expect(result.current.isPlaying).toBe(false); // Should reset after playback
    });
  });

  describe('useVibration', () => {
    let useVibration;

    beforeEach(async () => {
      const module = await import('../../hooks/index.js');
      useVibration = module.useVibration;
    });

    test('should return vibration state and actions', () => {
      const { result } = renderHook(() => useVibration());
      
      expect(result.current).toBeDefined();
      expect(typeof result.current.isEnabled).toBe('boolean');
      expect(typeof result.current.isSupported).toBe('boolean');
      expect(typeof result.current.vibrate).toBe('function');
      expect(typeof result.current.setVibrationEnabled).toBe('function');
    });

    test('should handle vibration patterns', async () => {
      const { result } = renderHook(() => useVibration());
      
      await act(async () => {
        await result.current.vibrate([200, 100, 200]);
      });
      
      expect(result.current.isVibrating).toBe(false); // Should reset after vibration
    });
  });

  describe('useAccessibility', () => {
    let useAccessibility;

    beforeEach(async () => {
      const module = await import('../../hooks/index.js');
      useAccessibility = module.useAccessibility;
    });

    test('should return accessibility preferences', () => {
      const { result } = renderHook(() => useAccessibility());
      
      expect(result.current).toBeDefined();
      expect(typeof result.current.prefersReducedMotion).toBe('boolean');
      expect(typeof result.current.prefersHighContrast).toBe('boolean');
      expect(typeof result.current.prefersColorScheme).toBe('string');
    });

    test('should provide accessibility actions', () => {
      const { result } = renderHook(() => useAccessibility());
      
      expect(typeof result.current.announce).toBe('function');
      expect(typeof result.current.focusElement).toBe('function');
      expect(typeof result.current.trapFocus).toBe('function');
    });

    test('should announce messages to screen readers', () => {
      const { result } = renderHook(() => useAccessibility());
      
      act(() => {
        result.current.announce('Test message');
      });
      
      // Check if live region was created
      const liveRegion = document.getElementById('live-region');
      expect(liveRegion).toBeDefined();
      expect(liveRegion.textContent).toBe('Test message');
    });
  });

  describe('useErrorHandler', () => {
    let useErrorHandler;

    beforeEach(async () => {
      const module = await import('../../hooks/index.js');
      useErrorHandler = module.useErrorHandler;
    });

    test('should return error handling utilities', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      expect(result.current).toBeDefined();
      expect(typeof result.current.handleError).toBe('function');
      expect(typeof result.current.addErrorListener).toBe('function');
      expect(typeof result.current.removeErrorListener).toBe('function');
      expect(typeof result.current.getErrorHistory).toBe('function');
    });

    test('should handle errors gracefully', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      const error = new Error('Test error');
      
      act(() => {
        result.current.handleError(error);
      });
      
      // Should not throw
      expect(true).toBe(true);
    });
  });
});

