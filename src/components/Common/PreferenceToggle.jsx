import React from 'react';

export default function PreferenceToggle({
  name,
  label,
  checked,
  onChange,
  colors,
  onLabel = 'On',
  offLabel = 'Off'
}) {
  return (
    <div>
      <label style={{
        display: 'block',
        fontSize: '14px',
        marginBottom: '8px',
        fontWeight: '600',
        color: colors.text
      }}>
        {label}
      </label>
      <div style={{ display: 'flex', gap: '16px' }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '16px',
          color: colors.text,
          cursor: 'pointer'
        }}>
          <input
            type="radio"
            name={name}
            checked={checked}
            onChange={() => onChange(true)}
            style={{
              transform: 'scale(1.2)',
              accentColor: colors.accent,
              cursor: 'pointer'
            }}
          />
          {onLabel}
        </label>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '16px',
          color: colors.text,
          cursor: 'pointer'
        }}>
          <input
            type="radio"
            name={name}
            checked={!checked}
            onChange={() => onChange(false)}
            style={{
              transform: 'scale(1.2)',
              accentColor: colors.accent,
              cursor: 'pointer'
            }}
          />
          {offLabel}
        </label>
      </div>
    </div>
  );
}
