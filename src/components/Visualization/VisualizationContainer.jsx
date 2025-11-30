/**
 * Visualization Container Component
 * Handles the main visualization area with breathing figure and points
 */

import React, { useMemo, useRef, useState, useCallback } from 'react';
import { useBreathingSession } from '../../hooks/index.js';
import { useThemeColors } from '../../contexts/ThemeContext.jsx';
import { useLocalization } from '../../contexts/LocalizationContext.jsx';
import { useResponsive } from '../../hooks/index.js';
import { useTechnique } from '../../hooks/index.js';
import { generateThemeColors } from '../../utils/colorUtils.js';
import { computeLungPaintFromTechnique } from '../../utils/colorUtils.js';
import { ANIMATION_CONFIG } from '../../utils/animationUtils.js';
import { visualizationModeManager } from '../../visualizations/index.js';
import Logger from '../../utils/Logger.js';

/**
 * Visualization Container Component
 * Renders the main breathing visualization area
 */
const VisualizationContainer = () => {
  const { currentPhase, sessionStats, isRunning } = useBreathingSession();
  const currentColors = useThemeColors();
  const { t } = useLocalization();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const { currentTechnique, visualizationPoints } = useTechnique();

  // Reference to container element for dimension tracking
  const containerRef = useRef(null);

  // Visualization mode switching via Strategy manager
  const [currentModeKey, setCurrentModeKey] = useState(
    visualizationModeManager.getDefaultKey() || 'classic'
  );

  const goPrevMode = useCallback(() => {
    setCurrentModeKey((key) => visualizationModeManager.getPrevKey(key) || key);
  }, []);

  const goNextMode = useCallback(() => {
    setCurrentModeKey((key) => visualizationModeManager.getNextKey(key) || key);
  }, []);

  // Calculate container dimensions based on screen size
  const containerDimensions = useMemo(() => {
    if (isDesktop) {
      return { width: 600, height: 500 };
    } else if (isTablet) {
      return { width: 500, height: 450 };
    } else {
      // Mobile: calculate based on window width minus padding and borders
      const screenWidth = window.innerWidth;
      const mainContentPadding = 16; // 8px on each side from main-content
      const borderWidth = 4; // 2px border on each side
      const availableWidth = Math.max(
        Math.min(screenWidth - mainContentPadding - borderWidth, screenWidth * 0.95),
        280 // minimum width
      );
      return { width: availableWidth, height: 400 };
    }
  }, [isDesktop, isTablet, isMobile]);

  // Calculate active point index (phase-aligned, zero-latency)
  const activePointIndex = useMemo(() => {
    if (!currentPhase || !currentTechnique || !sessionStats) return 0;
    const totalDuration = currentTechnique.getTotalDuration();
    const elapsedInCycle = sessionStats.elapsedSeconds % totalDuration;

    // Align to current phase progression using timeInPhase for exact step mapping
    const perPhaseOffsets = currentTechnique.getDurationsSec().reduce((acc, d, i) => {
      acc.push((acc[i - 1] || 0) + (i === 0 ? 0 : currentTechnique.getDurationsSec()[i - 1]));
      return acc;
    }, []);

    const phaseBaseIndex = perPhaseOffsets[currentPhase.phaseIndex] || 0;
    const indexInPhase = Math.min(currentPhase.timeInPhase, currentPhase.duration - 1);
    return phaseBaseIndex + indexInPhase;
  }, [currentPhase, currentTechnique, sessionStats]);

  // Debug logging (after all variables are defined)
  Logger.debug('component', 'VisualizationContainer - currentTechnique:', currentTechnique);
  Logger.debug('component', 'VisualizationContainer - currentPhase:', currentPhase);
  Logger.debug('component', 'VisualizationContainer - sessionStats:', sessionStats);
  Logger.debug('component', 'VisualizationContainer - visualizationPoints:', visualizationPoints);
  Logger.debug('component', 'VisualizationContainer - activePointIndex:', activePointIndex);

  // Calculate lung scaling and paint
  const lungData = useMemo(() => {
    if (!currentPhase || !currentTechnique || !currentPhase.phase?.key) {
      return { scaling: 1, paint: { fill: 'transparent', stroke: currentColors.stroke } };
    }

    const lungScaling = currentTechnique.getLungScaling(
      currentPhase.phase.key,
      currentPhase.timeInPhase,
      currentPhase.duration
    );

    // Allow color gradient to progress during hold phases as well
    const paintStepIndex = currentPhase.timeInPhase;
    const lungPaint = computeLungPaintFromTechnique(
      currentTechnique,
      currentPhase.phase.key,
      paintStepIndex,
      currentPhase.duration
    );

    return { scaling: lungScaling, paint: lungPaint };
  }, [currentPhase, currentTechnique, currentColors.stroke]);

  // Calculate diaphragm offset
  const diaphragmOffset = useMemo(() => {
    if (!currentTechnique) return 0;
    return currentTechnique.getDiaphragmOffset(lungData.scaling);
  }, [currentTechnique, lungData.scaling]);

  // Generate theme colors for points
  const themeColors = useMemo(() => {
    return generateThemeColors(sessionStats?.cyclesCompleted || 0, currentColors.themeKey || 'dark');
  }, [sessionStats?.cyclesCompleted, currentColors.themeKey]);

  if (!currentTechnique) {
    return (
      <div 
        className="visualization-container" 
        style={{ 
          width: `${containerDimensions.width}px`,
          height: `${containerDimensions.height}px`,
          background: currentColors.panel,
          border: `2px solid ${currentColors.border}`,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: currentColors.text
        }}
      >
        <div>{t('noTechniqueSelected')}</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="visualization-container"
      style={{
        position: 'relative',
        width: `${containerDimensions.width}px`,
        height: `${containerDimensions.height}px`,
        maxWidth: isMobile ? 'calc(100vw - 16px)' : `${containerDimensions.width}px`,
        background: `linear-gradient(145deg, ${currentColors.panel}f2, ${currentColors.panel})`,
        border: `1.5px solid ${currentColors.border}`,
        borderRadius: '22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        overflow: 'hidden',
        boxShadow: `0 24px 60px ${currentColors.shadow || 'rgba(0,0,0,0.28)'}`
      }}
    >
      {visualizationModeManager.render(currentModeKey, {
        visualizationPoints,
        isRunning,
        activePointIndex,
        currentTechnique,
        themeColors,
        currentColors,
        containerDimensions,
        currentPhase,
        lungData,
        diaphragmOffset
      })}

      {/* Visualization mode label */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 12,
        background: `${currentColors.panel}e8`,
        backdropFilter: 'blur(8px)',
        border: `1px solid ${currentColors.border}`,
        borderRadius: '16px',
        padding: '6px 14px',
        color: currentColors.text,
        fontSize: '13px',
        fontWeight: '600',
        whiteSpace: 'nowrap',
        opacity: 0.9,
        userSelect: 'none'
      }}>
        {t(visualizationModeManager.getMode(currentModeKey)?.getLabel() || 'visualization.classic')}
      </div>

      <div className="visualization-nav" aria-label={t('visualizationMode')}>
        <button
          type="button"
          aria-label={t('prevVisualization')}
          onClick={goPrevMode}
          className="pill-button"
        >
          ←
        </button>
        <button
          type="button"
          aria-label={t('nextVisualization')}
          onClick={goNextMode}
          className="pill-button"
        >
          →
        </button>
      </div>
    </div>
  );
};

export default VisualizationContainer;
