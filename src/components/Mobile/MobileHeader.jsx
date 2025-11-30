/**
 * Mobile Header Component
 * Header for mobile layout with technique selection
 */

import React from 'react';
import { useThemeColors } from '../../contexts/ThemeContext.jsx';
import TechniqueSelector from '../Technique/TechniqueSelector.jsx';

/**
 * Mobile Header Component
 * Displays technique selection dropdown for mobile layout
 */
const MobileHeader = ({ selectedTechniqueId, onTechniqueChange }) => {
  const currentColors = useThemeColors();

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
      <div style={{ flex: 1 }}>
        <TechniqueSelector
          selectedTechniqueId={selectedTechniqueId}
          onChange={onTechniqueChange}
          hideLabel
          compact
        />
      </div>
    </div>
  );
};

export default MobileHeader;
