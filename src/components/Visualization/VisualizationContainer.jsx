import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocalization } from '../../contexts/LocalizationContext.jsx';
import { useTheme, useThemeColors } from '../../contexts/ThemeContext.jsx';
import { useAccessibility, useBreathingSession, useTechnique } from '../../hooks/index.js';
import { computeLungPaintFromTechnique, generateThemeColors } from '../../utils/colorUtils.js';
import { visualizationModeManager } from '../../visualizations/index.js';
import BreathingSphere from './BreathingSphere.jsx';

const RING_RADIUS = 46;
const HOLD_PHASES = new Set(['hold', 'hold1', 'hold2']);
const MODE_ORDER = ['geometric-cascade', ...visualizationModeManager.getKeys()];
const MODE_LABEL_KEYS = {
  'geometric-cascade': 'geometricCascade',
  classic: 'modeClassic',
  'random-object': 'modeRandom',
  'decreasing-angles': 'modeAngles',
  rotating: 'modeRotating',
  'spiral-dance': 'modeSpiralDance'
};
const MODE_FALLBACK_LABELS = {
  'geometric-cascade': { en: 'Geometric Cascade', uk: 'Геометричний Каскад' },
  classic: { en: 'Classic Flow', uk: 'Класичний Потік' },
  'random-object': { en: 'Organic Pulse', uk: 'Органічний Пульс' },
  'decreasing-angles': { en: 'Angle Cascade', uk: 'Каскад Кутів' },
  rotating: { en: 'Rotating Layers', uk: 'Обертальні Шари' },
  'spiral-dance': { en: 'Spiral Dance', uk: 'Спіральний Танець' }
};

const PHASE_COLORS = {
  inhale: '#2dd4bf',
  hold: '#a78bfa',
  hold1: '#c4b5fd',
  hold2: '#67e8f9',
  exhale: '#8b5cf6'
};

const MotionCircle = motion.circle;

function getPhaseKey(phase) {
  return phase?.phase?.key || phase?.key || 'inhale';
}

function getTargetScale(phaseKey) {
  switch (phaseKey) {
    case 'inhale':
      return 1.5;
    case 'hold':
    case 'hold1':
      return 1.5;
    case 'hold2':
    case 'exhale':
    default:
      return 1;
  }
}

function getPhaseLabel(phaseKey, t) {
  if (phaseKey === 'hold1' || phaseKey === 'hold2') {
    return String(t('hold')).toUpperCase();
  }

  return String(t(phaseKey)).toUpperCase();
}

