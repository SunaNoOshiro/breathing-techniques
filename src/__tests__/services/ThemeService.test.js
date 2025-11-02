/**
 * ThemeService Tests
 * Tests for the ThemeService class
 */

import { ThemeService } from '../../services/ThemeService.js';
import { TestUtils, TestAssertions } from '../TestUtils.js';

describe('ThemeService', () => {
  let themeService;
  let mockStorageAdapter;

  beforeEach(() => {
    mockStorageAdapter = {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn()
    };

    themeService = new ThemeService(mockStorageAdapter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    test('should initialize with default theme', () => {
      const currentTheme = themeService.getCurrentTheme();
      expect(currentTheme).toBeDefined();
      expect(currentTheme.id).toBe('dark');
    });

    test('should load theme from storage on initialization', () => {
      mockStorageAdapter.get.mockReturnValue('light');
      const newThemeService = new ThemeService(mockStorageAdapter);
      
      expect(mockStorageAdapter.get).toHaveBeenCalledWith('theme');
    });
  });

  describe('theme management', () => {
    test('should set theme correctly', () => {
      themeService.setTheme('light');
      
      expect(mockStorageAdapter.set).toHaveBeenCalledWith('theme', 'light');
      
      const currentTheme = themeService.getCurrentTheme();
      expect(currentTheme.id).toBe('light');
    });

    test('should get available themes', () => {
      const themes = themeService.getAvailableThemes();
      
      expect(Array.isArray(themes)).toBe(true);
      expect(themes.length).toBeGreaterThan(0);
      
      themes.forEach(theme => {
        TestAssertions.assertValidTheme(theme);
      });
    });

    test('should validate theme exists', () => {
      expect(themeService.hasTheme('dark')).toBe(true);
      expect(themeService.hasTheme('light')).toBe(true);
      expect(themeService.hasTheme('nonexistent')).toBe(false);
    });
  });

  describe('theme colors', () => {
    test('should get theme colors', () => {
      const colors = themeService.getThemeColors('dark');
      
      expect(colors).toBeDefined();
      expect(colors.primary).toBeDefined();
      expect(colors.background).toBeDefined();
      expect(colors.text).toBeDefined();
    });

    test('should get current theme colors', () => {
      const colors = themeService.getCurrentThemeColors();
      
      expect(colors).toBeDefined();
      expect(typeof colors).toBe('object');
    });

    test('should generate theme colors with cycle count', () => {
      const colors = themeService.generateThemeColors(5, 'dark');
      
      expect(colors).toBeDefined();
      expect(colors.active).toBeDefined();
      expect(colors.idle).toBeDefined();
    });
  });

  describe('error handling', () => {
    test('should handle invalid theme gracefully', () => {
      expect(() => themeService.setTheme('invalid-theme')).not.toThrow();
      
      const currentTheme = themeService.getCurrentTheme();
      expect(currentTheme.id).toBe('dark'); // Should fallback to default
    });

    test('should handle storage errors gracefully', () => {
      mockStorageAdapter.set.mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => themeService.setTheme('light')).not.toThrow();
    });
  });

  describe('theme persistence', () => {
    test('should persist theme changes', () => {
      themeService.setTheme('ocean');
      
      expect(mockStorageAdapter.set).toHaveBeenCalledWith('theme', 'ocean');
    });

    test('should load persisted theme on initialization', () => {
      mockStorageAdapter.get.mockReturnValue('forest');
      const newThemeService = new ThemeService(mockStorageAdapter);
      
      const currentTheme = newThemeService.getCurrentTheme();
      expect(currentTheme.id).toBe('forest');
    });
  });
});

