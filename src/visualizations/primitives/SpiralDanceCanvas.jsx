import React, { useEffect, useMemo, useRef } from 'react';
import {
  clamp01,
  createSpiralDanceField,
  lerpRgb,
  normalizePhaseKey,
  resolveSpiralCyclePalette,
  resolveSpiralDanceState,
  SPIRAL_DANCE_CONFIG
} from './spiralDanceConfig.js';

const TAU = Math.PI * 2;

function buildBackgroundLayer({ width, height, stars, palette }) {
  if (typeof document === 'undefined') {
    return null;
  }

  const buffer = document.createElement('canvas');
  buffer.width = width;
  buffer.height = height;

  const context = buffer.getContext('2d');

  if (!context) {
    return null;
  }

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.44;

  context.clearRect(0, 0, width, height);

  context.save();
  context.globalAlpha = 0.26;
  context.filter = 'blur(42px)';
  context.fillStyle = palette.nebulaPurple;
  context.beginPath();
  context.ellipse(cx - radius * 0.14, cy - radius * 0.2, radius * 0.62, radius * 0.52, -0.6, 0, TAU);
  context.fill();
  context.fillStyle = palette.nebulaLilac;
  context.beginPath();
  context.ellipse(cx + radius * 0.18, cy + radius * 0.16, radius * 0.54, radius * 0.42, 0.3, 0, TAU);
  context.fill();
  context.restore();

  const backgroundGradient = context.createRadialGradient(
    cx - radius * 0.24,
    cy - radius * 0.3,
    radius * 0.08,
    cx,
    cy,
    radius
  );
  backgroundGradient.addColorStop(0, palette.backgroundInner);
  backgroundGradient.addColorStop(0.56, palette.backgroundMid);
  backgroundGradient.addColorStop(0.84, palette.backgroundOuter);
  backgroundGradient.addColorStop(1, 'rgba(3, 8, 20, 0)');

  context.fillStyle = backgroundGradient;
  context.fillRect(0, 0, width, height);

  const vignette = context.createRadialGradient(cx, cy, radius * 0.12, cx, cy, radius * 1.04);
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(0.74, 'rgba(2, 2, 8, 0.06)');
  vignette.addColorStop(1, 'rgba(2, 2, 10, 0.22)');
  context.fillStyle = vignette;
  context.fillRect(0, 0, width, height);

  context.globalCompositeOperation = 'screen';
  stars.forEach((star) => {
    context.globalAlpha = star.alpha;
    context.fillStyle = star.color.css;
    context.beginPath();
    context.arc(star.x * width, star.y * height, star.size, 0, TAU);
    context.fill();
  });

  context.globalCompositeOperation = 'destination-in';
  const maskGradient = context.createRadialGradient(cx, cy, radius * 0.22, cx, cy, radius * 1.08);
  maskGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  maskGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.98)');
  maskGradient.addColorStop(0.9, 'rgba(255, 255, 255, 0.34)');
  maskGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  context.fillStyle = maskGradient;
  context.fillRect(0, 0, width, height);

  context.globalCompositeOperation = 'screen';
  context.globalAlpha = 0.12;
  context.filter = 'blur(22px)';
  context.fillStyle = palette.nebulaLilac;
  context.beginPath();
  context.arc(cx, cy, radius * 0.94, 0, TAU);
  context.fill();
  context.restore();

  return buffer;
}

