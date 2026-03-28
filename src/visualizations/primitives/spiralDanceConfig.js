const TAU = Math.PI * 2;
const CYCLE_HUES = [265, 190, 140, 20, 340];

export const HOLD_PHASE_KEYS = new Set(['hold', 'hold1', 'hold2']);

export const SPIRAL_DANCE_CONFIG = {
  armCount: 4,
  particleCount: 720,
  starCount: 96,
  curveSteps: 96,
  maxTheta: Math.PI * 7.4,
  particleSize: {
    min: 0.7,
    max: 2.5
  },
  spiral: {
    // Tweak `a` to change how wide the spiral starts near the center.
    a: 0.042,
    // Tweak `b` to tighten or loosen the logarithmic spiral arms.
    b: 0.205,
    radialNoise: 0.035,
    tangentialNoise: 0.018,
    armJitter: 0.14
  },
  palette: {
    // Tweak these colors to restyle the galaxy without touching the render loop.
    backgroundOuter: '#030814',
    backgroundMid: '#100b24',
    backgroundInner: '#1b1740',
    nebulaPurple: '#7840ff',
    nebulaLilac: '#ceb7ff',
    core: '#fff7dd',
    border: 'rgba(242, 231, 255, 0.34)',
    particles: [
      { css: '#ffe4a3', rgb: [255, 228, 163] },
      { css: '#d7c0ff', rgb: [215, 192, 255] },
      { css: '#fffaf4', rgb: [255, 250, 244] }
    ]
  }
};

export function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

export function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

export function lerpRgb(current, target, amount) {
  return [
    lerp(current[0], target[0], amount),
    lerp(current[1], target[1], amount),
    lerp(current[2], target[2], amount)
  ];
}

export function easeInOutSine(value) {
  return -(Math.cos(Math.PI * clamp01(value)) - 1) * 0.5;
}

export function easeOutCubic(value) {
  return 1 - Math.pow(1 - clamp01(value), 3);
}

export function normalizePhaseKey(phaseKey) {
  if (phaseKey === 'hold2') {
    return 'hold2';
  }

  if (phaseKey === 'hold' || phaseKey === 'hold1') {
    return 'hold1';
  }

  if (phaseKey === 'exhale') {
    return 'exhale';
  }

  return 'inhale';
}

export function hexToRgbTuple(hex) {
  const normalized = String(hex || '#ffffff').replace('#', '');
  const safe = normalized.length === 3
    ? normalized.split('').map((part) => `${part}${part}`).join('')
    : normalized.padEnd(6, '0');

  return [
    parseInt(safe.slice(0, 2), 16),
    parseInt(safe.slice(2, 4), 16),
    parseInt(safe.slice(4, 6), 16)
  ];
}

export function hslToRgbTuple(h, s, l) {
  const hue = ((h % 360) + 360) % 360;
  const saturation = clamp01(s / 100);
  const lightness = clamp01(l / 100);

  const chroma = (1 - Math.abs((2 * lightness) - 1)) * saturation;
  const segment = hue / 60;
  const x = chroma * (1 - Math.abs((segment % 2) - 1));

  let rgbPrime = [0, 0, 0];

  if (segment >= 0 && segment < 1) rgbPrime = [chroma, x, 0];
  else if (segment < 2) rgbPrime = [x, chroma, 0];
  else if (segment < 3) rgbPrime = [0, chroma, x];
  else if (segment < 4) rgbPrime = [0, x, chroma];
  else if (segment < 5) rgbPrime = [x, 0, chroma];
  else rgbPrime = [chroma, 0, x];

  const match = lightness - (chroma / 2);

  return rgbPrime.map((channel) => Math.round((channel + match) * 255));
}

function interpolateHue(start, end, amount) {
  const delta = ((((end - start) % 360) + 540) % 360) - 180;
  return (start + (delta * clamp01(amount)) + 360) % 360;
}

