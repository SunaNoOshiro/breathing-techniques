/**
 * Mobile Header Component
 * Header for mobile layout with technique selection
 */

import React from 'react';
import { useThemeColors } from '../../contexts/ThemeContext.jsx';
import { useLocalization } from '../../contexts/LocalizationContext.jsx';
import { techniqueRegistry } from '../../techniques/TechniqueRegistry.js';
import CustomDropdown from '../Common/CustomDropdown.jsx';

/**
 * Mobile Header Component
 * Displays technique selection dropdown for mobile layout
 */
const MobileHeader = ({ selectedTechniqueId, onTechniqueChange }) => {
  const currentColors = useThemeColors();
  const { t } = useLocalization();

  // Get technique metadata for dropdown with translations
  const techniqueMetadata = React.useMemo(() => {
    return techniqueRegistry.getTechniqueMetadata().map(technique => ({
      ...technique,
      name: t(`techniques.${technique.id}.name`, { fallback: technique.name }),
      description: t(`techniques.${technique.id}.description`, { fallback: technique.description }),
      benefits: t(`techniques.${technique.id}.benefits`, { fallback: technique.benefits })
    }));
  }, [t]);

  const dropdownColors = {
    ...currentColors,
    panel: 'rgba(15, 23, 42, 0.9)',
    border: 'rgba(148, 163, 184, 0.75)',
    text: '#e5e7eb'
  };

  return (
    <header 
      className="mobile-header"
      style={{ 
        padding: '10px 4px 4px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        width: '100%',
        maxWidth: '100vw',
        boxSizing: 'border-box'
      }}
    >
      {/* App title */}
      <div style={{ fontSize: '13px', fontWeight: 600, color: currentColors.text, opacity: 0.9 }}>
        {t('breathingApp')}
      </div>

      {/* Technique Selection */}
      <div style={{ width: '100%' }}>
        <CustomDropdown 
          value={selectedTechniqueId}
          options={techniqueMetadata.map(technique => ({
            value: technique.id,
            label: technique.name
          }))}
          onChange={onTechniqueChange}
          colors={dropdownColors}
        />
      </div>
    </header>
  );
};

export default MobileHeader;
