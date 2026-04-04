/**
 * Testing Infrastructure
 * Provides utilities and setup for comprehensive testing
 */

import { vi } from 'vitest';

/**
 * Test utilities for mocking and testing
 */
export class TestUtils {
  /**
   * Create a mock technique
   * @param {object} overrides - Override default values
   * @returns {object} - Mock technique
   */
  static createMockTechnique(overrides = {}) {
    const technique = {
      id: 'test-technique',
      name: 'Test Technique',
      description: 'A test breathing technique',
      benefits: 'Reduces stress and anxiety',
      phases: [
        { key: 'inhale', name: 'Inhale', duration: 4 },
        { key: 'hold', name: 'Hold', duration: 4 },
        { key: 'exhale', name: 'Exhale', duration: 4 }
      ],
      durationsSec: [4, 4, 4],
      pattern: '4-4-4',
      getId() {
        return this.id;
      },
      getName() {
        return this.name;
      },
      getDescription() {
        return this.description;
      },
      getBenefits() {
        return this.benefits;
      },
      getPattern() {
        return this.pattern;
      },
      getPhases() {
        return this.phases;
      },
      getDurationsSec() {
        return this.durationsSec;
      },
      getTotalDuration() {
        return this.durationsSec.reduce((sum, duration) => sum + duration, 0);
      },
      getCurrentPhase(elapsedSeconds) {
        const phases = this.getPhases();
        const durations = this.getDurationsSec();
        const totalDuration = this.getTotalDuration();
        const normalizedTime = ((elapsedSeconds % totalDuration) + totalDuration) % totalDuration;

        let runningTotal = 0;
        for (let index = 0; index < phases.length; index += 1) {
          const duration = durations[index];
          if (normalizedTime < runningTotal + duration) {
            const timeInPhase = normalizedTime - runningTotal;
            return {
              phaseIndex: index,
              phase: phases[index],
              key: phases[index].key,
              duration,
              timeInPhase,
              timeLeft: duration - timeInPhase
            };
          }
          runningTotal += duration;
        }

        return null;
      },
      validate() {
        return true;
      }
    };

    return {
      ...technique,
      ...overrides
    };
  }