export function resolveSpiralCyclePalette({ cycleIndex = 0, phaseColor = '#2dd4bf' } = {}) {
  const safeCycleIndex = Math.max(0, cycleIndex);
  const baseHue = CYCLE_HUES[safeCycleIndex % CYCLE_HUES.length];
  const nextHue = CYCLE_HUES[(safeCycleIndex + 1) % CYCLE_HUES.length];
  const accentHue = interpolateHue(baseHue, nextHue, 0.22);
  const secondaryHue = (accentHue + 34) % 360;
  const tertiaryHue = (accentHue + 72) % 360;
  const phaseRgb = hexToRgbTuple(phaseColor);
  const brightCore = hslToRgbTuple(accentHue + 8, 96, 95);
  const bandA = lerpRgb(hslToRgbTuple(accentHue, 82, 74), phaseRgb, 0.28);
  const bandB = hslToRgbTuple(secondaryHue, 76, 76);
  const bandC = hslToRgbTuple(tertiaryHue, 84, 72);
  const haloRgb = lerpRgb(brightCore, bandA, 0.5);
  const ringProgressRgb = lerpRgb(bandA, phaseRgb, 0.42);
  const ringTrackRgb = lerpRgb([72, 82, 108], bandA, 0.26);
  const nebulaArgb = lerpRgb(bandA, [8, 10, 24], 0.18);
  const nebulaBrgb = lerpRgb(bandB, [10, 12, 28], 0.2);

  return {
    particleBands: [bandA, bandB, bandC],
    armBands: [
      lerpRgb(bandA, brightCore, 0.16),
      lerpRgb(bandB, brightCore, 0.12),
      lerpRgb(bandC, brightCore, 0.1)
    ],
    starBands: [
      lerpRgb(brightCore, bandA, 0.18),
      lerpRgb(brightCore, bandB, 0.24),
      lerpRgb(brightCore, bandC, 0.28)
    ],
    coreRgb: brightCore,
    haloRgb,
    nebulaArgb,
    nebulaBrgb,
    ringProgressRgb,
    ringTrackRgb
  };
}

