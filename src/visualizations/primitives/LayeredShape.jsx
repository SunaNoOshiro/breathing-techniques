/**
 * LayeredShape Visualization
 * Renders a stack of filled shapes (circle or triangle) with smooth
 * crossfade between layers across the current phase. On phase change,
 * colors update smoothly based on technique palettes.
 */

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { computeLungPaintFromTechnique } from '../../utils/colorUtils.js';
import { ANIMATION_UTILS } from '../../utils/animationUtils.js';
// LayeredShape now depends on a ShapeRenderer strategy (DIP)

const clamp01 = (v) => Math.max(0, Math.min(1, v));

function withAlpha(rgbString, alpha) {
  const m = rgbString.match(/rgb\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\)/i);
  if (m) {
    const r = parseInt(m[1], 10);
    const g = parseInt(m[2], 10);
    const b = parseInt(m[3], 10);
    return `rgba(${r}, ${g}, ${b}, ${clamp01(alpha)})`;
  }
  const ma = rgbString.match(/rgba\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([0-9.]+)\)/i);
  if (ma) {
    const r = parseInt(ma[1], 10);
    const g = parseInt(ma[2], 10);
    const b = parseInt(ma[3], 10);
    return `rgba(${r}, ${g}, ${b}, ${clamp01(alpha)})`;
  }
  return rgbString;
}

