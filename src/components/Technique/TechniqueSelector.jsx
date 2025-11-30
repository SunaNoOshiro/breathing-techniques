import React from 'react';
import CustomDropdown from '../Common/CustomDropdown.jsx';
import { useTechniqueOptions } from '../../hooks/useTechniqueOptions.js';
import { useThemeColors } from '../../contexts/ThemeContext.jsx';
import { useLocalization } from '../../contexts/LocalizationContext.jsx';

const baseLabelStyles = (color) => ({
  display: 'block',
  fontSize: '14px',
  marginBottom: '8px',
  fontWeight: '600',
  color
});

export default function TechniqueSelector({
  selectedTechniqueId,
  onChange,
  label,
  hideLabel = false,
  compact = false
}) {
  const techniqueOptions = useTechniqueOptions();
  const currentColors = useThemeColors();
  const { t } = useLocalization();

  const resolvedLabel = label || t('technique');

  return (
    <div style={{ width: '100%' }}>
      {!hideLabel && (
        <label style={baseLabelStyles(currentColors.text)}>
          {resolvedLabel}
        </label>
      )}
      <CustomDropdown
        value={selectedTechniqueId}
        options={techniqueOptions.map(({ value, label: optionLabel }) => ({
          value,
          label: optionLabel
        }))}
        onChange={onChange}
        colors={currentColors}
        size={compact ? 'sm' : 'md'}
      />
    </div>
  );
}
