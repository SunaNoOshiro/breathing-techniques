/**
 * Desktop Control Panel Component
 * Control panel for desktop layout
 */

import React from 'react';
import { useThemeColors } from '../../contexts/ThemeContext.jsx';
import { useLocalization } from '../../contexts/LocalizationContext.jsx';
import { techniqueRegistry } from '../../techniques/TechniqueRegistry.js';
import CustomDropdown from '../Common/CustomDropdown.jsx';

/**
 * Desktop Control Panel Component
 * Displays controls for desktop layout
 */
const DesktopControlPanel = ({ 
  selectedTechniqueId, 
  onTechniqueChange,
  currentLanguage,
  onLanguageChange,
  selectedThemeKey,
  onThemeChange,
  soundOn,
  onSoundChange,
  vibrateOn,
  onVibrationChange
}) => {
  const currentColors = useThemeColors();
  const { t, availableLanguages } = useLocalization();

  // Get technique metadata for dropdown with translations
  const techniqueMetadata = React.useMemo(() => {
    return techniqueRegistry.getTechniqueMetadata().map(technique => ({
      ...technique,
      name: t(`techniques.${technique.id}.name`, { fallback: technique.name }),
      description: t(`techniques.${technique.id}.description`, { fallback: technique.description }),
      benefits: t(`techniques.${technique.id}.benefits`, { fallback: technique.benefits })
    }));
  }, [t]);

  // Get theme names for dropdown
  const themeNames = React.useMemo(() => {
    return [
      { key: 'dark', name: t('dark') },
      { key: 'light', name: t('light') },
      { key: 'ocean', name: t('ocean') },
      { key: 'forest', name: t('forest') },
      { key: 'sunset', name: t('sunset') },
      { key: 'purple', name: t('purple') }
    ];
  }, [t]);

  return (
    <aside 
      className="desktop-control-panel glass-card glass-card--padded"
      style={{
        width: '300px',
        background: 'rgba(15, 23, 42, 0.96)',
        borderColor: 'rgba(148,163,184,0.45)',
        display: 'flex',
        flexDirection: 'column',
        gap: '22px',
        color: currentColors.text
      }}
      aria-label={t('settings')}
    >
      {/* Panel header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.7 }}>
          {t('breathingApp')}
        </div>
        <div style={{ fontSize: '18px', fontWeight: 600 }}>
          {t('settings')}
        </div>
      </div>

      {/* Technique Selection */}
      <section aria-label={t('technique')}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <label style={{ 
            fontSize: '13px', 
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span aria-hidden="true">◯</span>
            {t('technique')}
          </label>
        </div>
        <CustomDropdown 
          value={selectedTechniqueId}
          options={techniqueMetadata.map(technique => ({
            value: technique.id,
            label: technique.name
          }))}
          onChange={onTechniqueChange}
          colors={currentColors}
        />
      </section>

      {/* Language Selection */}
      <section aria-label={t('language')}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <label style={{ 
            fontSize: '13px', 
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span aria-hidden="true">🌐</span>
            {t('language')}
          </label>
        </div>
        <CustomDropdown 
          value={currentLanguage}
          options={availableLanguages.map(lang => ({
            value: lang.code,
            label: lang.name
          }))}
          onChange={onLanguageChange}
          colors={currentColors}
        />
      </section>

      {/* Theme Selection */}
      <section aria-label={t('theme')}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <label style={{ 
            fontSize: '13px', 
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span aria-hidden="true">🌊</span>
            {t('theme')}
          </label>
        </div>
        <CustomDropdown 
          value={selectedThemeKey}
          options={themeNames.map(theme => ({
            value: theme.key,
            label: theme.name
          }))}
          onChange={onThemeChange}
          colors={currentColors}
        />
      </section>

      {/* Sound Control */}
      <section aria-label={t('sound')}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '6px' 
        }}>
          <label style={{ 
            fontSize: '13px', 
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span aria-hidden="true">🔊</span>
            {t('sound')}
          </label>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            <input 
              type="radio" 
              name="sound" 
              checked={soundOn} 
              onChange={() => onSoundChange(true)}
              style={{ 
                transform: 'scale(1.1)',
                accentColor: currentColors.accent,
                cursor: 'pointer'
              }}
            />
            {t('on')}
          </label>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            <input 
              type="radio" 
              name="sound" 
              checked={!soundOn} 
              onChange={() => onSoundChange(false)}
              style={{ 
                transform: 'scale(1.1)',
                accentColor: currentColors.accent,
                cursor: 'pointer'
              }}
            />
            {t('off')}
          </label>
        </div>
      </section>

      {/* Vibration Control */}
      <section aria-label={t('vibration')}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '6px' 
        }}>
          <label style={{ 
            fontSize: '13px', 
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span aria-hidden="true">🌗</span>
            {t('vibration')}
          </label>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            <input 
              type="radio" 
              name="vibration" 
              checked={vibrateOn} 
              onChange={() => onVibrationChange(true)}
              style={{ 
                transform: 'scale(1.1)',
                accentColor: currentColors.accent,
                cursor: 'pointer'
              }}
            />
            {t('on')}
          </label>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            <input 
              type="radio" 
              name="vibration" 
              checked={!vibrateOn} 
              onChange={() => onVibrationChange(false)}
              style={{ 
                transform: 'scale(1.1)',
                accentColor: currentColors.accent,
                cursor: 'pointer'
              }}
            />
            {t('off')}
          </label>
        </div>
      </section>
    </aside>
  );
};

export default DesktopControlPanel;
