/**
 * Mobile Bottom Navigation Component
 * Bottom navigation bar for mobile layout
 */

import React from 'react';
import { useThemeColors } from '../../contexts/ThemeContext.jsx';
import { useLocalization } from '../../contexts/LocalizationContext.jsx';
import { useBreathingSession, useAccessibility } from '../../hooks/index.js';

/**
 * Mobile Bottom Navigation Component
 * Displays hamburger menu, status, and play/pause button
 */
const MobileBottomNav = ({ onSettingsClick, onPlayPause }) => {
  const currentColors = useThemeColors();
  const { t } = useLocalization();
  const { currentPhase, isRunning } = useBreathingSession();
  const { prefersReducedMotion } = useAccessibility();

  return (
    <nav 
      className="mobile-bottom-nav"
      style={{ 
        position: 'relative',
        padding: '14px 14px 10px',
        borderTop: `1px solid ${currentColors.border}`,
        background: 'rgba(15, 23, 42, 0.96)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: '100vw',
        boxSizing: 'border-box',
        boxShadow: '0 -18px 40px rgba(15, 23, 42, 0.85)',
        gap: '12px'
      }}
      aria-label={t('sessionControls')}
    >
      {/* Settings icon zone */}
      <button 
        onClick={onSettingsClick}
        className="icon-button icon-button--soft"
        style={{
          color: currentColors.text,
          width: '44px',
          height: '44px',
          fontSize: '22px',
          borderColor: currentColors.border
        }}
        aria-label={t('settings')}
      >
        <span aria-hidden="true">⚙</span>
      </button>

      {/* Status zone */}
      <div style={{ 
        textAlign: 'center',
        flex: 1,
        margin: '0 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        alignItems: 'center'
      }}>
        <div style={{ 
          fontSize: '14px', 
          fontWeight: 600, 
          color: currentColors.accent,
          textTransform: 'uppercase',
          letterSpacing: '0.18em'
        }}>
          {currentPhase?.phase?.key ? t(currentPhase.phase.key) : (currentPhase?.key ? t(currentPhase.key) : t('ready'))}
        </div>
        <div style={{ 
          fontSize: '26px', 
          fontWeight: 300,
          color: currentColors.text,
          letterSpacing: '-1px'
        }}>
          {currentPhase ? Math.ceil(currentPhase.timeLeft || currentPhase.timeRemaining || currentPhase.duration || 0) : '—'}
        </div>
        <div style={{ 
          fontSize: '10px', 
          fontWeight: 500,
          color: currentColors.text,
          opacity: 0.7,
          textTransform: 'uppercase',
          letterSpacing: '0.12em'
        }}>
          {currentPhase ? t('secLeft') : t('pressToStart')}
        </div>
      </div>

      {/* Primary CTA zone - floating pill */}
      <button 
        onClick={onPlayPause}
        className="primary-cta"
        style={{
          position: 'relative',
          transform: 'translateY(-12px)',
          background: isRunning 
            ? '#ef4444' 
            : currentColors.accent,
          color: '#ffffff',
          fontSize: '12px',
          minWidth: '128px',
          padding: '10px 22px',
          boxShadow: isRunning
            ? '0 16px 38px rgba(239, 68, 68, 0.6)'
            : `0 18px 45px ${currentColors.accent}80`
        }}
        onTouchStart={(e) => {
          if (!prefersReducedMotion) {
            e.target.style.transform = 'translateY(-10px) scale(0.97)';
          }
        }}
        onTouchEnd={(e) => {
          if (!prefersReducedMotion) {
            e.target.style.transform = 'translateY(-12px) scale(1)';
          }
        }}
        aria-label={isRunning ? t('stopSession') : t('startSession')}
        aria-pressed={isRunning}
      >
        <span aria-hidden="true" style={{ fontSize: '14px' }}>
          {isRunning ? '◼' : '▶'}
        </span>
        <span>{isRunning ? t('stop') : t('start')}</span>
      </button>
    </nav>
  );
};

export default MobileBottomNav;
