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
    <div 
      className="mobile-bottom-nav" 
      style={{ 
        padding: '16px 12px',
        borderTop: `1px solid ${currentColors.border}`,
        background: currentColors.panel,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: '100vw',
        boxSizing: 'border-box',
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.04)'
      }}
    >
      {/* Hamburger Menu - Unified Style */}
      <button 
        onClick={onSettingsClick}
        style={{
          background: 'transparent',
          border: 'none',
          color: currentColors.text,
          fontSize: '28px',
          cursor: 'pointer',
          padding: '8px',
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: prefersReducedMotion ? 'none' : 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: 0.7
        }}
        onTouchStart={(e) => {
          if (!prefersReducedMotion) {
            e.target.style.opacity = '1';
            e.target.style.transform = 'scale(0.9)';
          }
        }}
        onTouchEnd={(e) => {
          if (!prefersReducedMotion) {
            e.target.style.opacity = '0.7';
            e.target.style.transform = 'scale(1)';
          }
        }}
        aria-label={t('settings')}
      >
        ☰
      </button>

      {/* Status Display - Unified Style */}
      <div style={{ 
        textAlign: 'center',
        flex: 1,
        margin: '0 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        alignItems: 'center'
      }}>
        <div style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          color: currentColors.accent,
          textTransform: 'uppercase',
          letterSpacing: '1.5px'
        }}>
          {currentPhase?.phase?.key ? t(currentPhase.phase.key) : (currentPhase?.key ? t(currentPhase.key) : t('ready'))}
        </div>
        <div style={{ 
          fontSize: '32px', 
          fontWeight: '300',
          color: currentColors.text,
          letterSpacing: '-1px'
        }}>
          {currentPhase ? Math.ceil(currentPhase.timeLeft || currentPhase.timeRemaining || currentPhase.duration || 0) : '—'}
        </div>
        <div style={{ 
          fontSize: '11px', 
          fontWeight: '500',
          color: currentColors.text,
          opacity: 0.6,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {currentPhase ? t('secLeft') : t('pressToStart')}
        </div>
      </div>

      {/* Play/Stop Button - Unified Style */}
      <button 
        onClick={onPlayPause}
        style={{
          background: isRunning 
            ? '#ef4444' 
            : currentColors.accent,
          color: '#ffffff',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer',
          padding: '12px 24px',
          borderRadius: '20px',
          border: 'none',
          transition: prefersReducedMotion ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isRunning
            ? '0 4px 12px rgba(239, 68, 68, 0.3)'
            : `0 4px 12px ${currentColors.accent}40`,
          minWidth: '100px',
          textTransform: 'uppercase',
          letterSpacing: '0.8px'
        }}
        onTouchStart={(e) => {
          if (!prefersReducedMotion) {
            e.target.style.transform = 'scale(0.95)';
          }
        }}
        onTouchEnd={(e) => {
          if (!prefersReducedMotion) {
            e.target.style.transform = 'scale(1)';
          }
        }}
        aria-label={isRunning ? t('stopSession') : t('startSession')}
        aria-pressed={isRunning}
      >
        {isRunning ? t('stop') : t('start')}
      </button>
    </div>
  );
};

export default MobileBottomNav;
