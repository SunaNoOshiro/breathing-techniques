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
      className="desktop-control-panel panel-card"
      style={{
        width: '320px',
        padding: '26px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        position: 'sticky',
        top: 12,
        alignSelf: 'flex-start'
      }}
    >
      <div className="control-stack">
        <div>
          <div className="section-title">{t('technique')}</div>
          <div className="section-hint">{t('chooseTechnique')}</div>
          <TechniqueSelector
            selectedTechniqueId={selectedTechniqueId}
            onChange={onTechniqueChange}
          />
        </div>

        <div>
          <div className="section-title">{t('language')}</div>
          <div className="section-hint">{t('languageDescription')}</div>
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

        <div>
          <div className="section-title">{t('theme')}</div>
          <div className="section-hint">{t('themeDescription') || t('theme')}</div>
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
      </div>

      <div className="control-stack" style={{ marginTop: 4 }}>
        <div className="section-title">{t('preferences')}</div>
        <PreferenceToggle
          name="sound"
          label={t('sound')}
          checked={soundOn}
          onChange={onSoundChange}
          onLabel={t('on')}
          offLabel={t('off')}
          colors={currentColors}
        />
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
    </div>
  );
};

export default DesktopControlPanel;
