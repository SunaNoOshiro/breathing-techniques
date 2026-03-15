import React from 'react';
import { useLocalization } from '../../contexts/LocalizationContext.jsx';
import { useThemeColors } from '../../contexts/ThemeContext.jsx';
import CustomDropdown from '../Common/CustomDropdown.jsx';
import CustomRadio from '../Common/CustomRadio.jsx';

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

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M6 6l12 12" strokeLinecap="round" />
    <path d="M18 6L6 18" strokeLinecap="round" />
  </svg>
);

const SettingsScreen = ({
  onClose,
  selectedTechniqueId,
  onTechniqueChange,
  techniqueOptions,
  selectedThemeKey,
  onThemeChange,
  themeOptions,
  currentLanguage,
  onLanguageChange,
  soundOn,
  onSoundChange,
  vibrateOn,
  onVibrationChange
}) => {
  const { t, availableLanguages } = useLocalization();
  const currentColors = useThemeColors();

  const languageOptions = React.useMemo(() => {
    return availableLanguages.map((language) => ({
      value: language.code,
      label: language.name
    }));
  }, [availableLanguages]);

  const modalColors = React.useMemo(() => ({
    panel: currentColors.panel,
    text: currentColors.text,
    border: currentColors.border,
    accent: currentColors.accent
  }), [currentColors.accent, currentColors.border, currentColors.panel, currentColors.text]);

  return (
    <div
      className="settings-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      onClick={onClose}
    >
      <div
        className="settings-modal__panel glass-panel"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="settings-modal__header">
          <div>
            <div className="settings-modal__eyebrow">
              <SettingsIcon />
              <span>{t('breathingApp')}</span>
            </div>
            <h2 id="settings-title" className="settings-modal__title">
              {t('settings')}
            </h2>
          </div>

          <button
            type="button"
            className="settings-modal__close"
            onClick={onClose}
            aria-label={t('close')}
          >
            <CloseIcon />
          </button>
        </header>

        <div className="settings-modal__body">
          <section className="settings-modal__field">
            <label className="settings-modal__label">{t('technique')}</label>
            <CustomDropdown
              value={selectedTechniqueId}
              options={techniqueOptions}
              onChange={onTechniqueChange}
              colors={modalColors}
              showAllOptions
            />
          </section>

          <section className="settings-modal__field">
            <label className="settings-modal__label">{t('theme')}</label>
            <CustomDropdown
              value={selectedThemeKey}
              options={themeOptions}
              onChange={onThemeChange}
              colors={modalColors}
            />
          </section>

          <section className="settings-modal__field">
            <label className="settings-modal__label">{t('language')}</label>
            <CustomDropdown
              value={currentLanguage}
              options={languageOptions}
              onChange={onLanguageChange}
              colors={modalColors}
            />
          </section>

          <section className="settings-modal__field">
            <label className="settings-modal__label">{t('sound')}</label>
            <div className="settings-modal__choice-row">
              <CustomRadio
                name="sound"
                checked={soundOn}
                onChange={() => onSoundChange(true)}
                label={t('on')}
                colors={modalColors}
              />
              <CustomRadio
                name="sound"
                checked={!soundOn}
                onChange={() => onSoundChange(false)}
                label={t('off')}
                colors={modalColors}
              />
            </div>
          </section>

          <section className="settings-modal__field">
            <label className="settings-modal__label">{t('vibration')}</label>
            <div className="settings-modal__choice-row">
              <CustomRadio
                name="vibration"
                checked={vibrateOn}
                onChange={() => onVibrationChange(true)}
                label={t('on')}
                colors={modalColors}
              />
              <CustomRadio
                name="vibration"
                checked={!vibrateOn}
                onChange={() => onVibrationChange(false)}
                label={t('off')}
                colors={modalColors}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