function rgba(rgb, alpha) {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

const SpiralDanceCanvas = ({
  containerDimensions,
  currentPhase,
  phaseProgress = 0,
  isActive = false,
  isAnimating = false,
  prefersReducedMotion = false,
  phaseColor = '#2dd4bf',
  trackColor = 'rgba(148, 163, 184, 0.22)',
  cycleIndex = 0,
  particleCount = SPIRAL_DANCE_CONFIG.particleCount
}) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(0);
  const backgroundRef = useRef(null);
  const rotationRef = useRef(0);
  const velocityRef = useRef(0);
  const lastFrameRef = useRef(0);
  const frameDrawerRef = useRef(null);
  const visualStateRef = useRef({
    scale: 0.74,
    armBloom: 0.9,
    glowIntensity: 0.22,
    particleOpacity: 0.48,
    haloOpacity: 0.12,
    twinkleAmplitude: 0.03,
    corePulse: 0.05
  });
  const paletteStateRef = useRef({
    particleBands: [
      [255, 228, 163],
      [215, 192, 255],
      [255, 250, 244]
    ],
    armBands: [
      [255, 228, 163],
      [215, 192, 255],
      [255, 250, 244]
    ],
    starBands: [
      [255, 228, 163],
      [215, 192, 255],
      [255, 250, 244]
    ],
    coreRgb: [255, 247, 221],
    haloRgb: [215, 192, 255],
    nebulaArgb: [120, 64, 255],
    nebulaBrgb: [206, 183, 255],
    ringProgressRgb: [45, 212, 191],
    ringTrackRgb: [72, 82, 108]
  });
  const phaseSnapshotRef = useRef({
    phaseKey: currentPhase?.phase?.key || 'inhale',
    timeInPhase: currentPhase?.timeInPhase ?? 0,
    duration: currentPhase?.duration ?? 1,
    anchorTime: 0
  });

  const width = Math.max(0, containerDimensions?.width || 0);
  const height = Math.max(0, containerDimensions?.height || 0);
  const currentPhaseKey = currentPhase?.phase?.key || 'inhale';
  const currentTimeInPhase = currentPhase?.timeInPhase ?? 0;
  const currentDuration = Math.max(1, currentPhase?.duration || 1);

  const field = useMemo(
    () => createSpiralDanceField({ particleCount }),
    [particleCount]
  );

  const runtimeRef = useRef({
    width,
    height,
    phaseKey: currentPhaseKey,
    phaseProgress: clamp01(phaseProgress),
    currentDuration,
    currentTimeInPhase,
    isActive,
    isAnimating,
    prefersReducedMotion,
    phaseColor,
    trackColor,
    cycleIndex
  });

  runtimeRef.current = {
    width,
    height,
    phaseKey: currentPhaseKey,
    phaseProgress: clamp01(phaseProgress),
    currentDuration,
    currentTimeInPhase,
    isActive,
    isAnimating,
    prefersReducedMotion,
    phaseColor,
    trackColor,
    cycleIndex
  };

  useEffect(() => {
    const now = performance.now();
    const previous = phaseSnapshotRef.current;
    const samePhase = previous.phaseKey === currentPhaseKey && previous.duration === currentDuration;
    const derivedAnchor = now - (currentTimeInPhase * 1000);

    if (!samePhase) {
      phaseSnapshotRef.current = {
        phaseKey: currentPhaseKey,
        timeInPhase: currentTimeInPhase,
        duration: currentDuration,
        anchorTime: derivedAnchor
      };
      return;
    }

    const isExpectedTick = currentTimeInPhase === previous.timeInPhase || currentTimeInPhase === previous.timeInPhase + 1;

    phaseSnapshotRef.current = {
      phaseKey: currentPhaseKey,
      timeInPhase: currentTimeInPhase,
      duration: currentDuration,
      anchorTime: previous.anchorTime && isExpectedTick
        ? previous.anchorTime
        : derivedAnchor
    };
  }, [currentDuration, currentPhaseKey, currentTimeInPhase]);

  useEffect(() => {
    if (!width || !height) {
      backgroundRef.current = null;
      return;
    }

    backgroundRef.current = buildBackgroundLayer({
      width,
      height,
      stars: field.stars,
      palette: SPIRAL_DANCE_CONFIG.palette
    });
  }, [field.stars, height, width]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || !width || !height) {
      return;
    }

    const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * devicePixelRatio);
    canvas.height = Math.round(height * devicePixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }, [height, width]);

  frameDrawerRef.current = (frameTime = performance.now()) => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    const runtime = runtimeRef.current;
    const snapshot = phaseSnapshotRef.current;
    const drawWidth = runtime.width;
    const drawHeight = runtime.height;

    if (!drawWidth || !drawHeight) {
      return;
    }

    let smoothProgress = runtime.phaseProgress;

    if (runtime.isAnimating && !runtime.prefersReducedMotion) {
      const interpolatedTime = Math.min(
        snapshot.duration,
        Math.max(0, (frameTime - snapshot.anchorTime) / 1000)
      );

      smoothProgress = clamp01(interpolatedTime / Math.max(snapshot.duration, 1));
    }

    const state = resolveSpiralDanceState({
      phaseKey: runtime.phaseKey,
      progress: smoothProgress,
      isActive: runtime.isActive
    });
    const targetPalette = resolveSpiralCyclePalette({
      cycleIndex: runtime.cycleIndex,
      phaseColor: runtime.phaseColor
    });

    const deltaSeconds = lastFrameRef.current
      ? Math.min((frameTime - lastFrameRef.current) / 1000, 0.05)
      : 1 / 60;

    lastFrameRef.current = frameTime;

    const visualState = visualStateRef.current;
    const stateBlend = runtime.prefersReducedMotion
      ? 1
      : 1 - Math.exp(-deltaSeconds * (runtime.isAnimating ? 7.5 : 10.5));

    visualState.scale += (state.scale - visualState.scale) * stateBlend;
    visualState.armBloom += (state.armBloom - visualState.armBloom) * stateBlend;
    visualState.glowIntensity += (state.glowIntensity - visualState.glowIntensity) * stateBlend;
    visualState.particleOpacity += (state.particleOpacity - visualState.particleOpacity) * stateBlend;
    visualState.haloOpacity += (state.haloOpacity - visualState.haloOpacity) * stateBlend;
    visualState.twinkleAmplitude += (state.twinkleAmplitude - visualState.twinkleAmplitude) * stateBlend;
    visualState.corePulse += (state.corePulse - visualState.corePulse) * stateBlend;

    const paletteState = paletteStateRef.current;
    const paletteBlend = runtime.prefersReducedMotion
      ? 1
      : 1 - Math.exp(-deltaSeconds * 4.2);

    paletteState.coreRgb = lerpRgb(paletteState.coreRgb, targetPalette.coreRgb, paletteBlend);
    paletteState.haloRgb = lerpRgb(paletteState.haloRgb, targetPalette.haloRgb, paletteBlend);
    paletteState.nebulaArgb = lerpRgb(paletteState.nebulaArgb, targetPalette.nebulaArgb, paletteBlend);
    paletteState.nebulaBrgb = lerpRgb(paletteState.nebulaBrgb, targetPalette.nebulaBrgb, paletteBlend);
    paletteState.ringProgressRgb = lerpRgb(paletteState.ringProgressRgb, targetPalette.ringProgressRgb, paletteBlend);
    paletteState.ringTrackRgb = lerpRgb(paletteState.ringTrackRgb, targetPalette.ringTrackRgb, paletteBlend);
    paletteState.particleBands = paletteState.particleBands.map((rgb, index) => (
      lerpRgb(rgb, targetPalette.particleBands[index], paletteBlend)
    ));
    paletteState.armBands = paletteState.armBands.map((rgb, index) => (
      lerpRgb(rgb, targetPalette.armBands[index], paletteBlend)
    ));
    paletteState.starBands = paletteState.starBands.map((rgb, index) => (
      lerpRgb(rgb, targetPalette.starBands[index], paletteBlend)
    ));

    const targetVelocity = runtime.isAnimating && !runtime.prefersReducedMotion
      ? state.targetVelocity
      : 0;

    const velocityBlend = runtime.prefersReducedMotion
      ? 1
      : 1 - Math.exp(-deltaSeconds * (runtime.isAnimating ? 8.5 : 12));

    velocityRef.current += (targetVelocity - velocityRef.current) * velocityBlend;
    rotationRef.current += velocityRef.current * deltaSeconds;

    const centerX = drawWidth / 2;
    const centerY = drawHeight / 2;
    const stageMin = Math.min(drawWidth, drawHeight);
    const galaxyRadius = stageMin * 0.4;
    const ringRadius = stageMin * 0.455;
    const ringLineWidth = Math.max(3.4, ringRadius * 0.016);
    const timeSeconds = frameTime / 1000;

    context.clearRect(0, 0, drawWidth, drawHeight);

    if (backgroundRef.current) {
      context.drawImage(backgroundRef.current, 0, 0, drawWidth, drawHeight);
    }

    context.save();
    context.globalCompositeOperation = 'screen';
    context.globalAlpha = runtime.isActive ? 0.16 : 0.09;
    context.filter = 'blur(38px)';
    context.fillStyle = rgba(paletteState.nebulaArgb, 0.95);
    context.beginPath();
    context.ellipse(
      centerX - galaxyRadius * 0.12,
      centerY - galaxyRadius * 0.1,
      galaxyRadius * 0.72,
      galaxyRadius * 0.58,
      -0.55,
      0,
      TAU
    );
    context.fill();
    context.fillStyle = rgba(paletteState.nebulaBrgb, 0.88);
    context.beginPath();
    context.ellipse(
      centerX + galaxyRadius * 0.15,
      centerY + galaxyRadius * 0.11,
      galaxyRadius * 0.6,
      galaxyRadius * 0.5,
      0.28,
      0,
      TAU
    );
    context.fill();
    context.restore();

    context.save();
    context.strokeStyle = rgba(paletteState.ringTrackRgb, runtime.isActive ? 0.52 : 0.24);
    context.globalAlpha = runtime.isActive ? 0.42 : 0.24;
    context.lineWidth = ringLineWidth;
    context.beginPath();
    context.arc(centerX, centerY, ringRadius, 0, TAU);
    context.stroke();

    context.strokeStyle = rgba(paletteState.ringProgressRgb, runtime.isActive ? 0.96 : 0.36);
    context.globalAlpha = runtime.isActive ? 0.95 : 0.32;
    context.lineCap = 'round';
    context.shadowColor = rgba(paletteState.ringProgressRgb, 0.9);
    context.shadowBlur = runtime.isActive ? 14 : 0;
    context.beginPath();
    context.arc(
      centerX,
      centerY,
      ringRadius,
      -Math.PI / 2,
      (-Math.PI / 2) + (TAU * clamp01(smoothProgress))
    );
    context.stroke();
    context.restore();

    context.save();
    context.translate(centerX, centerY);

    context.globalCompositeOperation = 'screen';
    context.globalAlpha = 0.18 + visualState.haloOpacity;
    context.filter = `blur(${18 + visualState.glowIntensity * 28}px)`;
    context.fillStyle = rgba(paletteState.haloRgb, 0.85);
    context.beginPath();
    context.arc(0, 0, galaxyRadius * (0.16 + visualState.scale * 0.08), 0, TAU);
    context.fill();

    context.globalAlpha = 0.18 + visualState.glowIntensity * 0.48;
    context.fillStyle = rgba(paletteState.coreRgb, 0.92);
    context.beginPath();
    context.arc(
      0,
      0,
      galaxyRadius * (0.09 + visualState.glowIntensity * 0.06)
        * (1 + Math.sin(timeSeconds * 2.4) * visualState.corePulse * 0.08),
      0,
      TAU
    );
    context.fill();
    context.filter = 'none';

    field.armCurves.forEach((curve, armIndex) => {
      context.beginPath();
      curve.forEach((sample, sampleIndex) => {
        const angle = sample.theta + sample.armOffset + rotationRef.current * 0.9;
      const radius = sample.normalizedRadius * galaxyRadius * visualState.scale * visualState.armBloom;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        if (sampleIndex === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
      });

      context.filter = `blur(${0.7 + visualState.glowIntensity * 1.2}px)`;
      context.globalAlpha = 0.04 + visualState.glowIntensity * 0.055;
      context.strokeStyle = rgba(
        paletteState.armBands[(armIndex + Math.floor(runtime.cycleIndex)) % paletteState.armBands.length],
        0.62
      );
      context.lineWidth = galaxyRadius * (0.0105 + visualState.glowIntensity * 0.005);
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.stroke();

      context.filter = 'none';
      context.globalAlpha = 0.045 + visualState.glowIntensity * 0.05;
      context.strokeStyle = rgba(
        paletteState.armBands[(armIndex + Math.floor(runtime.cycleIndex)) % paletteState.armBands.length],
        0.4
      );
      context.lineWidth = galaxyRadius * (0.0065 + visualState.glowIntensity * 0.0025);
      context.stroke();
    });

    context.filter = 'none';

    context.globalCompositeOperation = 'lighter';

    field.particles.forEach((particle) => {
      const angle = particle.theta
        + particle.armOffset
        + particle.armNoise
        + particle.tangentialNoise
        + rotationRef.current * particle.spinFactor;
      const radius = galaxyRadius
        * visualState.scale
        * visualState.armBloom
        * Math.max(0, particle.normalizedRadius + particle.radialNoise);
      const drift = 1 + Math.sin(timeSeconds * 0.9 + particle.twinkleOffset) * 0.018;
      const x = Math.cos(angle) * radius * drift + particle.offsetX * galaxyRadius;
      const y = Math.sin(angle) * radius * drift + particle.offsetY * galaxyRadius;
      const holdTwinkle = visualState.twinkleAmplitude
        * Math.sin(timeSeconds * (2.2 + particle.spinFactor) + particle.twinkleOffset);
      const opacity = clamp01(
        particle.alpha * visualState.particleOpacity * particle.brightness * 0.95
        + holdTwinkle
      );
      const size = particle.size * (0.62 + visualState.scale * 0.76);

      if (particle.highlight) {
        context.globalAlpha = opacity * 0.22 * (0.45 + visualState.glowIntensity);
        context.fillStyle = rgba(paletteState.particleBands[particle.colorBand % paletteState.particleBands.length], 0.92);
        context.beginPath();
        context.arc(x, y, size * 2.5, 0, TAU);
        context.fill();
      }

      context.globalAlpha = opacity;
      context.fillStyle = rgba(paletteState.particleBands[particle.colorBand % paletteState.particleBands.length], 0.96);
      context.beginPath();
      context.arc(x, y, size, 0, TAU);
      context.fill();
    });

    field.stars.forEach((star) => {
      const starOpacity = star.alpha * (runtime.isActive ? 0.92 : 0.64);
      context.globalAlpha = starOpacity;
      context.fillStyle = rgba(paletteState.starBands[star.colorBand % paletteState.starBands.length], 0.95);
      context.beginPath();
      context.arc((star.x * drawWidth) - centerX, (star.y * drawHeight) - centerY, star.size, 0, TAU);
      context.fill();
    });

    context.globalAlpha = 0.18 + visualState.glowIntensity * 0.42;
    context.fillStyle = rgba(paletteState.coreRgb, 0.96);
    context.beginPath();
    context.arc(0, 0, galaxyRadius * (0.032 + visualState.scale * 0.012), 0, TAU);
    context.fill();

    context.restore();
  };

  useEffect(() => {
    if (!width || !height) {
      return undefined;
    }

    const drawFrame = (frameTime) => {
      frameDrawerRef.current?.(frameTime);

      if (runtimeRef.current.isAnimating && !runtimeRef.current.prefersReducedMotion) {
        animationFrameRef.current = window.requestAnimationFrame(drawFrame);
      }
    };

    window.cancelAnimationFrame(animationFrameRef.current);
    lastFrameRef.current = 0;

    if (isAnimating && !prefersReducedMotion) {
      animationFrameRef.current = window.requestAnimationFrame(drawFrame);
    } else {
      frameDrawerRef.current?.(performance.now());
    }

    return () => {
      window.cancelAnimationFrame(animationFrameRef.current);
    };
  }, [height, isAnimating, prefersReducedMotion, width]);

  useEffect(() => {
    if (isAnimating && !prefersReducedMotion) {
      return;
    }

    frameDrawerRef.current?.(performance.now());
  }, [currentDuration, currentPhaseKey, currentTimeInPhase, height, isActive, isAnimating, phaseProgress, prefersReducedMotion, width]);

  const ariaLabel = `Spiral Dance ${normalizePhaseKey(currentPhaseKey)} visualization`;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      aria-label={ariaLabel}
      style={{
        display: 'block',
        width: '100%',
        height: '100%'
      }}
    />
  );
};

export default SpiralDanceCanvas;