const LayeredShape = ({
  shapeRenderer,
  rendererSelector, // optional: (layerIndex, context) => ShapeRenderer
  currentTechnique,
  currentPhase,
  currentColors,
  containerDimensions
}) => {
  const { width, height } = containerDimensions || { width: 0, height: 0 };

  const gradientId = useMemo(
    () => `layered-cosmic-${Math.random().toString(36).slice(2)}`,
    []
  );
  const glowId = useMemo(
    () => `layered-glow-${Math.random().toString(36).slice(2)}`,
    []
  );

  const computed = useMemo(() => {
    if (!currentTechnique || !currentPhase || !currentPhase.phase?.key) {
      return {
        baseSize: 0,
        progress: 0,
        stepsCount: 4,
        brightColor: currentColors?.active || 'rgba(255,255,255,0.7)',
        dimColor: currentColors?.idle || 'rgba(255,255,255,0.2)'
      };
    }

    const baseSize = Math.min(width, height) * 0.75;
    const duration = Math.max(1, currentPhase.duration || 1);
    const timeInPhase = Math.max(0, Math.min(currentPhase.timeInPhase || 0, duration));
    const progress = clamp01(timeInPhase / duration);

    const paint = computeLungPaintFromTechnique(
      currentTechnique,
      currentPhase.phase.key,
      timeInPhase,
      duration
    );

    const brightColor = withAlpha(paint.fill, 0.6);
    const dimColor = withAlpha(paint.fill, 0.18);

    return { baseSize, progress, stepsCount: Math.round(duration), brightColor, dimColor };
  }, [currentTechnique, currentPhase, currentColors, width, height]);

  const { baseSize, progress, stepsCount, brightColor, dimColor } = computed;
  const cx = width / 2;
  const cy = height / 2;

  const starField = useMemo(() => {
    if (!width || !height) return [];
    const count = 18;
    const radius = Math.min(width, height) * 0.45;
    return Array.from({ length: count }, (_, i) => {
      const angle = (i * 137.5 * Math.PI) / 180;
      const r = radius * (0.35 + (i % 5) * 0.08);
      return {
        x: cx + Math.cos(angle) * r * 0.35,
        y: cy + Math.sin(angle) * r * 0.35,
        size: 1.4 + (i % 4) * 0.7,
        opacity: 0.25 + (i % 3) * 0.12
      };
    });
  }, [width, height, cx, cy]);

  const totalLayers = Math.max(2, stepsCount);
  const scaled = progress * totalLayers;
  const activeIndex = Math.floor(scaled);
  const localT = clamp01(scaled - activeIndex);

  // Simple geometric sequence for sizes; visually balanced and cheap
  const ratio = 0.85;
  const sizeFactors = Array.from({ length: totalLayers }, (_, i) => Math.pow(ratio, i));

  const phaseKey = currentPhase?.phase?.key || '';
  const lastPhaseKeyRef = useRef(phaseKey);
  const cleanupRef = useRef(null);
  const [prevSnapshot, setPrevSnapshot] = useState(null);
  const [prevOpacity, setPrevOpacity] = useState(0);

  useEffect(() => {
    const lastKey = lastPhaseKeyRef.current;
    if (!lastKey) {
      lastPhaseKeyRef.current = phaseKey;
      return;
    }

    if (lastKey !== phaseKey) {
      const prevTotal = Math.max(2, stepsCount || 2);
      const innerFactor = Math.pow(ratio, prevTotal - 1);
      const innerSize = Math.min(width, height) * 0.75 * innerFactor;

      const snapshot = { cx, cy, size: innerSize, color: brightColor, layerIndex: prevTotal - 1 };
      setPrevSnapshot(snapshot);

      if (!ANIMATION_UTILS.prefersReducedMotion()) {
        setPrevOpacity(1);
        requestAnimationFrame(() => setPrevOpacity(0));
        if (cleanupRef.current) clearTimeout(cleanupRef.current);
        cleanupRef.current = setTimeout(() => { setPrevSnapshot(null); }, 450);
      } else {
        setPrevSnapshot(null);
      }

      lastPhaseKeyRef.current = phaseKey;
    }
  }, [phaseKey, stepsCount, ratio, width, height, cx, cy, brightColor]);

  if (baseSize <= 0) return null;

  const smooth = ANIMATION_UTILS.transition({ property: 'opacity, transform, fill', duration: 400, easing: 'ease-in-out' });

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor={withAlpha(brightColor, 0.95)} />
          <stop offset="50%" stopColor={withAlpha(brightColor, 0.45)} />
          <stop offset="100%" stopColor={withAlpha(dimColor, 0.2)} />
        </radialGradient>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="12" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g>
        {starField.map((star, idx) => (
          <circle
            key={`star-${idx}`}
            cx={star.x}
            cy={star.y}
            r={star.size}
            fill={withAlpha(brightColor, star.opacity)}
            opacity={star.opacity}
          />
        ))}
      </g>
      {prevSnapshot && (
        <g style={{ ...smooth, opacity: prevOpacity }}>
          {(rendererSelector
            ? rendererSelector(prevSnapshot.layerIndex)
            : shapeRenderer
          )?.render(prevSnapshot.cx, prevSnapshot.cy, prevSnapshot.size, prevSnapshot.color)}
        </g>
      )}

      {sizeFactors.map((factor, i) => {
        const size = Math.min(width, height) * 0.75 * factor;
        let color = dimColor;
        let opacity = 0.9;
        let fillTarget = color;
        if (i < activeIndex) {
          color = dimColor;
          opacity = 0.35;
        } else if (i === activeIndex) {
          const brightOpacity = 1.0 * (1 - localT);
          const dimOpacity = 0.35 * localT;
          color = brightColor;
          opacity = brightOpacity + dimOpacity;
          fillTarget = `url(#${gradientId})`;
        } else if (i === activeIndex + 1) {
          const appear = 1.0 * localT;
          color = brightColor;
          opacity = appear;
          fillTarget = `url(#${gradientId})`;
        } else {
          color = 'transparent';
          opacity = 0;
        }

        const rendererForLayer = rendererSelector ? rendererSelector(i, { activeIndex, localT, totalLayers, cx, cy }) : shapeRenderer;
        return (
          <g key={i} style={{ ...smooth, opacity, filter: `url(#${glowId})` }}>
            {rendererForLayer && rendererForLayer.render(cx, cy, size, fillTarget)}
          </g>
        );
      })}
    </svg>
  );
};

export default LayeredShape;


