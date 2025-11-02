/**
 * Testing Infrastructure
 * Provides utilities and setup for comprehensive testing
 */

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
    return {
      id: 'test-technique',
      name: 'Test Technique',
      description: 'A test breathing technique',
      benefits: 'Reduces stress and anxiety',
      phases: [
        { key: 'inhale', name: 'Inhale' },
        { key: 'hold', name: 'Hold' },
        { key: 'exhale', name: 'Exhale' }
      ],
      durationsSec: [4, 4, 4],
      pattern: '4-4-4',
      getTotalDuration: () => 12,
      getCurrentPhase: (elapsedSeconds) => ({
        key: 'inhale',
        name: 'Inhale',
        timeInPhase: elapsedSeconds % 4,
        duration: 4
      }),
      validate: () => true,
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
      id: 'test-theme',
      name: 'Test Theme',
      colors: {
        primary: '#007bff',
        secondary: '#6c757d',
        accent: '#28a745',
        background: '#ffffff',
        surface: '#f8f9fa',
        text: '#212529',
        textSecondary: '#6c757d',
        border: '#dee2e6',
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
        playSound: jest.fn(),
        stopSound: jest.fn(),
        setVolume: jest.fn(),
        isEnabled: () => true
      },
      vibrationService: {
        vibrate: jest.fn(),
        isSupported: () => true,
        isEnabled: () => true
      },
      themeService: {
        getCurrentTheme: () => TestUtils.createMockTheme(),
        setTheme: jest.fn(),
        getAvailableThemes: () => [TestUtils.createMockTheme()]
      },
      storageService: {
        get: jest.fn(),
        set: jest.fn(),
        remove: jest.fn(),
        clear: jest.fn()
      },
      techniqueRegistry: {
        getTechnique: jest.fn(() => TestUtils.createMockTechnique()),
        getAllTechniques: jest.fn(() => [TestUtils.createMockTechnique()])
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
      getItem: jest.fn(key => store[key] || null),
      setItem: jest.fn((key, value) => { store[key] = value; }),
      removeItem: jest.fn(key => { delete store[key]; }),
      clear: jest.fn(() => { Object.keys(store).forEach(key => delete store[key]); }),
      length: Object.keys(store).length,
      key: jest.fn(index => Object.keys(store)[index] || null)
    };
  }

  /**
   * Mock window.matchMedia
   * @param {object} matches - Media query matches
   * @returns {object} - Mock matchMedia
   */
  static mockMatchMedia(matches = {}) {
    return jest.fn(query => ({
      matches: matches[query] || false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    }));
  }

  /**
   * Mock Web Audio API
   * @returns {object} - Mock Web Audio API
   */
  static mockWebAudioAPI() {
    const mockAudioContext = {
      createOscillator: jest.fn(() => ({
        connect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
        frequency: { value: 440 }
      })),
      createGain: jest.fn(() => ({
        connect: jest.fn(),
        gain: { value: 0.5 }
      })),
      createAnalyser: jest.fn(() => ({
        connect: jest.fn(),
        frequencyBinCount: 256
      })),
      destination: {},
      state: 'running',
      resume: jest.fn()
    };

    return {
      AudioContext: jest.fn(() => mockAudioContext),
      webkitAudioContext: jest.fn(() => mockAudioContext)
    };
  }

  /**
   * Mock Vibration API
   * @returns {object} - Mock Vibration API
   */
  static mockVibrationAPI() {
    return {
      navigator: {
        vibrate: jest.fn()
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
    expect(theme.id).toBeDefined();
    expect(theme.name).toBeDefined();
    expect(theme.colors).toBeDefined();
    expect(theme.colors.primary).toBeDefined();
    expect(theme.colors.background).toBeDefined();
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
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
  }

  static teardown() {
    // Clean up mocks
    jest.clearAllMocks();
    jest.resetAllMocks();
  }
}
