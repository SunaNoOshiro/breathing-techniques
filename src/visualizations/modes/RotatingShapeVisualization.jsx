import React, { useRef, useMemo } from 'react';
import { VisualizationMode } from '../VisualizationMode.js';
import { computeLungPaintFromTechnique } from '../../utils/colorUtils.js';
import { ANIMATION_UTILS } from '../../utils/animationUtils.js';
import { SquareRenderer } from '../primitives/shapes/SquareRenderer.jsx';
import { PentagonRenderer } from '../primitives/shapes/PentagonRenderer.jsx';
import { HexagonRenderer } from '../primitives/shapes/HexagonRenderer.jsx';
import { HeptagonRenderer } from '../primitives/shapes/HeptagonRenderer.jsx';
import { OctagonRenderer } from '../primitives/shapes/OctagonRenderer.jsx';
import { NonagonRenderer } from '../primitives/shapes/NonagonRenderer.jsx';
import { DecagonRenderer } from '../primitives/shapes/DecagonRenderer.jsx';
import { HendecagonRenderer } from '../primitives/shapes/HendecagonRenderer.jsx';
import { DodecagonRenderer } from '../primitives/shapes/DodecagonRenderer.jsx';

// Create renderers once outside the component (4 to 12 sides)
const allRenderersOrdered = [
  new SquareRenderer(),      // 4 sides
  new PentagonRenderer(),    // 5 sides
  new HexagonRenderer(),     // 6 sides
  new HeptagonRenderer(),    // 7 sides
  new OctagonRenderer(),     // 8 sides
  new NonagonRenderer(),     // 9 sides
  new DecagonRenderer(),     // 10 sides
  new HendecagonRenderer(),  // 11 sides
  new DodecagonRenderer()    // 12 sides
];

// Helper function to get next renderer
// First cycle: ordered sequence, After: random (avoiding last 2)
function getNextRenderer(currentIndex, history) {
  // If we're still in the ordered cycle (haven't completed all shapes once)
  if (currentIndex < allRenderersOrdered.length) {
    return {
      renderer: allRenderersOrdered[currentIndex],
      nextIndex: currentIndex + 1
    };
  }
  
  // After first cycle: random selection avoiding last 2 shapes
  const lastTwo = history.slice(-2).map(r => r.getKey());
  const availableRenderers = allRenderersOrdered.filter(r => !lastTwo.includes(r.getKey()));
  
  // Fallback if somehow no renderers available
  if (availableRenderers.length === 0) {
    return {
      renderer: allRenderersOrdered[0],
      nextIndex: currentIndex + 1
    };
  }
  
  // Pick random from available
  const randomIndex = Math.floor(Math.random() * availableRenderers.length);
  return {
    renderer: availableRenderers[randomIndex],
    nextIndex: currentIndex + 1
  };
}

// Wrapper component with rotation
function RotatingShapeWrapper(props) {
  const {
    currentTechnique,
    currentPhase,
    currentColors,
    containerDimensions
  } = props;

  const phaseKey = currentPhase?.phase?.key || '';
  const currentRendererRef = useRef(null);
  const shapeIndexRef = useRef(0);
  const historyRef = useRef([]);
  const lastPhaseKeyRef = useRef(phaseKey);

  // When phase changes, select next renderer immediately (no transition animation)
  if (phaseKey !== lastPhaseKeyRef.current && lastPhaseKeyRef.current !== '') {
    lastPhaseKeyRef.current = phaseKey;
    
    const { renderer, nextIndex } = getNextRenderer(shapeIndexRef.current, historyRef.current);
    currentRendererRef.current = renderer;
    shapeIndexRef.current = nextIndex;
    historyRef.current = [...historyRef.current.slice(-9), renderer];
  }

  // Initialize on first render
  if (!currentRendererRef.current) {
    const { renderer, nextIndex } = getNextRenderer(0, []);
    currentRendererRef.current = renderer;
    shapeIndexRef.current = nextIndex;
    historyRef.current = [renderer];
    lastPhaseKeyRef.current = phaseKey;
  }


  const { width, height } = containerDimensions || { width: 0, height: 0 };

  // Helper function for alpha blending
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const withAlpha = (rgbString, alpha) => {
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
  };

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
  }, [currentTechnique, currentPhase, currentColors, width, height, withAlpha]);

  const { baseSize, progress, stepsCount, brightColor, dimColor } = computed;
  const cx = width / 2;
  const cy = height / 2;

  const totalLayers = Math.max(2, stepsCount);
  const scaled = progress * totalLayers;
  const activeIndex = Math.floor(scaled);
  const localT = clamp01(scaled - activeIndex);

  // LINEAR percentage scaling: 100%, 90%, 80%, 70%... based on totalLayers
  const sizeFactors = Array.from({ length: totalLayers }, (_, i) => {
    return 1 - (i / totalLayers); // Layer 0: 100%, Layer 1: 90% (if 10 layers), etc.
  });

  const baseRenderer = currentRendererRef.current;
  const sides = baseRenderer?.sides || 3;
  const rotationPerLayer = 360 / sides / 2;

  const smooth = ANIMATION_UTILS.transition({ property: 'opacity, transform, fill, stroke', duration: 400, easing: 'ease-in-out' });
  const gradientId = useMemo(() => `rotating-gradient-${Math.random().toString(36).slice(2)}`, []);
  const glowId = useMemo(() => `rotating-glow-${Math.random().toString(36).slice(2)}`, []);

  const starField = useMemo(() => {
    if (!width || !height) return [];
    const count = 14;
    const radius = Math.min(width, height) * 0.5;
    return Array.from({ length: count }, (_, i) => {
      const angle = (i * 104 * Math.PI) / 180;
      const r = radius * (0.3 + (i % 4) * 0.07);
      return {
        x: cx + Math.cos(angle) * r * 0.38,
        y: cy + Math.sin(angle) * r * 0.38,
        size: 1.15 + (i % 4) * 0.45,
        opacity: 0.14 + (i % 3) * 0.09
      };
    });
  }, [width, height, cx, cy]);

  if (baseSize <= 0) return null;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="50%" r="68%">
          <stop offset="0%" stopColor={withAlpha(brightColor, 0.85)} />
          <stop offset="58%" stopColor={withAlpha(brightColor, 0.45)} />
          <stop offset="100%" stopColor={withAlpha(dimColor, 0.12)} />
        </radialGradient>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g>
        {starField.map((star, idx) => (
          <circle
            key={`rot-star-${idx}`}
            cx={star.x}
            cy={star.y}
            r={star.size}
            fill={withAlpha(brightColor, star.opacity)}
            opacity={star.opacity}
          />
        ))}
        <circle
          cx={cx}
          cy={cy}
          r={baseSize * 0.53}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={Math.max(1.25, baseSize * 0.009)}
          strokeOpacity={0.2}
          style={{ filter: `url(#${glowId})` }}
        />
      </g>

      {sizeFactors.map((factor, i) => {
        const size = baseSize * factor;
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

        // Calculate rotation for this layer - fixed rotation per layer
        const rotation = i * rotationPerLayer;

        return (
          <g key={i} style={{ ...smooth, opacity, filter: `url(#${glowId})` }} transform={`rotate(${rotation} ${cx} ${cy})`}>
            {baseRenderer && baseRenderer.render(cx, cy, size, fillTarget)}
          </g>
        );
      })}
    </svg>
  );
}

export class RotatingShapeVisualization extends VisualizationMode {
  getKey() { return 'rotating'; }
  getLabel() { return 'visualization.rotating'; }

  render(props) {
    return <RotatingShapeWrapper {...props} />;
  }
}

