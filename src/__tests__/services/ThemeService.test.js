import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ThemeService } from '../../services/ThemeService.js';

describe('ThemeService', () => {
  let storageAdapter;
  let themeService;

  beforeEach(() => {
    storageAdapter = {
      safeGet: vi.fn(async () => null),
      safeSet: vi.fn(async () => undefined)
    };

    themeService = new ThemeService(storageAdapter);
  });

  test('defaults to the dark theme', () => {
    expect(themeService.getCurrentTheme()).toBe('dark');
    expect(themeService.getCurrentThemeColors()).toMatchObject({
      bg: expect.any(String),
      text: expect.any(String)
    });
  });

  test('loads the current theme from storage', async () => {
    storageAdapter.safeGet.mockImplementation(async (key) => (
      key === 'breathing-app-theme' ? 'ocean' : null
    ));

    themeService = new ThemeService(storageAdapter);
    await themeService.loadCurrentTheme();

    expect(storageAdapter.safeGet).toHaveBeenCalledWith('breathing-app-theme');
    expect(themeService.getCurrentTheme()).toBe('ocean');
  });

  test('persists current theme changes', async () => {
    await themeService.setCurrentTheme('light');

    expect(storageAdapter.safeSet).toHaveBeenCalledWith('breathing-app-theme', 'light');
    expect(themeService.getCurrentTheme()).toBe('light');
  });

  test('returns theme metadata and capabilities', () => {
    const themes = themeService.getAllThemes();
    const capabilities = themeService.getCapabilities();

    expect(themes.length).toBeGreaterThan(0);
    expect(capabilities.availableThemes).toContain('dark');
    expect(capabilities.currentTheme).toBe('dark');
  });

  test('throws when setting an unknown theme', async () => {
    await expect(themeService.setCurrentTheme('unknown-theme')).rejects.toThrow(/not found/i);
  });
});
