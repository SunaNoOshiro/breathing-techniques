import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatedLoading } from './animations/BreathingAnimations.jsx';
import { ErrorBoundary, VisualizationErrorBoundary } from './components/ErrorBoundary.jsx';
import SettingsScreen from './components/Settings/SettingsScreen.jsx';
import TechniqueGuideSheet from './components/Technique/TechniqueGuideSheet.jsx';
import VisualizationContainer from './components/Visualization/VisualizationContainer.jsx';
import { useLocalization } from './contexts/LocalizationContext.jsx';
import { useServices } from './contexts/ServicesContext.jsx';
import { useTheme, useThemeColors } from './contexts/ThemeContext.jsx';
import CustomDropdown from './components/Common/CustomDropdown.jsx';
import {
  useAccessibility,
  useBreathingSession,
  usePreferences,
  useTechnique
} from './hooks/index.js';
import { techniqueRegistry } from './techniques/TechniqueRegistry.js';
import Logger from './utils/Logger.js';

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
    <path d="M4 7h8" strokeLinecap="round" />
    <path d="M4 17h14" strokeLinecap="round" />
    <path d="M16 7h4" strokeLinecap="round" />
    <path d="M4 12h16" strokeLinecap="round" />
    <circle cx="14" cy="7" r="2.2" />
    <circle cx="9" cy="12" r="2.2" />
    <circle cx="18" cy="17" r="2.2" />
  </svg>
);

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 10v6" strokeLinecap="round" />
    <circle cx="12" cy="7.25" r="0.8" fill="currentColor" stroke="none" />
  </svg>
);

const SoundIcon = ({ muted = false }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M5 10h3.2L12 6.75v10.5L8.2 14H5z" strokeLinejoin="round" />
    {!muted ? (
      <>
        <path d="M15 9.25a4 4 0 0 1 0 5.5" strokeLinecap="round" />
        <path d="M17.8 6.75a7.2 7.2 0 0 1 0 10.5" strokeLinecap="round" />
      </>
    ) : (
      <path className="session-toggle__slash" d="M6 6l12 12" strokeLinecap="round" />
    )}
  </svg>
);

const VibrationIcon = ({ disabled = false }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <rect x="8" y="4.5" width="8" height="15" rx="2.5" />
    {!disabled ? (
      <>
        <path d="M5.5 9l-1.5 2 1.5 2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.5 9l1.5 2-1.5 2" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ) : (
      <path className="session-toggle__slash" d="M6 6l12 12" strokeLinecap="round" />
    )}
  </svg>
);

const UI_LABEL_FALLBACKS = {
  techniqueGuide: { en: 'Technique Guide', uk: 'Гід по техніці' },
  usefulFor: { en: 'Useful for', uk: 'Коли корисно' },
  howToPractice: { en: 'How to practice', uk: 'Як виконувати' },
  errorLoadingTechnique: { en: 'Error loading technique', uk: 'Помилка завантаження техніки' },
  noTechniqueSelected: { en: 'No technique selected', uk: 'Техніка не обрана' },
  errorStartingSession: { en: 'Error starting session', uk: 'Помилка запуску сесії' },
  sessionStopped: { en: 'Session stopped', uk: 'Сесію зупинено' }
};

