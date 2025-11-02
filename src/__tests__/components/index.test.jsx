/**
 * Component Tests
 * Tests for React components
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

describe('Component Tests', () => {
  describe('TechniqueInfo Component', () => {
    let TechniqueInfo;

    beforeEach(async () => {
      const module = await import('../../components/Technique/TechniqueInfo.jsx');
      TechniqueInfo = module.default;
    });

    test('should render technique information', () => {
      render(<TechniqueInfo />);
      
      expect(screen.getByText(/technique/i)).toBeInTheDocument();
    });

    test('should handle missing technique gracefully', () => {
      render(<TechniqueInfo />);
      
      expect(screen.getByText(/no technique selected/i)).toBeInTheDocument();
    });
  });

  describe('MobileHeader Component', () => {
    let MobileHeader;

    beforeEach(async () => {
      const module = await import('../../components/Mobile/MobileHeader.jsx');
      MobileHeader = module.default;
    });

    test('should render technique selection', () => {
      const mockOnTechniqueChange = jest.fn();
      
      render(
        <MobileHeader 
          selectedTechniqueId="box4"
          onTechniqueChange={mockOnTechniqueChange}
        />
      );
      
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    test('should call onTechniqueChange when selection changes', () => {
      const mockOnTechniqueChange = jest.fn();
      
      render(
        <MobileHeader 
          selectedTechniqueId="box4"
          onTechniqueChange={mockOnTechniqueChange}
        />
      );
      
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'triangle' } });
      
      expect(mockOnTechniqueChange).toHaveBeenCalledWith('triangle');
    });
  });

  describe('MobileBottomNav Component', () => {
    let MobileBottomNav;

    beforeEach(async () => {
      const module = await import('../../components/Mobile/MobileBottomNav.jsx');
      MobileBottomNav = module.default;
    });

    test('should render navigation elements', () => {
      const mockOnSettingsClick = jest.fn();
      const mockOnPlayPause = jest.fn();
      
      render(
        <MobileBottomNav 
          onSettingsClick={mockOnSettingsClick}
          onPlayPause={mockOnPlayPause}
        />
      );
      
      expect(screen.getByLabelText(/settings/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/start/i)).toBeInTheDocument();
    });

    test('should call handlers when buttons are clicked', () => {
      const mockOnSettingsClick = jest.fn();
      const mockOnPlayPause = jest.fn();
      
      render(
        <MobileBottomNav 
          onSettingsClick={mockOnSettingsClick}
          onPlayPause={mockOnPlayPause}
        />
      );
      
      const settingsButton = screen.getByLabelText(/settings/i);
      const playButton = screen.getByLabelText(/start/i);
      
      fireEvent.click(settingsButton);
      fireEvent.click(playButton);
      
      expect(mockOnSettingsClick).toHaveBeenCalled();
      expect(mockOnPlayPause).toHaveBeenCalled();
    });
  });

  describe('SettingsScreen Component', () => {
    let SettingsScreen;

    beforeEach(async () => {
      const module = await import('../../components/Settings/SettingsScreen.jsx');
      SettingsScreen = module.default;
    });

    test('should render settings form', () => {
      const mockOnClose = jest.fn();
      
      render(
        <SettingsScreen 
          onClose={mockOnClose}
          currentLanguage="en"
          onLanguageChange={jest.fn()}
          selectedThemeKey="dark"
          onThemeChange={jest.fn()}
          soundOn={true}
          onSoundChange={jest.fn()}
          vibrateOn={false}
          onVibrationChange={jest.fn()}
        />
      );
      
      expect(screen.getByText(/settings/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/language/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/theme/i)).toBeInTheDocument();
    });

    test('should call onClose when close button is clicked', () => {
      const mockOnClose = jest.fn();
      
      render(
        <SettingsScreen 
          onClose={mockOnClose}
          currentLanguage="en"
          onLanguageChange={jest.fn()}
          selectedThemeKey="dark"
          onThemeChange={jest.fn()}
          soundOn={true}
          onSoundChange={jest.fn()}
          vibrateOn={false}
          onVibrationChange={jest.fn()}
        />
      );
      
      const closeButton = screen.getByLabelText(/close/i);
      fireEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('ErrorBoundary Component', () => {
    let ErrorBoundary;

    beforeEach(async () => {
      const module = await import('../../components/ErrorBoundary.jsx');
      ErrorBoundary = module.ErrorBoundary;
    });

    test('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    test('should render error fallback when error occurs', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );
      
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });
});
