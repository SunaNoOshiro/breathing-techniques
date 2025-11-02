/**
 * NestedLayeredShape
 * Like LayeredShape but computes perfectly nested sizes so each inner shape
 * fits entirely inside the previous one. Used only by Random mode to avoid
 * affecting other modes.
 */

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { computeLungPaintFromTechnique } from '../../utils/colorUtils.js';
import { ANIMATION_UTILS } from '../../utils/animationUtils.js';

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

const NestedLayeredShape = ({
  // Strategy providers
  shapeRenderer,
  rendererSelector, // (layerIndex, context) => ShapeRenderer

  // Session-driven inputs
  currentTechnique,
  currentPhase,
  currentColors,
  containerDimensions
}) => {
  const { width, height } = containerDimensions || { width: 0, height: 0 };

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

  if (baseSize <= 0) return null;

  const totalLayers = Math.max(2, stepsCount);
  const scaled = progress * totalLayers;
  const activeIndex = Math.floor(scaled);
  const localT = clamp01(scaled - activeIndex);

  // Geometry helpers
  function pointInPolygon(x, y, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0], yi = polygon[i][1];
      const xj = polygon[j][0], yj = polygon[j][1];
      const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi + 0.000001) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  function fitInnerSize(outerRenderer, outerSize, innerRenderer) {
    const outerPoly = outerRenderer.getPolygonPoints(cx, cy, outerSize);
    let lo = 0, hi = outerSize, best = 0;
    for (let iter = 0; iter < 18; iter++) {
      const mid = (lo + hi) / 2;
      const innerPoly = innerRenderer.getPolygonPoints(cx, cy, mid);
      let allInside = true;
      for (let k = 0; k < innerPoly.length; k++) {
        const [px, py] = innerPoly[k];
        if (!pointInPolygon(px, py, outerPoly)) { allInside = false; break; }
      }
      if (allInside) { best = mid; lo = mid; } else { hi = mid; }
    }
    return Math.max(0, best * 0.997);
  }

  function computePairInnerSize(outerRenderer, innerRenderer, outerSize) {
    const ok = outerRenderer?.getKey?.();
    const ik = innerRenderer?.getKey?.();
    const SQRT3 = Math.sqrt(3);
    
    if (ok === 'circle' && ik === 'triangle') {
      // Circle (outer): size = diameter D; radius R = D/2
      // Triangle inscribed: side a = R*sqrt(3) = (D/2)*sqrt(3) = D*sqrt(3)/2
      return outerSize * SQRT3 / 2;
    }
    
    if (ok === 'triangle' && ik === 'circle') {
      // Triangle (outer): size = base width w
      // Circumradius R = w/sqrt(3)
      // Inradius r = R/2 = w/(2*sqrt(3))
      // Circle diameter D = 2r = w/sqrt(3)
      return outerSize / SQRT3;
    }
    if (ok === 'circle' && ik === 'hexagon') {
      // Regular hexagon inscribed in circle: hex circumradius = R, so hex size (diameter) = 2R = circle size
      // Nudge slightly in to avoid aliasing overlaps
      return outerSize * 0.997;
    }
    if (ok === 'hexagon' && ik === 'circle') {
      // Circle inscribed in hexagon: diameter = 2 * apothem = 2 * (R * sqrt(3)/2) = R*sqrt(3)
      // Hex size uses diameter = 2R => circle diameter = (sqrt(3)/2) * hexDiameter
      return outerSize * (Math.sqrt(3) / 2);
    }
    
    // Square relationships
    if (ok === 'circle' && ik === 'square') {
      // Square inscribed in circle: diagonal = diameter D
      // Side s = D/sqrt(2)
      return outerSize / Math.sqrt(2);
    }
    if (ok === 'square' && ik === 'circle') {
      // Circle inscribed in square: diameter = side s
      return outerSize;
    }
    if (ok === 'square' && ik === 'triangle') {
      // Triangle inscribed in square is complex; use geometric fit
      return fitInnerSize(outerRenderer, outerSize, innerRenderer);
    }
    if (ok === 'triangle' && ik === 'square') {
      // Square inscribed in triangle is complex; use geometric fit
      return fitInnerSize(outerRenderer, outerSize, innerRenderer);
    }
    
    // Octagon and Dodecagon relationships
    if (ok === 'circle' && (ik === 'octagon' || ik === 'dodecagon')) {
      // Regular polygon inscribed in circle: polygon size = circle diameter
      return outerSize * 0.997;
    }
    if ((ok === 'octagon' || ok === 'dodecagon') && ik === 'circle') {
      // Circle inscribed in regular polygon: use apothem
      // For octagon: apothem ≈ 0.924 * R (where R = size/2)
      // For dodecagon: apothem ≈ 0.966 * R
      const apothemRatio = ok === 'octagon' ? 0.924 : 0.966;
      return outerSize * apothemRatio;
    }
    
    // Dodecagon → Octagon
    if (ok === 'dodecagon' && ik === 'octagon') {
      // Use geometric fit for polygon-to-polygon
      return fitInnerSize(outerRenderer, outerSize, innerRenderer);
    }
    
    // Octagon → Hexagon
    if (ok === 'octagon' && ik === 'hexagon') {
      return fitInnerSize(outerRenderer, outerSize, innerRenderer);
    }
    
    // Hexagon → Square
    if (ok === 'hexagon' && ik === 'square') {
      return fitInnerSize(outerRenderer, outerSize, innerRenderer);
    }
    
    // Fallback to geometric fit
    return fitInnerSize(outerRenderer, outerSize, innerRenderer);
  }

  // Build renderers per layer and compute perfectly nested sizes
  const renderersPerLayer = useMemo(() => (
    Array.from({ length: totalLayers }, (_, i) => rendererSelector ? rendererSelector(i, { activeIndex, localT, totalLayers, cx, cy }) : shapeRenderer)
  ), [rendererSelector, shapeRenderer, totalLayers, activeIndex, localT, cx, cy]);

  const sizes = useMemo(() => {
    const arr = new Array(totalLayers).fill(0);
    arr[0] = baseSize;
    for (let i = 0; i < totalLayers - 1; i++) {
      arr[i + 1] = computePairInnerSize(renderersPerLayer[i], renderersPerLayer[i + 1], arr[i]);
    }
    return arr;
  }, [totalLayers, baseSize, renderersPerLayer]);

  // Phase change fade snapshot
  const phaseKey = currentPhase?.phase?.key || '';
  const lastPhaseKeyRef = useRef(phaseKey);
  const cleanupRef = useRef(null);
  const [prevSnapshot, setPrevSnapshot] = useState(null);
  const [prevOpacity, setPrevOpacity] = useState(0);

  useEffect(() => {
    const lastKey = lastPhaseKeyRef.current;
    if (!lastKey) { lastPhaseKeyRef.current = phaseKey; return; }
    if (lastKey !== phaseKey) {
      const prevTotal = Math.max(2, stepsCount || 2);
      const innerSize = sizes[Math.max(0, Math.min(prevTotal - 1, sizes.length - 1))] || 0;
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
  }, [phaseKey, stepsCount, sizes, cx, cy, brightColor]);

  const smooth = ANIMATION_UTILS.transition({ property: 'opacity, transform, fill', duration: 400, easing: 'ease-in-out' });

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
      {prevSnapshot && (
        <g style={{ ...smooth, opacity: prevOpacity }}>
          {renderersPerLayer[Math.max(0, Math.min(prevSnapshot.layerIndex, renderersPerLayer.length - 1))]
            ?.render(prevSnapshot.cx, prevSnapshot.cy, prevSnapshot.size, prevSnapshot.color)}
        </g>
      )}

      {sizes.map((size, i) => {
        let color = dimColor;
        let opacity = 0.9;
        if (i < activeIndex) {
          color = dimColor; opacity = 0.35;
        } else if (i === activeIndex) {
          const brightOpacity = 1.0 * (1 - localT);
          const dimOpacity = 0.35 * localT;
          color = brightColor; opacity = brightOpacity + dimOpacity;
        } else if (i === activeIndex + 1) {
          const appear = 1.0 * localT; color = brightColor; opacity = appear;
        } else {
          color = 'transparent'; opacity = 0;
        }
        const rendererForLayer = renderersPerLayer[i];
        return (
          <g key={i} style={{ ...smooth, opacity }}>
            {rendererForLayer && rendererForLayer.render(cx, cy, size, color)}
          </g>
        );
      })}
    </svg>
  );
};

export default NestedLayeredShape;


