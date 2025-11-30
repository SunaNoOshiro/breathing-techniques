import React, { useMemo } from 'react';
import { VisualizationMode } from '../VisualizationMode.js';
import BreathingFigure from '../../components/Visualization/BreathingFigure.jsx';
import VisualizationPoint from '../../components/Visualization/VisualizationPoint.jsx';

const ClassicCosmicBackdrop = ({ width = 0, height = 0, themeColors, currentColors }) => {
  const cx = width / 2;
  const cy = height / 2;
  const gradientId = useMemo(() => `classic-cosmic-${Math.random().toString(36).slice(2)}`, []);
  const glowId = useMemo(() => `classic-glow-${Math.random().toString(36).slice(2)}`, []);
  const starField = useMemo(() => {
    if (!width || !height) return [];
    const radius = Math.min(width, height) * 0.48;
    return Array.from({ length: 20 }, (_, i) => {
      const angle = (i * 123 * Math.PI) / 180;
      const r = radius * (0.28 + (i % 6) * 0.08);
      return {
        x: cx + Math.cos(angle) * r * 0.35,
        y: cy + Math.sin(angle) * r * 0.35,
        size: 1.1 + (i % 5) * 0.55,
        opacity: 0.2 + (i % 4) * 0.1
      };
    });
  }, [width, height, cx, cy]);

  if (!width || !height) return null;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor={themeColors?.active || '#74f9ff'} stopOpacity="0.45" />
          <stop offset="45%" stopColor={currentColors?.active || '#7dd3fc'} stopOpacity="0.25" />
          <stop offset="100%" stopColor={themeColors?.idle || '#0f172a'} stopOpacity="0" />
        </radialGradient>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="22" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={Math.min(width, height) * 0.48}
          fill={`url(#${gradientId})`}
          style={{ filter: `url(#${glowId})` }}
        />
        <circle
          cx={cx}
          cy={cy}
          r={Math.min(width, height) * 0.52}
          fill="none"
          stroke={themeColors?.active || '#7dd3fc'}
          strokeWidth={Math.max(1.2, Math.min(width, height) * 0.005)}
          opacity={0.35}
          style={{ filter: `url(#${glowId})` }}
        />
        {starField.map((star, idx) => (
          <circle
            key={`classic-star-${idx}`}
            cx={star.x}
            cy={star.y}
            r={star.size}
            fill={themeColors?.active || '#7dd3fc'}
            opacity={star.opacity}
          />
        ))}
      </g>
    </svg>
  );
};

export class ClassicVisualization extends VisualizationMode {
  getKey() { return 'classic'; }
  getLabel() { return 'visualization.classic'; }

  render(props) {
    const {
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
    } = props;

    return (
      <>
        <ClassicCosmicBackdrop
          width={containerDimensions?.width}
          height={containerDimensions?.height}
          themeColors={themeColors}
          currentColors={currentColors}
        />
        {visualizationPoints.map((point, idx) => {
          const isActive = isRunning && idx === activePointIndex;
          const isDone = isRunning && idx <= activePointIndex;
          return (
            <VisualizationPoint
              key={idx}
              point={point}
              isActive={isActive}
              isDone={isDone}
              currentTechnique={currentTechnique}
              themeColors={themeColors}
              currentColors={currentColors}
              containerDimensions={containerDimensions}
            />
          );
        })}
        {currentTechnique && (
          <BreathingFigure
            currentTechnique={currentTechnique}
            currentPhase={currentPhase}
            lungData={lungData}
            diaphragmOffset={diaphragmOffset}
            currentColors={currentColors}
            containerDimensions={containerDimensions}
          />
        )}
      </>
    );
  }
}




