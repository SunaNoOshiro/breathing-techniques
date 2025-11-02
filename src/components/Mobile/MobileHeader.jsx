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
      name: t(`techniques.${technique.id}.name`) || technique.name,
      description: t(`techniques.${technique.id}.description`) || technique.description,
      benefits: t(`techniques.${technique.id}.benefits`) || technique.benefits
    }));
  }, [t]);

  return (
    <div 
      className="mobile-header" 
      style={{ 
        padding: '8px',
        borderBottom: `1px solid ${currentColors.border}`,
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        width: '100%',
        maxWidth: '100vw',
        boxSizing: 'border-box'
      }}
    >
      {/* Technique Selection */}
      <div style={{ flex: 1 }}>
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
    </div>
  );
};

export default MobileHeader;
