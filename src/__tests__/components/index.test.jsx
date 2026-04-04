import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import TechniqueInfo from '../../components/Technique/TechniqueInfo.jsx';
import MobileHeader from '../../components/Mobile/MobileHeader.jsx';
import MobileBottomNav from '../../components/Mobile/MobileBottomNav.jsx';
import SettingsScreen from '../../components/Settings/SettingsScreen.jsx';
import { ErrorBoundary } from '../../components/ErrorBoundary.jsx';
import { TestUtils } from '../TestUtils.js';

const componentMocks = vi.hoisted(() => ({
  useTechnique: vi.fn(),
  useResponsive: vi.fn(),
  useBreathingSession: vi.fn(),
  useAccessibility: vi.fn(),
  useThemeColors: vi.fn(),
  useLocalization: vi.fn(),
  getTechniqueMetadata: vi.fn()
}));

vi.mock('../../hooks/index.js', () => ({
  useTechnique: () => componentMocks.useTechnique(),
  useResponsive: () => componentMocks.useResponsive(),
  useBreathingSession: () => componentMocks.useBreathingSession(),
  useAccessibility: () => componentMocks.useAccessibility()
}));

vi.mock('../../contexts/ThemeContext.jsx', () => ({
  useThemeColors: () => componentMocks.useThemeColors()
}));

vi.mock('../../contexts/LocalizationContext.jsx', () => ({
  useLocalization: () => componentMocks.useLocalization()
}));

vi.mock('../../techniques/TechniqueRegistry.js', () => ({
  techniqueRegistry: {
    getTechniqueMetadata: () => componentMocks.getTechniqueMetadata()
  }
}));

describe('components', () => {
  beforeEach(() => {
    const translations = {
      breathingApp: 'Breathing App',
      settings: 'Settings',
      close: 'Close',
      sessionControls: 'Session controls',
      ready: 'Ready',
      pressToStart: 'Press to start',
      secLeft: 'sec left',
      startSession: 'Start session',
      stopSession: 'Stop session',
      start: 'Start',
      stop: 'Stop',
      noTechniqueSelected: 'No technique selected'
    };

    componentMocks.useTechnique.mockReturnValue({
      currentTechnique: TestUtils.createMockTechnique({ id: 'box4', name: 'Box Breathing' })
    });
    componentMocks.useResponsive.mockReturnValue({ isDesktop: true });
    componentMocks.useBreathingSession.mockReturnValue({
      currentPhase: null,
      isRunning: false
    });
    componentMocks.useAccessibility.mockReturnValue({
      prefersReducedMotion: false
    });
    componentMocks.useThemeColors.mockReturnValue({
      bg: '#0b1020',
      panel: '#0f172a',
      text: '#e5e7eb',
      accent: '#60A5FA',
      border: '#374151'
    });
    componentMocks.useLocalization.mockReturnValue({
      t: (key, options = {}) => translations[key] ?? options.fallback ?? key,
      availableLanguages: [{ code: 'en', name: 'English' }]
    });
    componentMocks.getTechniqueMetadata.mockReturnValue([
      { id: 'box4', name: 'Box Breathing', description: 'A box pattern', benefits: 'Calm' },
      { id: 'triangle', name: 'Triangle Breathing', description: 'A triangle pattern', benefits: 'Focus' }
    ]);
  });

  test('TechniqueInfo renders the current technique on desktop', () => {
    render(<TechniqueInfo />);

    expect(screen.getByText('Box Breathing')).toBeInTheDocument();
    expect(screen.getByText('4-4-4')).toBeInTheDocument();
  });

  test('TechniqueInfo shows an empty-state when no technique is selected', () => {
    componentMocks.useTechnique.mockReturnValue({ currentTechnique: null });

    render(<TechniqueInfo />);

    expect(screen.getByText('No technique selected')).toBeInTheDocument();
  });

  test('MobileHeader opens technique options and reports selection changes', () => {
    const onTechniqueChange = vi.fn();

    render(
      <MobileHeader
        selectedTechniqueId="box4"
        onTechniqueChange={onTechniqueChange}
      />
    );

    expect(screen.getByText('Breathing App')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('option', { name: 'Triangle Breathing' }));

    expect(onTechniqueChange).toHaveBeenCalledWith('triangle');
  });

  test('MobileBottomNav invokes settings and play/pause actions', () => {
    const onSettingsClick = vi.fn();
    const onPlayPause = vi.fn();

    render(
      <MobileBottomNav
        onSettingsClick={onSettingsClick}
        onPlayPause={onPlayPause}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
    fireEvent.click(screen.getByRole('button', { name: 'Start session' }));

    expect(onSettingsClick).toHaveBeenCalled();
    expect(onPlayPause).toHaveBeenCalled();
  });

  test('SettingsScreen renders as a dialog and closes on request', () => {
    const onClose = vi.fn();

    render(
      <SettingsScreen
        onClose={onClose}
        selectedTechniqueId="box4"
        onTechniqueChange={vi.fn()}
        techniqueOptions={[{ value: 'box4', label: 'Box Breathing' }]}
        selectedThemeKey="dark"
        onThemeChange={vi.fn()}
        themeOptions={[{ value: 'dark', label: 'Dark' }]}
        currentLanguage="en"
        onLanguageChange={vi.fn()}
        soundOn={true}
        onSoundChange={vi.fn()}
        vibrateOn={false}
        onVibrationChange={vi.fn()}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalled();
  });

  test('ErrorBoundary renders a fallback UI when a child throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const ThrowError = () => {
      throw new Error('Boom');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Application Error')).toBeInTheDocument();
  });
});
