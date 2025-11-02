/**
 * Color utilities
 * Handles color manipulation and generation following Single Responsibility Principle
 */

/**
 * Convert hex color to RGB
 * @param {string} hex - Hex color string
 * @returns {object} - RGB object with r, g, b properties
 */
export function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const normalized = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(normalized.substring(0, 2), 16);
  const g = parseInt(normalized.substring(2, 4), 16);
  const b = parseInt(normalized.substring(4, 6), 16);
  return { r, g, b };
}

/**
 * Convert RGB to hex color
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {string} - Hex color string
 */
export function rgbToHex(r, g, b) {
  const toHex = (n) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Mix two RGB colors
 * @param {object} a - First RGB color
 * @param {object} b - Second RGB color
 * @param {number} t - Mix ratio (0-1)
 * @returns {object} - Mixed RGB color
 */
export function mixRgb(a, b, t) {
  const clamped = Math.max(0, Math.min(1, t));
  const r = Math.round(a.r + (b.r - a.r) * clamped);
  const g = Math.round(a.g + (b.g - a.g) * clamped);
  const bch = Math.round(a.b + (b.b - a.b) * clamped);
  return { r, g, b: bch };
}

/**
 * Mix two hex colors
 * @param {string} colorA - First hex color
 * @param {string} colorB - Second hex color
 * @param {number} ratio - Mix ratio (0-1)
 * @returns {string} - Mixed hex color
 */
export function mixHexColors(colorA, colorB, ratio) {
  const rgbA = hexToRgb(colorA);
  const rgbB = hexToRgb(colorB);
  const mixed = mixRgb(rgbA, rgbB, ratio);
  return rgbToHex(mixed.r, mixed.g, mixed.b);
}

/**
 * Convert RGB to HSL
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {object} - HSL object with h, s, l properties
 */
export function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Convert HSL to RGB
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {object} - RGB object with r, g, b properties
 */
export function hslToRgb(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;

  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

/**
 * Convert HSL to hex
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {string} - Hex color string
 */
export function hslToHex(h, s, l) {
  const rgb = hslToRgb(h, s, l);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

/**
 * Get luminance of a color
 * @param {string} hex - Hex color string
 * @returns {number} - Luminance value (0-1)
 */
export function getLuminance(hex) {
  const rgb = hexToRgb(hex);
  const { r, g, b } = rgb;
  
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Get contrast ratio between two colors
 * @param {string} color1 - First hex color
 * @param {string} color2 - Second hex color
 * @returns {number} - Contrast ratio
 */
export function getContrastRatio(color1, color2) {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if color is light
 * @param {string} hex - Hex color string
 * @returns {boolean} - True if color is light
 */
export function isLightColor(hex) {
  return getLuminance(hex) > 0.5;
}

/**
 * Get complementary color
 * @param {string} hex - Hex color string
 * @returns {string} - Complementary hex color
 */
export function getComplementaryColor(hex) {
  const hsl = rgbToHsl(...Object.values(hexToRgb(hex)));
  const complementaryHue = (hsl.h + 180) % 360;
  return hslToHex(complementaryHue, hsl.s, hsl.l);
}

/**
 * Generate color palette
 * @param {string} baseColor - Base hex color
 * @param {number} count - Number of colors to generate
 * @returns {string[]} - Array of hex colors
 */
export function generateColorPalette(baseColor, count = 5) {
  const hsl = rgbToHsl(...Object.values(hexToRgb(baseColor)));
  const colors = [];
  
  for (let i = 0; i < count; i++) {
    const hue = (hsl.h + (i * 360 / count)) % 360;
    colors.push(hslToHex(hue, hsl.s, hsl.l));
  }
  
  return colors;
}

/**
 * Generate theme colors for breathing phases
 * @param {number} themeIndex - Theme index
 * @param {string} themeKey - Theme key
 * @returns {object} - Theme colors object
 */
export function generateThemeColors(themeIndex, themeKey = 'dark') {
  const hues = [265, 190, 140, 20, 340];
  const hue = hues[themeIndex % hues.length];
  const isLightTheme = themeKey === 'light';
  
  return {
    active: `hsl(${hue}, 90%, ${isLightTheme ? '50%' : '60%'})`,
    idle: `hsla(${hue}, 30%, ${isLightTheme ? '40%' : '60%'}, ${isLightTheme ? '0.4' : '0.25'})`,
    textIdle: `hsla(${hue}, 20%, ${isLightTheme ? '30%' : '85%'}, 0.9)`
  };
}

/**
 * Get phase gradient colors
 * Цикл переходів: зеленіє під час вдиху, червоніє перед вдихом
 * Червоний → Зелений → Синій → Сірий → Червоний
 * @param {string} phaseKey - Phase key
 * @param {object} colors - Color palette
 * @returns {object} - Gradient colors
 */
export function getPhaseGradient(phaseKey, colors = {}) {
  const defaultColors = {
    red: '#F87171',
    green: '#34D399',
    blue: '#60A5FA',
    gray: '#9CA3AF'
  };
  
  const palette = { ...defaultColors, ...colors };
  
  // Зеленіє під час вдиху, червоніє перед вдихом
  switch (phaseKey) {
    case 'inhale': return { from: palette.red, to: palette.green };       // вдих: червоний → зелений (зеленіє!)
    case 'hold1': return { from: palette.green, to: palette.blue };       // затримка1: зелений → синій
    case 'exhale': return { from: palette.blue, to: palette.gray };       // видих: синій → сірий
    case 'hold2': return { from: palette.gray, to: palette.red };         // затримка2: сірий → червоний (червоніє перед вдихом!)
    default: return { from: palette.red, to: palette.green };
  }
}

/**
 * Compute lung paint colors
 * @param {string} phaseKey - Phase key
 * @param {number} stepIndex - Step index
 * @param {number} stepsTotal - Total steps
 * @param {object} colors - Color palette
 * @returns {object} - Paint colors
 */
export function computeLungPaint(phaseKey, stepIndex, stepsTotal, colors = {}) {
  const { from, to } = getPhaseGradient(phaseKey, colors);
  const start = hexToRgb(from);
  const end = hexToRgb(to);
  const t = stepsTotal > 0 ? (Math.min(stepIndex, stepsTotal - 1) + 1) / stepsTotal : 1;
  const { r, g, b } = mixRgb(start, end, t);
  return { stroke: `rgb(${r}, ${g}, ${b})`, fill: `rgba(${r}, ${g}, ${b}, 0.25)` };
}

/**
 * Compute lung paint from technique
 * @param {object} technique - Technique object
 * @param {string} phaseKey - Phase key
 * @param {number} stepIndex - Step index
 * @param {number} stepsTotal - Total steps
 * @returns {object} - Paint colors
 */
export function computeLungPaintFromTechnique(technique, phaseKey, stepIndex, stepsTotal) {
  const overridden = technique?.getPhaseColors?.(phaseKey);
  const palette = overridden || getPhaseGradient(phaseKey);
  const start = hexToRgb(palette.from);
  const end = hexToRgb(palette.to);
  const t = stepsTotal > 0 ? (Math.min(stepIndex, stepsTotal - 1) + 1) / stepsTotal : 1;
  const { r, g, b } = mixRgb(start, end, t);
  return { stroke: `rgb(${r}, ${g}, ${b})`, fill: `rgba(${r}, ${g}, ${b}, 0.25)` };
}

/**
 * Validate hex color
 * @param {string} hex - Hex color string
 * @returns {boolean} - True if valid
 */
export function isValidHexColor(hex) {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

/**
 * Normalize hex color
 * @param {string} hex - Hex color string
 * @returns {string} - Normalized hex color
 */
export function normalizeHexColor(hex) {
  if (!hex.startsWith('#')) {
    hex = '#' + hex;
  }
  
  if (hex.length === 4) {
    hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }
  
  return hex.toUpperCase();
}