function formatTime(seconds) {
  const safeSeconds = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

const VisualizationContainer = () => {
  const { t } = useLocalization();
  const { getCurrentTheme } = useTheme();
  const currentColors = useThemeColors();
  const { prefersReducedMotion } = useAccessibility();
  const { currentPhase, isRunning, isPaused, sessionStats } = useBreathingSession();
  const { currentTechnique, visualizationPoints } = useTechnique();

  const [currentModeKey, setCurrentModeKey] = useState(MODE_ORDER[0]);
  const [containerDimensions, setContainerDimensions] = useState({ width: 340, height: 340 });
  const stageRef = useRef(null);
  const touchStartXRef = useRef(null);

  const isActive = isRunning || isPaused;
  const displayPhase = useMemo(() => {
    if (!currentTechnique) {
      return null;
    }

    if (isActive && currentPhase) {
      return currentPhase;
    }

    return currentTechnique.getCurrentPhase(0);
  }, [currentTechnique, currentPhase, isActive]);

  useEffect(() => {
    const element = stageRef.current;
    if (!element) {
      return undefined;
    }

    const updateSize = () => {
      setContainerDimensions({
        width: Math.max(240, Math.round(element.clientWidth)),
        height: Math.max(240, Math.round(element.clientHeight))
      });
    };

    updateSize();

    const observer = new ResizeObserver(() => {
      updateSize();
    });

    observer.observe(element);
    window.addEventListener('resize', updateSize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  const phaseView = useMemo(() => {
    const phaseKey = getPhaseKey(displayPhase);
    const duration = displayPhase?.duration || 4;
    const timeInPhase = displayPhase?.timeInPhase || 0;
    const timeLeft = displayPhase?.timeLeft ?? duration;
    const phaseStartElapsed = Math.max(
      0,
      (sessionStats?.elapsedSeconds || 0) - timeInPhase
    );
    const progress = duration > 0 ? Math.min(Math.max(timeInPhase / duration, 0), 1) : 0;

    return {
      phaseKey,
      duration,
      timeInPhase,
      timeLeft,
      progress,
      label: getPhaseLabel(phaseKey, t),
      color: PHASE_COLORS[phaseKey] || PHASE_COLORS.inhale,
      scale: getTargetScale(phaseKey),
      motionKey: `${displayPhase?.phaseIndex ?? 0}-${phaseStartElapsed}`
    };
  }, [displayPhase, sessionStats?.elapsedSeconds, t]);

  const activePointIndex = useMemo(() => {
    if (!displayPhase || !currentTechnique) {
      return 0;
    }

    const durations = currentTechnique.getDurationsSec();
    const phaseOffset = durations
      .slice(0, displayPhase.phaseIndex || 0)
      .reduce((sum, duration) => sum + duration, 0);

    return phaseOffset + Math.min(displayPhase.timeInPhase || 0, Math.max((displayPhase.duration || 1) - 1, 0));
  }, [displayPhase, currentTechnique]);

  const lungData = useMemo(() => {
    if (!displayPhase || !currentTechnique || !displayPhase.phase?.key) {
      return { scaling: 1, paint: { fill: 'transparent', stroke: currentColors.stroke } };
    }

    const scaling = currentTechnique.getLungScaling(
      displayPhase.phase.key,
      displayPhase.timeInPhase,
      displayPhase.duration
    );

    const paint = computeLungPaintFromTechnique(
      currentTechnique,
      displayPhase.phase.key,
      displayPhase.timeInPhase,
      displayPhase.duration
    );

    return { scaling, paint };
  }, [currentColors.stroke, currentTechnique, displayPhase]);

  const diaphragmOffset = useMemo(() => {
    return currentTechnique?.getDiaphragmOffset?.(lungData.scaling) || 0;
  }, [currentTechnique, lungData.scaling]);

  const themeColors = useMemo(() => {
    return generateThemeColors(
      sessionStats?.cyclesCompleted || 0,
      getCurrentTheme?.() || 'dark'
    );
  }, [getCurrentTheme, sessionStats?.cyclesCompleted]);

  const phaseAnimationStateKey = `${isActive ? 'active' : 'idle'}-${phaseView.motionKey}`;
  const phaseAnimationRef = useRef({
    key: phaseAnimationStateKey,
    duration: prefersReducedMotion
      ? 0.01
      : !isActive
        ? 0.35
        : Math.max(phaseView.duration - phaseView.timeInPhase, 0.35)
  });

  if (phaseAnimationRef.current.key !== phaseAnimationStateKey) {
    phaseAnimationRef.current = {
      key: phaseAnimationStateKey,
      duration: prefersReducedMotion
        ? 0.01
        : !isActive
          ? 0.35
          : Math.max(phaseView.duration - phaseView.timeInPhase, 0.35)
    };
  }

  if (!isActive && phaseAnimationRef.current.duration !== 0.35) {
    phaseAnimationRef.current = { key: phaseView.motionKey, duration: 0.35 };
  }

  if (prefersReducedMotion && phaseAnimationRef.current.duration !== 0.01) {
    phaseAnimationRef.current = { key: phaseView.motionKey, duration: 0.01 };
  }

  const goPrevMode = useCallback(() => {
    setCurrentModeKey((modeKey) => {
      const currentIndex = MODE_ORDER.indexOf(modeKey);
      const nextIndex = currentIndex <= 0 ? MODE_ORDER.length - 1 : currentIndex - 1;
      return MODE_ORDER[nextIndex];
    });
  }, []);

  const goNextMode = useCallback(() => {
    setCurrentModeKey((modeKey) => {
      const currentIndex = MODE_ORDER.indexOf(modeKey);
      const nextIndex = currentIndex === MODE_ORDER.length - 1 ? 0 : currentIndex + 1;
      return MODE_ORDER[nextIndex];
    });
  }, []);

  const handleTouchStart = useCallback((event) => {
    touchStartXRef.current = event.changedTouches[0]?.clientX ?? null;
  }, []);

  const handleTouchEnd = useCallback((event) => {
    if (touchStartXRef.current === null) {
      return;
    }

    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartXRef.current;
    const deltaX = touchEndX - touchStartXRef.current;
    touchStartXRef.current = null;

    if (Math.abs(deltaX) < 48) {
      return;
    }

    if (deltaX < 0) {
      goNextMode();
      return;
    }

    goPrevMode();
  }, [goNextMode, goPrevMode]);

  const modeLabelKey = MODE_LABEL_KEYS[currentModeKey] || 'geometricCascade';
  const currentModeLabel = t(modeLabelKey, {
    fallback: MODE_FALLBACK_LABELS[currentModeKey] || MODE_FALLBACK_LABELS['geometric-cascade']
  });
  const isGeometricMode = currentModeKey === 'geometric-cascade';
  const isCompactStage = containerDimensions.width < 300;
  const totalVisualizationSteps = currentTechnique?.getTotalDuration?.() || visualizationPoints?.length || 0;
  const legacyLayout = useMemo(() => {
    if (isGeometricMode || !isCompactStage) {
      return { sizeRatio: 1, offsetY: 0 };
    }

    switch (currentModeKey) {
      case 'classic':
        if (totalVisualizationSteps >= 20) {
          return { sizeRatio: 0.56, offsetY: -26 };
        }
        if (totalVisualizationSteps >= 16) {
          return { sizeRatio: 0.62, offsetY: -20 };
        }
        return { sizeRatio: 0.68, offsetY: -16 };
      case 'random-object':
        return { sizeRatio: 0.72, offsetY: -6 };
      case 'decreasing-angles':
        return { sizeRatio: 0.74, offsetY: -8 };
      case 'rotating':
        return { sizeRatio: 0.74, offsetY: -8 };
      case 'spiral-dance':
        return { sizeRatio: 0.94, offsetY: 0 };
      default:
        return { sizeRatio: 0.74, offsetY: -8 };
    }
  }, [currentModeKey, isCompactStage, isGeometricMode, totalVisualizationSteps]);
  const legacyRenderDimensions = useMemo(() => ({
    width: Math.max(140, Math.round(containerDimensions.width * legacyLayout.sizeRatio)),
    height: Math.max(140, Math.round(containerDimensions.height * legacyLayout.sizeRatio))
  }), [containerDimensions.height, containerDimensions.width, legacyLayout.sizeRatio]);
  const ringKey = `${phaseAnimationStateKey}-${phaseView.phaseKey}`;
  const ringOffset = isActive ? 1 - phaseView.progress : 1;
  const ringTransition = {
    duration: phaseAnimationRef.current.duration,
    ease: prefersReducedMotion ? 'linear' : 'easeInOut'
  };

  if (!currentTechnique || !displayPhase) {
    return (
      <div className="cascade-visualization cascade-visualization--empty">
        <div className="cascade-visualization__empty-copy">{t('noTechniqueSelected')}</div>
      </div>
    );
  }

  return (
    <section className="cascade-visualization" aria-label={t('breathingApp')}>
      <div className="visualization-mode-switch" aria-label={t('currentPhase')}>
        <button
          type="button"
          className="viz-nav-button"
          onClick={goPrevMode}
          aria-label={t('previousMode')}
        >
          <span aria-hidden="true">←</span>
        </button>
        <div className="visualization-mode-switch__label">{currentModeLabel}</div>
        <button
          type="button"
          className="viz-nav-button"
          onClick={goNextMode}
          aria-label={t('nextMode')}
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>

      <div
        ref={stageRef}
        className={`cascade-visualization__stage${
          isGeometricMode ? '' : ' cascade-visualization__stage--legacy'
        }`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {isGeometricMode ? (
          <>
            <svg className="cascade-ring" viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r={RING_RADIUS} className="cascade-ring__track" />
              <MotionCircle
                key={ringKey}
                cx="50"
                cy="50"
                r={RING_RADIUS}
                className="cascade-ring__progress progress-ring"
                stroke={phaseView.color}
                pathLength={1}
                strokeDasharray={1}
                initial={{ strokeDashoffset: ringOffset }}
                animate={{
                  strokeDashoffset: isActive ? 0 : 1
                }}
                transition={ringTransition}
              />
            </svg>

            <BreathingSphere
              isActive={isActive}
              phaseKey={phaseView.phaseKey}
              scale={phaseView.scale}
              color={phaseView.color}
              duration={phaseAnimationRef.current.duration}
              motionKey={phaseView.motionKey}
              prefersReducedMotion={prefersReducedMotion}
            />

            <div
              className={`cascade-visualization__phase-glow${
                HOLD_PHASES.has(phaseView.phaseKey) ? ' is-holding' : ''
              }`}
              style={{ '--phase-glow': phaseView.color }}
              aria-hidden="true"
            />
          </>
        ) : (
          <div
            className="cascade-visualization__legacy-layer"
            style={{
              width: `${legacyRenderDimensions.width}px`,
              height: `${legacyRenderDimensions.height}px`,
              '--legacy-shift-y': `${legacyLayout.offsetY}px`
            }}
          >
            {visualizationModeManager.render(currentModeKey, {
              visualizationPoints,
              isRunning,
              isActive,
              activePointIndex,
              currentTechnique,
              themeColors,
              currentColors,
              containerDimensions: legacyRenderDimensions,
              currentPhase: displayPhase,
              phaseProgress: phaseView.progress,
              phaseColor: phaseView.color,
              trackColor: currentColors.border,
              cycleIndex: sessionStats?.cyclesCompleted || 0,
              lungData,
              diaphragmOffset,
              prefersReducedMotion
            })}
          </div>
        )}
      </div>

      <div className="cascade-visualization__hud">
        <div className="cascade-phase-label">{phaseView.label}</div>
        <div
          className="cascade-timer"
          aria-live="polite"
          aria-label={`${phaseView.label} ${formatTime(phaseView.timeLeft)}`}
        >
          {formatTime(phaseView.timeLeft)}
        </div>
      </div>
    </section>
  );
};

export default VisualizationContainer;