  /**
   * Create a mock theme
   * @param {object} overrides - Override default values
   * @returns {object} - Mock theme
   */
  static createMockTheme(overrides = {}) {
    return {
      key: 'test-theme',
      id: 'test-theme',
      name: 'Test Theme',
      colors: {
        bg: '#ffffff',
        panel: '#f8f9fa',
        accent: '#007bff',
        border: '#dee2e6',
        primary: '#007bff',
        secondary: '#6c757d',
        background: '#ffffff',
        surface: '#f8f9fa',
        text: '#212529',
        textSecondary: '#6c757d',
        error: '#dc3545',
        success: '#28a745',
        warning: '#ffc107',
        info: '#17a2b8'
      },
      typography: {
        fontFamily: 'Inter, sans-serif',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem'
        }
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem'
      },
      ...overrides
    };
  }

  /**
   * Create a mock session state
   * @param {object} overrides - Override default values
   * @returns {object} - Mock session state
   */
  static createMockSessionState(overrides = {}) {
    return {
      isActive: false,
      isPaused: false,
      currentPhase: null,
      elapsedTime: 0,
      totalCycles: 0,
      currentTechnique: null,
      ...overrides
    };
  }

  /**
   * Create a mock user preferences
   * @param {object} overrides - Override default values
   * @returns {object} - Mock user preferences
   */
  static createMockPreferences(overrides = {}) {
    return {
      audioEnabled: true,
      vibrationEnabled: true,
      theme: 'default',
      language: 'en',
      ...overrides
    };
  }

  /**
   * Create a mock services object
   * @param {object} overrides - Override default values
   * @returns {object} - Mock services
   */
  static createMockServices(overrides = {}) {
    return {
      audioService: {
        getEnabled: vi.fn(() => true),
        getVolume: vi.fn(() => 0.25),
        playBeep: vi.fn(),
        stopAll: vi.fn(),
        setEnabled: vi.fn(),
        setVolume: vi.fn(),
        getCapabilities: vi.fn(() => ({ supported: true }))
      },
      vibrationService: {
        vibrate: vi.fn(),
        stop: vi.fn(),
        getSupported: vi.fn(() => true),
        getEnabled: vi.fn(() => true),
        setEnabled: vi.fn(),
        getCapabilities: vi.fn(() => ({ supported: true }))
      },
      themeService: {
        getCurrentTheme: vi.fn(() => 'dark'),
        getCurrentThemeColors: vi.fn(() => TestUtils.createMockTheme().colors),
        setCurrentTheme: vi.fn(),
        getAllThemes: vi.fn(() => [TestUtils.createMockTheme()])
      },
      storageService: {
        get: vi.fn(),
        set: vi.fn(),
        remove: vi.fn(),
        clear: vi.fn()
      },
      techniqueRegistry: {
        getTechnique: vi.fn(() => TestUtils.createMockTechnique()),
        getAllTechniques: vi.fn(() => [TestUtils.createMockTechnique()])
      },
      ...overrides
    };
  }

  /**
   * Wait for async operations to complete
   * @param {number} ms - Milliseconds to wait
   * @returns {Promise} - Promise that resolves after delay
   */
  static wait(ms = 0) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Mock localStorage
   * @returns {object} - Mock localStorage
   */
  static mockLocalStorage() {
    const store = {};
    return {
      getItem: vi.fn(key => store[key] || null),
      setItem: vi.fn((key, value) => { store[key] = value; }),
      removeItem: vi.fn(key => { delete store[key]; }),
      clear: vi.fn(() => { Object.keys(store).forEach(key => delete store[key]); }),
      length: Object.keys(store).length,
      key: vi.fn(index => Object.keys(store)[index] || null)
    };
  }

  /**
   * Mock window.matchMedia
   * @param {object} matches - Media query matches
   * @returns {object} - Mock matchMedia
   */
  static mockMatchMedia(matches = {}) {
    return vi.fn(query => ({
      matches: matches[query] || false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }));
  }

  /**
   * Mock Web Audio API
   * @returns {object} - Mock Web Audio API
   */
  static mockWebAudioAPI() {
    const mockAudioContext = {
      createOscillator: vi.fn(() => ({
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        frequency: { value: 440 }
      })),
      createGain: vi.fn(() => ({
        connect: vi.fn(),
        gain: { value: 0.5 }
      })),
      createAnalyser: vi.fn(() => ({
        connect: vi.fn(),
        frequencyBinCount: 256
      })),
      destination: {},
      state: 'running',
      resume: vi.fn()
    };

    return {
      AudioContext: vi.fn(() => mockAudioContext),
      webkitAudioContext: vi.fn(() => mockAudioContext)
    };
  }

  /**
   * Mock Vibration API
   * @returns {object} - Mock Vibration API
   */
  static mockVibrationAPI() {
    return {
      navigator: {
        vibrate: vi.fn()
      }
    };
  }

  /**
   * Create a test renderer
   * @param {React.Component} Component - Component to render
   * @param {object} props - Component props
   * @returns {object} - Test renderer
   */
  static createTestRenderer(Component, props = {}) {
    // This would integrate with React Testing Library
    return {
      Component,
      props,
      render: () => {
        // Mock render implementation
        return { container: document.createElement('div') };
      }
    };
  }
}

/**
 * Test data fixtures
 */
