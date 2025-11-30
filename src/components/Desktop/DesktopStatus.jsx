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
      className="panel-card"
      style={{ maxWidth: '760px', width: '100%' }}
      role="status"
      aria-live="polite"
      aria-label={t('sessionStatus')}
    >
      <div className="status-row">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start', flex: 1 }}>
          <div className="section-title" aria-label={t('currentPhase')}>
            {label}
            <span className="status-pill">
              {isRunning ? t('sessionStarted') : isPaused ? t('sessionPaused') : t('ready')}
            </span>
          </div>

          <div className="status-meta">
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
                fontSize: '13px',
                fontWeight: '600',
                color: currentColors.text,
                opacity: 0.8
              }}
            >
              {currentPhase ? t('secLeft') : t('pressToStart')}
            </div>
          </div>
        </div>

        <button
          onClick={onPlayPause}
          className="cta-button"
          style={{
            background: (isRunning || isPaused)
              ? 'linear-gradient(135deg, #f43f5e, #dc2626)'
              : undefined,
            boxShadow: (isRunning || isPaused)
              ? '0 10px 28px rgba(239, 68, 68, 0.36)'
              : undefined,
            transition: prefersReducedMotion ? 'none' : undefined
          }}
          aria-label={(isRunning || isPaused) ? t('stopSession') : t('startSession')}
          aria-pressed={isRunning || isPaused}
        >
          {(isRunning || isPaused) ? t('stop') : t('start')}
        </button>
      </div>
    </div>
  );
}
