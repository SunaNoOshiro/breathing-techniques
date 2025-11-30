import React from 'react';
import { useThemeColors, useTheme } from '../../contexts/ThemeContext.jsx';
import { useLocalization } from '../../contexts/LocalizationContext.jsx';
import { useAccessibility } from '../../hooks/index.js';

export default function DesktopStatus({ currentPhase, isRunning, isPaused, onPlayPause }) {
  const currentColors = useThemeColors();
  const { t } = useLocalization();
  const { prefersReducedMotion } = useAccessibility();
  const { getCurrentTheme } = useTheme();

  const { text: themeTextColor } = getCurrentTheme?.() || {};

  const label = (currentPhase ? t(currentPhase.key || currentPhase.phase?.key || 'inhale') : t('ready'));
  const timeLabel = currentPhase
    ? Math.ceil(currentPhase.timeLeft || currentPhase.timeRemaining || currentPhase.duration || 0)
    : '—';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
        textAlign: 'left',
        marginTop: '16px',
        padding: '16px 24px',
        background: currentColors.panel,
        borderRadius: '16px',
        border: `1px solid ${currentColors.border}`,
        maxWidth: '720px',
        width: '100%',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
      }}
      role="status"
      aria-live="polite"
      aria-label={t('sessionStatus')}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start', flex: 1 }}>
        <div
          style={{
            fontSize: '24px',
            fontWeight: '700',
            color: currentColors.accent,
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}
          aria-label={t('currentPhase')}
        >
          {label}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <div
            style={{
              fontSize: '40px',
              fontWeight: '300',
              color: themeTextColor || currentColors.text,
              letterSpacing: '-1px'
            }}
            aria-label={t('timeRemaining')}
          >
            {timeLabel}
          </div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: '500',
              color: currentColors.text,
              opacity: 0.7,
              textTransform: 'none',
              letterSpacing: '0.5px'
            }}
          >
            {currentPhase ? t('secLeft') : t('pressToStart')}
          </div>
        </div>
      </div>

      <button
        onClick={onPlayPause}
        style={{
          background: (isRunning || isPaused)
            ? '#ef4444'
            : currentColors.accent,
          color: '#ffffff',
          fontSize: '15px',
          fontWeight: '600',
          cursor: 'pointer',
          padding: '14px 28px',
          borderRadius: '24px',
          border: 'none',
          transition: prefersReducedMotion ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: (isRunning || isPaused)
            ? '0 4px 12px rgba(239, 68, 68, 0.3)'
            : `0 4px 12px ${currentColors.accent}40`,
          minWidth: '140px',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}
        onMouseEnter={(e) => {
          if (!prefersReducedMotion) {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = (isRunning || isPaused)
              ? '0 6px 16px rgba(239, 68, 68, 0.4)'
              : `0 6px 16px ${currentColors.accent}50`;
          }
        }}
        onMouseLeave={(e) => {
          if (!prefersReducedMotion) {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = (isRunning || isPaused)
              ? '0 4px 12px rgba(239, 68, 68, 0.3)'
              : `0 4px 12px ${currentColors.accent}40`;
          }
        }}
        onMouseDown={(e) => {
          if (!prefersReducedMotion) {
            e.target.style.transform = 'scale(0.96)';
          }
        }}
        onMouseUp={(e) => {
          if (!prefersReducedMotion) {
            e.target.style.transform = 'translateY(-2px)';
          }
        }}
        aria-label={(isRunning || isPaused) ? t('stopSession') : t('startSession')}
        aria-pressed={isRunning || isPaused}
      >
        {(isRunning || isPaused) ? t('stop') : t('start')}
      </button>
    </div>
  );
}
