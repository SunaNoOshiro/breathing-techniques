/**
 * Shared utilities for breathing techniques
 * Contains color helpers, animation utilities, and common visualization functions
 */

import Logger from './Logger.js';

// Theme definitions
export const THEMES = {
  dark: {
    name: 'Dark',
    colors: {
      bg: '#0b1020',
      panel: '#0f172a',
      text: '#e5e7eb',
      stroke: '#9CA3AF',
      diaphragm: '#4B5563',
      green: '#34D399',
      blue: '#60A5FA',
      red: '#F87171',
      orange: '#F59E0B',
      accent: '#60A5FA',
      border: '#374151',
      shadow: 'rgba(0, 0, 0, 0.1)'
    }
  },
  ocean: {
    name: 'Ocean',
    colors: {
      bg: '#0c1445',
      panel: '#1a237e',
      text: '#e8eaf6',
      stroke: '#7986cb',
      diaphragm: '#5c6bc0',
      green: '#4fc3f7',
      blue: '#29b6f6',
      red: '#ef5350',
      orange: '#ff9800',
      accent: '#29b6f6',
      border: '#3949ab',
      shadow: 'rgba(0, 0, 0, 0.2)'
    }
  },
  forest: {
    name: 'Forest',
    colors: {
      bg: '#1b2e1b',
      panel: '#2d4a2d',
      text: '#e8f5e8',
      stroke: '#81c784',
      diaphragm: '#66bb6a',
      green: '#4caf50',
      blue: '#2196f3',
      red: '#f44336',
      orange: '#ff9800',
      accent: '#4caf50',
      border: '#388e3c',
      shadow: 'rgba(0, 0, 0, 0.15)'
    }
  },
  sunset: {
    name: 'Sunset',
    colors: {
      bg: '#2d1b1b',
      panel: '#4a2d2d',
      text: '#f5e8e8',
      stroke: '#e57373',
      diaphragm: '#ef5350',
      green: '#66bb6a',
      blue: '#42a5f5',
      red: '#f44336',
      orange: '#ff7043',
      accent: '#ff7043',
      border: '#d32f2f',
      shadow: 'rgba(0, 0, 0, 0.2)'
    }
  },
  purple: {
    name: 'Purple',
    colors: {
      bg: '#2d1b2d',
      panel: '#4a2d4a',
      text: '#f5e8f5',
      stroke: '#ba68c8',
      diaphragm: '#ab47bc',
      green: '#66bb6a',
      blue: '#42a5f5',
      red: '#f44336',
      orange: '#ff9800',
      accent: '#ab47bc',
      border: '#8e24aa',
      shadow: 'rgba(0, 0, 0, 0.2)'
    }
  },
  light: {
    name: 'Light',
    colors: {
      bg: '#f8fafc',
      panel: '#ffffff',
      text: '#1e293b',
      stroke: '#475569',
      diaphragm: '#64748b',
      green: '#059669',
      blue: '#2563eb',
      red: '#dc2626',
      orange: '#d97706',
      accent: '#2563eb',
      border: '#cbd5e1',
      shadow: 'rgba(0, 0, 0, 0.1)'
    }
  }
};

// Default theme (for backward compatibility)
export const COLORS = THEMES.dark.colors;

// Color manipulation utilities
export function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const normalized = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(normalized.substring(0, 2), 16);
  const g = parseInt(normalized.substring(2, 4), 16);
  const b = parseInt(normalized.substring(4, 6), 16);
  return { r, g, b };
}

export function mixRgb(a, b, t) {
  const clamped = Math.max(0, Math.min(1, t));
  const r = Math.round(a.r + (b.r - a.r) * clamped);
  const g = Math.round(a.g + (b.g - a.g) * clamped);
  const bch = Math.round(a.b + (b.b - a.b) * clamped);
  return { r, g, b: bch };
}

export function getPhaseGradient(phaseKey) {
  switch (phaseKey) {
    case 'inhale': return { from: COLORS.red, to: COLORS.green };
    case 'hold1': return { from: COLORS.green, to: COLORS.blue };
    case 'exhale': return { from: COLORS.blue, to: COLORS.orange };
    case 'hold2': return { from: COLORS.orange, to: COLORS.red };
    default: return { from: COLORS.blue, to: COLORS.blue };
  }
}

export function computeLungPaint(phaseKey, stepIndex, stepsTotal) {
  const { from, to } = getPhaseGradient(phaseKey);
  const start = hexToRgb(from);
  const end = hexToRgb(to);
  const t = stepsTotal > 0 ? (Math.min(stepIndex, stepsTotal - 1) + 1) / stepsTotal : 1;
  const { r, g, b } = mixRgb(start, end, t);
  return { stroke: `rgb(${r}, ${g}, ${b})`, fill: `rgba(${r}, ${g}, ${b}, 0.25)` };
}

