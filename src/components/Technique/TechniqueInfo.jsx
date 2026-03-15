/**
 * Technique Info Component
 * Displays information about the current breathing technique
 */

import React from 'react';
import { useTechnique } from '../../hooks/index.js';
import { useThemeColors } from '../../contexts/ThemeContext.jsx';
import { useResponsive } from '../../hooks/index.js';
import { useLocalization } from '../../contexts/LocalizationContext.jsx';

/**
 * Technique Info Component
 * Displays technique name, description, pattern, and benefits
 */
const TechniqueInfo = () => {
  const { currentTechnique } = useTechnique();
  const currentColors = useThemeColors();
  const { isDesktop } = useResponsive();
  const { t } = useLocalization();

  // On mobile we keep the canvas as clean as possible;
  // detailed technique copy lives in settings instead.
  if (!isDesktop) {
    return null;
  }

  if (!currentTechnique) {
    return (
      <div
        className="glass-card glass-card--padded technique-card"
        style={{
          marginBottom: '16px',
          maxWidth: '720px',
          width: '720px',
          background: currentColors.panel,
          borderColor: currentColors.border,
          color: currentColors.text,
          boxSizing: 'border-box'
        }}
      >
        <div style={{ textAlign: 'center', fontWeight: 500 }}>
          {t('noTechniqueSelected')}
        </div>
      </div>
    );
  }

  const techniqueId = currentTechnique.getId();
  const techniqueName = t(`techniques.${techniqueId}.name`, { fallback: currentTechnique.getName() });
  const techniqueDescription = t(`techniques.${techniqueId}.description`, {
    fallback: currentTechnique.getDescription()
  });
  const techniqueBenefits = t(`techniques.${techniqueId}.benefits`, {
    fallback: currentTechnique.getBenefits()
  });
  const techniquePattern = currentTechnique.getPattern();

  return (
    <div
      className="glass-card glass-card--padded technique-card"
      style={{
        marginBottom: '16px',
        maxWidth: '720px',
        width: '720px',
        background: 'rgba(15, 23, 42, 0.96)',
        borderColor: 'rgba(148,163,184,0.45)',
        color: currentColors.text,
        boxSizing: 'border-box'
      }}
    >
      {/* Technique Name */}
      <div
        style={{ 
          fontSize: '22px', 
          fontWeight: '700', 
          marginBottom: '4px', 
          color: currentColors.accent,
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          textAlign: 'center'
        }}
      >
        {techniqueName}
      </div>
      
      {/* Technique Description */}
      <div
        style={{ 
          fontSize: '15px', 
          opacity: 0.9, 
          marginBottom: '10px', 
          fontWeight: '500',
          color: currentColors.text,
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          textAlign: 'center'
        }}
      >
        {techniqueDescription}
      </div>
      
      {/* Technique Pattern and Benefits */}
      <div
        style={{ 
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '13px', 
          color: currentColors.accent, 
          fontWeight: '600',
          wordWrap: 'break-word',
          overflowWrap: 'break-word'
        }}
      >
        <span>{techniquePattern}</span>
        <span>•</span>
        <span>{techniqueBenefits}</span>
      </div>
    </div>
  );
};

export default TechniqueInfo;
