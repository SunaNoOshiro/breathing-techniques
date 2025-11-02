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
      name: t(`techniques.${technique.id}.name`) || technique.name,
      description: t(`techniques.${technique.id}.description`) || technique.description,
      benefits: t(`techniques.${technique.id}.benefits`) || technique.benefits
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
    <div 
      className="desktop-control-panel" 
      style={{
        width: '300px',
        background: currentColors.panel,
        borderRight: `1px solid ${currentColors.border}`,
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}
    >
      {/* Technique Selection */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          marginBottom: '8px', 
          fontWeight: '600',
          color: currentColors.text
        }}>
          {t('technique')}
        </label>
        <CustomDropdown 
          value={selectedTechniqueId}
          options={techniqueMetadata.map(technique => ({
            value: technique.id,
            label: technique.name
          }))}
          onChange={onTechniqueChange}
          colors={currentColors}
        />
      </div>

      {/* Language Selection */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          marginBottom: '8px', 
          fontWeight: '600',
          color: currentColors.text
        }}>
          {t('language')}
        </label>
        <CustomDropdown 
          value={currentLanguage}
          options={availableLanguages.map(lang => ({
            value: lang.code,
            label: lang.name
          }))}
          onChange={onLanguageChange}
          colors={currentColors}
        />
      </div>

      {/* Theme Selection */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          marginBottom: '8px', 
          fontWeight: '600',
          color: currentColors.text
        }}>
          {t('theme')}
        </label>
        <CustomDropdown 
          value={selectedThemeKey}
          options={themeNames.map(theme => ({
            value: theme.key,
            label: theme.name
          }))}
          onChange={onThemeChange}
          colors={currentColors}
        />
      </div>

      {/* Sound Control */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          marginBottom: '8px', 
          fontWeight: '600',
          color: currentColors.text
        }}>
          {t('sound')}
        </label>
        <div style={{ display: 'flex', gap: '16px' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontSize: '16px',
            color: currentColors.text,
            cursor: 'pointer'
          }}>
            <input 
              type="radio" 
              name="sound" 
              checked={soundOn} 
              onChange={() => onSoundChange(true)}
              style={{ 
                transform: 'scale(1.2)',
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
            fontSize: '16px',
            color: currentColors.text,
            cursor: 'pointer'
          }}>
            <input 
              type="radio" 
              name="sound" 
              checked={!soundOn} 
              onChange={() => onSoundChange(false)}
              style={{ 
                transform: 'scale(1.2)',
                accentColor: currentColors.accent,
                cursor: 'pointer'
              }}
            />
            {t('off')}
          </label>
        </div>
      </div>

      {/* Vibration Control */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          marginBottom: '8px', 
          fontWeight: '600',
          color: currentColors.text
        }}>
          {t('vibration')}
        </label>
        <div style={{ display: 'flex', gap: '16px' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontSize: '16px',
            color: currentColors.text,
            cursor: 'pointer'
          }}>
            <input 
              type="radio" 
              name="vibration" 
              checked={vibrateOn} 
              onChange={() => onVibrationChange(true)}
              style={{ 
                transform: 'scale(1.2)',
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
            fontSize: '16px',
            color: currentColors.text,
            cursor: 'pointer'
          }}>
            <input 
              type="radio" 
              name="vibration" 
              checked={!vibrateOn} 
              onChange={() => onVibrationChange(false)}
              style={{ 
                transform: 'scale(1.2)',
                accentColor: currentColors.accent,
                cursor: 'pointer'
              }}
            />
            {t('off')}
          </label>
        </div>
      </div>
    </div>
  );
};

export default DesktopControlPanel;