// Same as computeLungPaint but respects technique-specific color overrides
export function computeLungPaintFromTechnique(technique, phaseKey, stepIndex, stepsTotal) {
  const overridden = technique?.getPhaseColors?.(phaseKey);
  const palette = overridden || getPhaseGradient(phaseKey);
  const start = hexToRgb(palette.from);
  const end = hexToRgb(palette.to);
  const t = stepsTotal > 0 ? (Math.min(stepIndex, stepsTotal - 1) + 1) / stepsTotal : 1;
  const { r, g, b } = mixRgb(start, end, t);
  return { stroke: `rgb(${r}, ${g}, ${b})`, fill: `rgba(${r}, ${g}, ${b}, 0.25)` };
}

// Theme color generation
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

// Audio utilities
export class AudioManager {
  constructor() {
    this.audioCtx = null;
    this.isEnabled = true;
    this.volume = 0.25;
  }

  ensureAudio() {
    if (!this.audioCtx) {
      try { 
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)(); 
      } catch {}
    }
    if (this.audioCtx?.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  playBeep(freq = 520, ms = 100, gainLevel = null) {
    if (!this.isEnabled) return;
    const ctx = this.ensureAudio();
    if (!ctx) return;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime;
    const volume = gainLevel !== null ? gainLevel : this.volume;
    
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.02);
    gain.gain.linearRampToValueAtTime(0.0001, t + ms/1000);
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + ms/1000);
  }
}

// Vibration utilities
export class VibrationManager {
  constructor() {
    this.isEnabled = false;
  }

  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  vibrate(duration = 10) {
    if (!this.isEnabled || !navigator.vibrate) return;
    navigator.vibrate(duration);
  }
}

// Theme management utilities
export function getThemeColors(themeKey = 'dark') {
  return THEMES[themeKey]?.colors || THEMES.dark.colors;
}

export function getThemeNames() {
  return Object.keys(THEMES).map(key => ({
    key,
    name: THEMES[key].name
  }));
}

export function saveThemeToStorage(themeKey) {
  try {
    localStorage.setItem('breathing-app-theme', themeKey);
  } catch (error) {
    Logger.warn("util", 'Failed to save theme to localStorage:', error);
  }
}

export function loadThemeFromStorage() {
  try {
    const savedTheme = localStorage.getItem('breathing-app-theme');
    return savedTheme && THEMES[savedTheme] ? savedTheme : 'dark';
  } catch (error) {
    Logger.warn("util", 'Failed to load theme from localStorage:', error);
    return 'dark';
  }
}

// Dynamic layout styles generator
export function getLayoutStyles(themeKey = 'dark') {
  const colors = getThemeColors(themeKey);
  return {
    root: {
      background: colors.bg,
      color: colors.text,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
      boxSizing: 'border-box',
    },
    header: {
      textAlign: 'center',
      marginBottom: '24px',
      '@media (max-width: 768px)': {
        marginBottom: '16px'
      }
    },
    mainContent: {
      display: 'flex',
      gap: '24px',
      flex: 1,
      alignItems: 'flex-start',
      '@media (max-width: 768px)': {
        flexDirection: 'column',
        gap: '16px'
      }
    },
    sidebar: {
      width: '320px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      '@media (max-width: 768px)': {
        width: '100%',
        order: 2
      }
    },
    visualizationArea: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      '@media (max-width: 768px)': {
        order: 1,
        width: '100%'
      }
    },
    controlsPanel: {
      padding: '20px',
      background: colors.panel,
      borderRadius: 12,
      border: `1px solid ${colors.border}`,
      boxShadow: `0 4px 6px -1px ${colors.shadow}`
    },
    controls: { 
      display: 'flex', 
      gap: 12, 
      alignItems: 'center', 
      marginBottom: 24, 
      fontSize: 14 
    },
    squareWrap: { 
      position: 'relative', 
      width: 420, 
      height: 420, 
      marginBottom: 8
    },
    dotBase: { 
      position: 'absolute', 
      width: 40, 
      height: 40, 
      marginLeft: -20, 
      marginTop: -20, 
      borderRadius: 9999, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      fontWeight: 800 
    },
    panel: {
      padding: '20px',
      background: colors.panel,
      borderRadius: 12,
      border: `1px solid ${colors.border}`,
      boxShadow: `0 4px 6px -1px ${colors.shadow}`
    },
    button: {
      padding: '10px 20px',
      color: 'white',
      border: 'none',
      borderRadius: 8,
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: `0 2px 4px ${colors.shadow}`
    }
  };
}

// Legacy layout styles (for backward compatibility)
export const LAYOUT_STYLES = getLayoutStyles('dark');

// Animation utilities
export const ANIMATION_CONFIG = {
  lungScale: {
    duration: 0.28,
    ease: 'easeInOut'
  },
  dotTransition: {
    duration: 200,
    ease: 'ease'
  }
};