export default function BreathingApp() {
  const { t, currentLanguage, changeLanguage } = useLocalization();
  const services = useServices();
  const { audioService } = services;
  const { setTheme } = useTheme();
  const currentColors = useThemeColors();
  const { announce } = useAccessibility();
  const { currentTechnique } = useTechnique();
  const {
    start,
    stop,
    changeTechnique,
    isRunning,
    isPaused
  } = useBreathingSession();

  const [showSettings, setShowSettings] = useState(false);
  const [showTechniqueGuide, setShowTechniqueGuide] = useState(false);

  const preferences = usePreferences();
  const {
    soundEnabled: soundOn = true,
    vibrationEnabled: vibrateOn = false,
    currentTheme: selectedThemeKey = 'dark',
    selectedTechniqueId = 'box4',
    setSoundEnabled,
    setVibrationEnabled,
    setCurrentTheme,
    setSelectedTechniqueId
  } = preferences || {};

  const resolvedTechnique = useMemo(() => {
    try {
      return techniqueRegistry.getTechnique(selectedTechniqueId);
    } catch (error) {
      Logger.warn('component', 'Failed to resolve selected technique', error);
      return currentTechnique;
    }
  }, [selectedTechniqueId, currentTechnique]);

  const isSessionActive = isRunning || isPaused;
  const techniqueName = resolvedTechnique
    ? t(`techniques.${resolvedTechnique.getId()}.name`, { fallback: resolvedTechnique.getName() })
    : t('breathingApp');
  const themeOptions = useMemo(() => ([
    { value: 'dark', label: t('dark') },
    { value: 'light', label: t('light') },
    { value: 'ocean', label: t('ocean') },
    { value: 'forest', label: t('forest') },
    { value: 'sunset', label: t('sunset') },
    { value: 'purple', label: t('purple') }
  ]), [t]);
  const techniqueOptions = useMemo(() => (
    techniqueRegistry.getTechniqueMetadata().map((technique) => ({
      value: technique.id,
      label: t(`techniques.${technique.id}.name`, { fallback: technique.name })
    }))
  ), [t]);
  const techniqueGuide = useMemo(() => {
    if (!resolvedTechnique) {
      return null;
    }

    const techniqueId = resolvedTechnique.getId();
    const instructions = t(`techniques.${techniqueId}.instructions`);

    return {
      title: techniqueName,
      pattern: resolvedTechnique.getPattern?.() || '',
      description: t(`techniques.${techniqueId}.description`, {
        fallback: resolvedTechnique.getDescription?.() || ''
      }),
      benefits: t(`techniques.${techniqueId}.benefits`, {
        fallback: resolvedTechnique.getBenefits?.() || ''
      }),
      instructions: Array.isArray(instructions) ? instructions : []
    };
  }, [resolvedTechnique, t, techniqueName]);
  const dropdownColors = useMemo(() => ({
    panel: currentColors.panel,
    text: currentColors.text,
    border: currentColors.border,
    accent: currentColors.accent
  }), [currentColors.accent, currentColors.border, currentColors.panel, currentColors.text]);

  useEffect(() => {
    if (!selectedThemeKey) {
      return;
    }

    setTheme(selectedThemeKey).catch((error) => {
      Logger.warn('component', 'Failed to initialize theme', error);
    });
  }, [selectedThemeKey, setTheme]);

  useEffect(() => {
    if (services?.vibrationService && vibrateOn !== undefined) {
      services.vibrationService.setEnabled(vibrateOn);
    }
  }, [services, vibrateOn]);

  const handleThemeChange = useCallback(async (themeKey) => {
    try {
      setCurrentTheme?.(themeKey);
      await setTheme(themeKey);
    } catch (error) {
      Logger.error('component', 'Failed to change theme', error);
    }
  }, [setCurrentTheme, setTheme]);

  const handleTechniqueChange = useCallback(async (techniqueId) => {
    try {
      const nextTechnique = techniqueRegistry.getTechnique(techniqueId);

      setShowTechniqueGuide(false);
      setSelectedTechniqueId?.(techniqueId);
      stop?.();
      await changeTechnique?.(techniqueId, nextTechnique);
    } catch (error) {
      Logger.error('component', 'Failed to change technique', error);
    }
  }, [changeTechnique, setSelectedTechniqueId, stop]);

  const handlePlayPause = useCallback(async () => {
    try {
      if (isSessionActive) {
        stop?.();
        announce(t('sessionStopped'), 'polite');
        return;
      }

      const techniqueToStart = resolvedTechnique || techniqueRegistry.getTechnique(selectedTechniqueId);

      if (!techniqueToStart) {
        announce(
          t('errorLoadingTechnique', { fallback: UI_LABEL_FALLBACKS.errorLoadingTechnique })
          || t('noTechniqueSelected', { fallback: UI_LABEL_FALLBACKS.noTechniqueSelected }),
          'assertive'
        );
        return;
      }

      if (soundOn && audioService) {
        try {
          await audioService.initialize();
          audioService.ensureAudioContext?.();
        } catch (error) {
          Logger.warn('component', 'Audio warmup failed', error);
        }
      }

      await start?.(selectedTechniqueId, techniqueToStart);
      announce(t('sessionStarted'), 'polite');
    } catch (error) {
      Logger.error('component', 'Failed to start session', error);
      announce(
        t('errorStartingSession', { fallback: UI_LABEL_FALLBACKS.errorStartingSession })
        || t('sessionStopped', { fallback: UI_LABEL_FALLBACKS.sessionStopped }),
        'assertive'
      );
    }
  }, [
    announce,
    audioService,
    isSessionActive,
    resolvedTechnique,
    selectedTechniqueId,
    soundOn,
    start,
    stop,
    t
  ]);

  const handleSoundChange = useCallback((enabled) => {
    setSoundEnabled?.(enabled);
    services?.audioService?.setEnabled?.(enabled);
  }, [services, setSoundEnabled]);

  const handleVibrationChange = useCallback((enabled) => {
    setVibrationEnabled?.(enabled);
    services?.vibrationService?.setEnabled(enabled);
  }, [services, setVibrationEnabled]);

  const toggleSound = useCallback(() => {
    handleSoundChange(!soundOn);
  }, [handleSoundChange, soundOn]);

  const toggleVibration = useCallback(() => {
    handleVibrationChange(!vibrateOn);
  }, [handleVibrationChange, vibrateOn]);

  const handleKeyDown = useCallback((event) => {
    if (event.key === ' ') {
      event.preventDefault();
      handlePlayPause();
    }

    if (event.key === 'Escape' && showSettings) {
      setShowSettings(false);
    }
  }, [handlePlayPause, showSettings]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  if (!preferences) {
    return <AnimatedLoading label={t('loadingVisualization')} />;
  }

  return (
    <ErrorBoundary>
      <main className="breathing-app" aria-label={t('breathingApp')}>
        <div className="breathing-app__ambient" aria-hidden="true">
          <div className="breathing-app__orb breathing-app__orb--teal" />
          <div className="breathing-app__orb breathing-app__orb--violet" />
          <div className="breathing-app__orb breathing-app__orb--emerald" />
        </div>

        <section className="breathing-shell glass-panel">
          <div className="breathing-shell__top">
            <div className="breathing-shell__mode">{t('breathingApp')}</div>

            <button
              type="button"
              className="breathing-shell__settings"
              onClick={() => setShowSettings(true)}
              aria-label={t('settings')}
            >
              <SettingsIcon />
            </button>

            <label className="breathing-shell__picker-label">{t('technique')}</label>

            <div className="breathing-shell__picker-control">
              <CustomDropdown
                value={selectedTechniqueId}
                options={techniqueOptions}
                onChange={handleTechniqueChange}
                colors={dropdownColors}
                showAllOptions
              />
            </div>

            <button
              type="button"
              className="breathing-shell__info"
              onClick={() => setShowTechniqueGuide(true)}
              aria-label={t('openTechniqueGuide')}
            >
              <InfoIcon />
            </button>
          </div>

          <div className="theme-strip" role="group" aria-label={t('theme')}>
            {themeOptions.map((theme) => (
              <button
                key={theme.value}
                type="button"
                className={`theme-strip__button${
                  selectedThemeKey === theme.value ? ' is-active' : ''
                }`}
                onClick={() => handleThemeChange(theme.value)}
                aria-pressed={selectedThemeKey === theme.value}
              >
                {theme.label}
              </button>
            ))}
          </div>

          <VisualizationErrorBoundary>
            <VisualizationContainer />
          </VisualizationErrorBoundary>

          <footer className="breathing-shell__footer">
            <button
              type="button"
              className={`session-toggle glass-panel${soundOn ? '' : ' is-off'}`}
              onClick={toggleSound}
              aria-label={soundOn ? t('disableSound') : t('enableSound')}
              aria-pressed={soundOn}
              title={soundOn ? t('disableSound') : t('enableSound')}
            >
              <SoundIcon muted={!soundOn} />
            </button>

            <button
              type="button"
              className="session-button glass-panel"
              onClick={handlePlayPause}
              aria-label={isSessionActive ? t('stopSession') : t('startSession')}
              aria-pressed={isSessionActive}
            >
              {isSessionActive ? t('stop').toUpperCase() : t('start').toUpperCase()}
            </button>

            <button
              type="button"
              className={`session-toggle glass-panel${vibrateOn ? '' : ' is-off'}`}
              onClick={toggleVibration}
              aria-label={vibrateOn ? t('disableVibration') : t('enableVibration')}
              aria-pressed={vibrateOn}
              title={vibrateOn ? t('disableVibration') : t('enableVibration')}
            >
              <VibrationIcon disabled={!vibrateOn} />
            </button>
          </footer>
        </section>

        {showSettings ? (
          <SettingsScreen
            onClose={() => setShowSettings(false)}
            selectedTechniqueId={selectedTechniqueId}
            onTechniqueChange={handleTechniqueChange}
            techniqueOptions={techniqueOptions}
            selectedThemeKey={selectedThemeKey}
            onThemeChange={handleThemeChange}
            themeOptions={themeOptions}
            currentLanguage={currentLanguage}
            onLanguageChange={changeLanguage}
            soundOn={soundOn}
            onSoundChange={handleSoundChange}
            vibrateOn={vibrateOn}
            onVibrationChange={handleVibrationChange}
          />
        ) : null}

        {showTechniqueGuide && techniqueGuide ? (
          <TechniqueGuideSheet
            title={techniqueGuide.title}
            pattern={techniqueGuide.pattern}
            description={techniqueGuide.description}
            benefits={techniqueGuide.benefits}
            instructions={techniqueGuide.instructions}
            labels={{
              guide: t('techniqueGuide', { fallback: UI_LABEL_FALLBACKS.techniqueGuide }),
              usefulFor: t('usefulFor', { fallback: UI_LABEL_FALLBACKS.usefulFor }),
              howTo: t('howToPractice', { fallback: UI_LABEL_FALLBACKS.howToPractice }),
              close: t('close')
            }}
            onClose={() => setShowTechniqueGuide(false)}
          />
        ) : null}
      </main>
    </ErrorBoundary>
  );
}
