/**
 * Settings Screen Component
 * Full-screen settings modal for mobile
 */

import React from 'react';
import { useThemeColors } from '../../contexts/ThemeContext.jsx';
import { useLocalization } from '../../contexts/LocalizationContext.jsx';
import CustomDropdown from '../Common/CustomDropdown.jsx';
import CustomRadio from '../Common/CustomRadio.jsx';

/**
 * Settings Screen Component
 * Displays settings in a full-screen modal
 */
const SettingsScreen = ({ 
  onClose,
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
      className="settings-screen" 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        background: currentColors.bg, 
        zIndex: 1000,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          marginBottom: '20px', 
          textAlign: 'center',
          color: currentColors.text
        }}>
          {t('settings')}
        </h2>
        
        {/* Language Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '16px', 
            marginBottom: '8px',
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
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '16px', 
            marginBottom: '8px',
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
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '16px', 
            marginBottom: '12px',
            color: currentColors.text
          }}>
            {t('sound')}
          </label>
          <div style={{ display: 'flex', gap: '24px' }}>
            <CustomRadio 
              name="sound"
              checked={soundOn}
              onChange={() => onSoundChange(true)}
              label={t('on')}
              colors={currentColors}
            />
            <CustomRadio 
              name="sound"
              checked={!soundOn}
              onChange={() => onSoundChange(false)}
              label={t('off')}
              colors={currentColors}
            />
          </div>
        </div>

        {/* Vibration Control */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '16px', 
            marginBottom: '12px',
            color: currentColors.text
          }}>
            {t('vibration')}
          </label>
          <div style={{ display: 'flex', gap: '24px' }}>
            <CustomRadio 
              name="vibration"
              checked={vibrateOn}
              onChange={() => onVibrationChange(true)}
              label={t('on')}
              colors={currentColors}
            />
            <CustomRadio 
              name="vibration"
              checked={!vibrateOn}
              onChange={() => onVibrationChange(false)}
              label={t('off')}
              colors={currentColors}
            />
          </div>
        </div>
      </div>

      {/* Close Button */}
      <div style={{ marginTop: 'auto', textAlign: 'center' }}>
        <button 
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '48px',
            cursor: 'pointer',
            color: currentColors.text,
            padding: '20px'
          }}
          aria-label={t('close')}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default SettingsScreen;
