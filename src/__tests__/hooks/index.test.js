import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  useAccessibility,
  useAudio,
  useBreathingSession,
  useResponsive,
  useTechnique,
  useThemeManager,
  useVibration
} from '../../hooks/index.js';
import { TestUtils } from '../TestUtils.js';

const hookMocks = vi.hoisted(() => ({
  services: {},
  breathing: {},
  theme: {}
}));

vi.mock('../../contexts/ServicesContext.jsx', () => ({
  useServices: () => hookMocks.services
}));

vi.mock('../../contexts/BreathingContext.jsx', () => ({
  useBreathing: () => hookMocks.breathing
}));

vi.mock('../../contexts/ThemeContext.jsx', () => ({
  useTheme: () => hookMocks.theme
}));

describe('custom hooks', () => {
  beforeEach(() => {
    const technique = TestUtils.createMockTechnique({ id: 'box4', name: 'Box Breathing' });

    hookMocks.breathing = {
      sessionState: {
        subscribe: vi.fn(() => vi.fn())
      },
      isSessionRunning: vi.fn(() => false),
      isSessionPaused: vi.fn(() => false),
      isSessionActive: vi.fn(() => false),
      getCurrentPhase: vi.fn(() => technique.getCurrentPhase(0)),
      getSessionStats: vi.fn(() => ({ cyclesCompleted: 0 })),
      getSessionProgress: vi.fn(() => 0),
      getCycleProgress: vi.fn(() => 0),
      startSession: vi.fn(),
      pauseSession: vi.fn(),
      resumeSession: vi.fn(),
      stopSession: vi.fn(),
      resetSession: vi.fn(),
      changeTechnique: vi.fn(),
      undo: vi.fn(),
      redo: vi.fn(),
      canUndo: vi.fn(() => false),
      canRedo: vi.fn(() => false),
      getCommandHistory: vi.fn(() => [])
    };

    hookMocks.services = {
      sessionState: {
        state: { technique },
        subscribe: vi.fn(() => vi.fn())
      },
      visualizationStrategyManager: {
        generatePoints: vi.fn(() => [{ x: 0, y: 0 }])
      },
      preferencesState: {
        getSelectedTechniqueId: vi.fn(() => 'box4')
      },
      audioService: {
        getEnabled: vi.fn(() => true),
        getVolume: vi.fn(() => 0.4),
        playBeep: vi.fn(async () => undefined),
        stopAll: vi.fn(),
        setEnabled: vi.fn(),
        setVolume: vi.fn(),
        getCapabilities: vi.fn(() => ({ supported: true }))
      },
      vibrationService: {
        getEnabled: vi.fn(() => true),
        getSupported: vi.fn(() => true),
        vibrate: vi.fn(async () => undefined),
        stop: vi.fn(),
        setEnabled: vi.fn(),
        getCapabilities: vi.fn(() => ({ supported: true }))
      }
    };

    hookMocks.theme = {
      getCurrentTheme: vi.fn(() => 'dark'),
      getCurrentThemeColors: vi.fn(() => ({
        bg: '#0b1020',
        panel: '#0f172a',
        text: '#e5e7eb',
        accent: '#60A5FA',
        border: '#374151'
      })),
      isLoading: false,
      error: null,
      changeTheme: vi.fn(),
      setTheme: vi.fn(),
      resetTheme: vi.fn(),
      getAllThemes: vi.fn(() => [{ key: 'dark', name: 'Dark' }]),
      getThemeNames: vi.fn(() => [{ key: 'dark', name: 'Dark' }]),
      validateTheme: vi.fn(() => true),
      getThemeCapabilities: vi.fn(() => ({ availableThemes: 1 }))
    };

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1280
    });
  });

  test('useBreathingSession exposes session state and actions', () => {
    const { result } = renderHook(() => useBreathingSession());

    expect(result.current.isRunning).toBe(false);
    expect(result.current.currentPhase).toMatchObject({ key: 'inhale' });

    act(() => {
      result.current.start();
    });

    expect(hookMocks.breathing.startSession).toHaveBeenCalled();
  });

  test('useTechnique resolves the current technique and visualization points', async () => {
    const { result } = renderHook(() => useTechnique());

    await waitFor(() => {
      expect(result.current.currentTechnique?.getId()).toBe('box4');
    });

    expect(result.current.getTechniqueName()).toBe('Box Breathing');
    expect(result.current.visualizationPoints).toEqual([{ x: 0, y: 0 }]);
  });

  test('useThemeManager returns current theme data', () => {
    const { result } = renderHook(() => useThemeManager());

    expect(result.current.currentTheme).toBe('dark');
    expect(result.current.currentColors).toMatchObject({
      accent: '#60A5FA'
    });
  });

  test('useResponsive derives desktop breakpoints from window width', () => {
    const { result } = renderHook(() => useResponsive());

    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isMobile).toBe(false);
  });

  test('useAudio bridges to the audio service', async () => {
    const { result } = renderHook(() => useAudio());

    await waitFor(() => {
      expect(result.current.volume).toBe(0.4);
    });

    await act(async () => {
      await result.current.playSound('beep', { frequency: 660, duration: 120 });
    });

    expect(hookMocks.services.audioService.playBeep).toHaveBeenCalledWith(660, 120, null);

    act(() => {
      result.current.stopSound();
    });

    expect(hookMocks.services.audioService.stopAll).toHaveBeenCalled();
  });

  test('useVibration bridges to the vibration service', async () => {
    const { result } = renderHook(() => useVibration());

    await waitFor(() => {
      expect(result.current.isSupported).toBe(true);
    });

    await act(async () => {
      await result.current.vibrate([200, 100, 200]);
    });

    expect(hookMocks.services.vibrationService.vibrate).toHaveBeenCalledWith([200, 100, 200]);

    act(() => {
      result.current.stopVibration();
    });

    expect(hookMocks.services.vibrationService.stop).toHaveBeenCalled();
  });

  test('useAccessibility announces messages through a live region', () => {
    const { result } = renderHook(() => useAccessibility());

    act(() => {
      result.current.announce('Test message');
    });

    expect(document.getElementById('live-region')).toHaveTextContent('Test message');
  });
});