function mulberry32(seed) {
  let currentSeed = seed >>> 0;

  return () => {
    currentSeed += 0x6D2B79F5;
    let next = Math.imul(currentSeed ^ (currentSeed >>> 15), currentSeed | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function pickParticleColor(random, palette) {
  const sample = random();

  if (sample < 0.38) {
    return palette[0];
  }

  if (sample < 0.74) {
    return palette[1];
  }

  return palette[2];
}

export function createSpiralDanceField(customConfig = {}) {
  const config = {
    ...SPIRAL_DANCE_CONFIG,
    ...customConfig,
    spiral: {
      ...SPIRAL_DANCE_CONFIG.spiral,
      ...customConfig.spiral
    },
    particleSize: {
      ...SPIRAL_DANCE_CONFIG.particleSize,
      ...customConfig.particleSize
    },
    palette: {
      ...SPIRAL_DANCE_CONFIG.palette,
      ...customConfig.palette
    }
  };

  const { armCount, particleCount, starCount, curveSteps, maxTheta, particleSize, spiral, palette } = config;
  const random = mulberry32(0xC05C0DED);
  const maxRadius = spiral.a * Math.exp(spiral.b * maxTheta);
  const particles = [];
  const particlesPerArm = Math.ceil(particleCount / armCount);

  for (let index = 0; index < particleCount; index += 1) {
    const armIndex = index % armCount;
    const armOffset = (armIndex / armCount) * TAU;
    const armPosition = Math.floor(index / armCount);
    const ratio = (armPosition + random()) / particlesPerArm;
    const theta = maxTheta * Math.pow(clamp01(ratio), 0.92);
    const radius = spiral.a * Math.exp(spiral.b * theta);
    const normalizedRadius = radius / maxRadius;

    particles.push({
      theta,
      armOffset,
      normalizedRadius,
      colorBand: Math.floor(theta / (Math.PI * 1.35)) % 3,
      radialNoise: (random() - 0.5) * spiral.radialNoise * (0.5 + normalizedRadius),
      tangentialNoise: (random() - 0.5) * spiral.tangentialNoise,
      armNoise: (random() - 0.5) * spiral.armJitter,
      offsetX: (random() - 0.5) * 0.075 * (0.25 + normalizedRadius),
      offsetY: (random() - 0.5) * 0.075 * (0.25 + normalizedRadius),
      size: lerp(particleSize.min, particleSize.max, Math.pow(random(), 1.6)),
      alpha: lerp(0.24, 0.94, random()),
      brightness: lerp(0.8, 1.25, random()),
      spinFactor: lerp(0.35, 1.2, random()),
      twinkleOffset: random() * TAU * 2,
      highlight: random() > 0.88,
      color: pickParticleColor(random, palette.particles)
    });
  }

  const stars = Array.from({ length: starCount }, () => {
    const angle = random() * TAU;
    const radius = Math.sqrt(random()) * 0.95;

    return {
      x: 0.5 + Math.cos(angle) * radius * 0.48,
      y: 0.5 + Math.sin(angle) * radius * 0.48,
      colorBand: Math.floor(random() * 3),
      size: lerp(0.5, 1.7, random()),
      alpha: lerp(0.2, 0.8, random()),
      twinkleOffset: random() * TAU * 2,
      color: pickParticleColor(random, palette.particles)
    };
  });

  const armCurves = Array.from({ length: armCount }, (_, armIndex) => (
    Array.from({ length: curveSteps }, (_, stepIndex) => {
      const ratio = stepIndex / Math.max(curveSteps - 1, 1);
      const theta = maxTheta * ratio;
      const radius = spiral.a * Math.exp(spiral.b * theta);

      return {
        theta,
        armOffset: (armIndex / armCount) * TAU,
        normalizedRadius: radius / maxRadius
      };
    })
  ));

  return {
    armCurves,
    particles,
    stars
  };
}

export function resolveSpiralDanceState({ phaseKey, progress, isActive }) {
  const normalizedPhase = normalizePhaseKey(phaseKey);
  const safeProgress = clamp01(progress);

  if (!isActive) {
    return {
      scale: 0.74,
      armBloom: 0.9,
      glowIntensity: 0.22,
      particleOpacity: 0.48,
      haloOpacity: 0.12,
      targetVelocity: 0,
      twinkleAmplitude: 0.03,
      corePulse: 0.05
    };
  }

  switch (normalizedPhase) {
    case 'inhale': {
      const eased = easeOutCubic(safeProgress);

      return {
        scale: lerp(0.62, 1.08, eased),
        armBloom: lerp(0.86, 1.08, eased),
        glowIntensity: lerp(0.24, 1, eased),
        particleOpacity: lerp(0.42, 1, eased),
        haloOpacity: lerp(0.16, 0.46, eased),
        targetVelocity: lerp(0.14, 0.8, eased),
        twinkleAmplitude: 0.04,
        corePulse: 0.12
      };
    }

    case 'hold1':
      return {
        scale: 1.08,
        armBloom: 1.1,
        glowIntensity: 0.9,
        particleOpacity: 0.96,
        haloOpacity: 0.4,
        targetVelocity: 0.08,
        twinkleAmplitude: 0.16,
        corePulse: 0.2
      };

    case 'hold2':
      return {
        scale: 0.64,
        armBloom: 0.82,
        glowIntensity: 0.34,
        particleOpacity: 0.62,
        haloOpacity: 0.16,
        targetVelocity: 0.02,
        twinkleAmplitude: 0.08,
        corePulse: 0.08
      };

    case 'exhale':
    default: {
      const eased = easeInOutSine(1 - safeProgress);

      return {
        scale: lerp(0.62, 1.08, eased),
        armBloom: lerp(0.82, 1.04, eased),
        glowIntensity: lerp(0.16, 0.8, eased),
        particleOpacity: lerp(0.3, 0.92, eased),
        haloOpacity: lerp(0.1, 0.34, eased),
        targetVelocity: lerp(0.06, 0.54, eased),
        twinkleAmplitude: 0.06,
        corePulse: 0.1
      };
    }
  }
}
