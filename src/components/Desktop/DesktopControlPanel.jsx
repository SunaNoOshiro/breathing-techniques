/**
 * Desktop Control Panel Component
 * Control panel for desktop layout
 */

import React from 'react';
import { useThemeColors } from '../../contexts/ThemeContext.jsx';
import { useLocalization } from '../../contexts/LocalizationContext.jsx';
import CustomDropdown from '../Common/CustomDropdown.jsx';
import TechniqueSelector from '../Technique/TechniqueSelector.jsx';
import PreferenceToggle from '../Common/PreferenceToggle.jsx';

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
      <TechniqueSelector
        selectedTechniqueId={selectedTechniqueId}
        onChange={onTechniqueChange}
      />

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
      <PreferenceToggle
        name="sound"
        label={t('sound')}
        checked={soundOn}
        onChange={onSoundChange}
        onLabel={t('on')}
        offLabel={t('off')}
        colors={currentColors}
      />

      {/* Vibration Control */}
      <PreferenceToggle
        name="vibration"
        label={t('vibration')}
        checked={vibrateOn}
        onChange={onVibrationChange}
        onLabel={t('on')}
        offLabel={t('off')}
        colors={currentColors}
      />
    </div>
  );
};

export default DesktopControlPanel;
