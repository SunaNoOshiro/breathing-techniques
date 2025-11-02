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

  if (!currentTechnique) {
    return (
      <div style={{
        background: currentColors.panel,
        padding: '16px',
        borderRadius: '8px',
        border: `1px solid ${currentColors.border}`,
        marginBottom: '16px',
        textAlign: 'center',
        maxWidth: isDesktop ? '600px' : 'calc(100vw - 16px)',
        width: isDesktop ? '600px' : 'calc(100vw - 16px)',
        color: currentColors.text,
        boxSizing: 'border-box'
      }}>
        <div>{t('noTechniqueSelected')}</div>
      </div>
    );
  }

  const techniqueId = currentTechnique.getId();
  const techniqueName = t(`techniques.${techniqueId}.name`) || currentTechnique.getName();
  const techniqueDescription = t(`techniques.${techniqueId}.description`) || currentTechnique.getDescription();
  const techniqueBenefits = t(`techniques.${techniqueId}.benefits`) || currentTechnique.getBenefits();
  const techniquePattern = currentTechnique.getPattern();

  return (
    <div style={{
      background: currentColors.panel,
      padding: '16px',
      borderRadius: '8px',
      border: `1px solid ${currentColors.border}`,
      marginBottom: '16px',
      textAlign: 'center',
      maxWidth: isDesktop ? '600px' : 'calc(100vw - 16px)',
      width: isDesktop ? '600px' : 'calc(100vw - 16px)',
      boxSizing: 'border-box'
    }}>
      {/* Technique Name */}
      <div style={{ 
        fontSize: '20px', 
        fontWeight: '700', 
        marginBottom: '6px', 
        color: currentColors.accent,
        wordWrap: 'break-word',
        overflowWrap: 'break-word'
      }}>
        {techniqueName}
      </div>
      
      {/* Technique Description */}
      <div style={{ 
        fontSize: '16px', 
        opacity: 0.9, 
        marginBottom: '8px', 
        fontWeight: '500',
        color: currentColors.text,
        wordWrap: 'break-word',
        overflowWrap: 'break-word'
      }}>
        {techniqueDescription}
      </div>
      
      {/* Technique Pattern and Benefits */}
      <div style={{ 
        fontSize: '14px', 
        color: currentColors.accent, 
        fontWeight: '600',
        wordWrap: 'break-word',
        overflowWrap: 'break-word'
      }}>
        Pattern: {techniquePattern} • Benefits: {techniqueBenefits}
      </div>
    </div>
  );
};

export default TechniqueInfo;