export const TestFixtures = {
  techniques: [
    TestUtils.createMockTechnique({
      id: 'box-breathing',
      name: 'Box Breathing',
      description: 'A simple 4-4-4-4 breathing pattern',
      pattern: '4-4-4-4'
    }),
    TestUtils.createMockTechnique({
      id: 'triangle-breathing',
      name: 'Triangle Breathing',
      description: 'A 4-4-4 breathing pattern',
      pattern: '4-4-4'
    })
  ],

  themes: [
    TestUtils.createMockTheme({
      id: 'default',
      name: 'Default Theme'
    }),
    TestUtils.createMockTheme({
      id: 'dark',
      name: 'Dark Theme',
      colors: {
        ...TestUtils.createMockTheme().colors,
        background: '#1a1a1a',
        surface: '#2d2d2d',
        text: '#ffffff'
      }
    })
  ],

  translations: {
    en: {
      'app.title': 'Breathing Techniques',
      'app.description': 'Practice mindful breathing',
      'technique.start': 'Start',
      'technique.pause': 'Pause',
      'technique.stop': 'Stop',
      'phase.inhale': 'Inhale',
      'phase.hold': 'Hold',
      'phase.exhale': 'Exhale',
      'phase.pause': 'Pause'
    },
    es: {
      'app.title': 'Técnicas de Respiración',
      'app.description': 'Practica la respiración consciente',
      'technique.start': 'Comenzar',
      'technique.pause': 'Pausar',
      'technique.stop': 'Detener',
      'phase.inhale': 'Inhalar',
      'phase.hold': 'Mantener',
      'phase.exhale': 'Exhalar',
      'phase.pause': 'Pausa'
    }
  }
};

/**
 * Test assertions utilities
 */
export class TestAssertions {
  /**
   * Assert that a technique is valid
   * @param {object} technique - Technique to validate
   */
  static assertValidTechnique(technique) {
    expect(technique).toBeDefined();
    expect(technique.id).toBeDefined();
    expect(technique.name).toBeDefined();
    expect(technique.description).toBeDefined();
    expect(technique.phases).toBeInstanceOf(Array);
    expect(technique.durationsSec).toBeInstanceOf(Array);
    expect(technique.phases.length).toBe(technique.durationsSec.length);
    expect(technique.getTotalDuration()).toBeGreaterThan(0);
  }

  /**
   * Assert that a theme is valid
   * @param {object} theme - Theme to validate
   */
  static assertValidTheme(theme) {
    expect(theme).toBeDefined();
    expect(theme.id || theme.key).toBeDefined();
    expect(theme.name).toBeDefined();
    expect(theme.colors).toBeDefined();
    expect(theme.colors.accent || theme.colors.primary).toBeDefined();
    expect(theme.colors.bg || theme.colors.background).toBeDefined();
    expect(theme.colors.text).toBeDefined();
  }

  /**
   * Assert that a session state is valid
   * @param {object} sessionState - Session state to validate
   */
  static assertValidSessionState(sessionState) {
    expect(sessionState).toBeDefined();
    expect(typeof sessionState.isActive).toBe('boolean');
    expect(typeof sessionState.isPaused).toBe('boolean');
    expect(typeof sessionState.elapsedTime).toBe('number');
    expect(typeof sessionState.totalCycles).toBe('number');
  }

  /**
   * Assert that a service method was called
   * @param {object} service - Service object
   * @param {string} method - Method name
   * @param {any} args - Expected arguments
   */
  static assertServiceMethodCalled(service, method, args = undefined) {
    expect(service[method]).toHaveBeenCalled();
    if (args !== undefined) {
      expect(service[method]).toHaveBeenCalledWith(args);
    }
  }
}

/**
 * Test environment setup
 */
export class TestEnvironment {
  static setup() {
    // Mock global objects
    global.localStorage = TestUtils.mockLocalStorage();
    global.matchMedia = TestUtils.mockMatchMedia();
    
    // Mock Web APIs
    Object.assign(global, TestUtils.mockWebAudioAPI());
    Object.assign(global, TestUtils.mockVibrationAPI());
    
    // Mock console methods for cleaner test output
    global.console = {
      ...console,
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    };
  }

  static teardown() {
    // Clean up mocks
    vi.clearAllMocks();
    vi.resetAllMocks();
  }
}
