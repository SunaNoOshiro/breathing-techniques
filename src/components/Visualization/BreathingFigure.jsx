/**
 * Breathing Figure Component
 * Renders the human figure with animated lungs and diaphragm
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ANIMATION_CONFIG } from '../../utils/animationUtils.js';
import { useLocalization } from '../../contexts/LocalizationContext.jsx';
import Logger from '../../utils/Logger.js';

/**
 * Breathing Figure Component
 * Renders the animated human figure with lungs and diaphragm
 */
const BreathingFigure = ({ 
  currentTechnique, 
  currentPhase, 
  lungData, 
  diaphragmOffset, 
  currentColors, 
  containerDimensions,
  prefersReducedMotion = false
}) => {
  const { t } = useLocalization();
  // Add safety checks and provide fallback
  if (!currentTechnique) {
    Logger.warn('component', 'BreathingFigure: currentTechnique is undefined, using fallback');
    // Provide a fallback technique
    currentTechnique = {
      id: 'fallback',
      phases: [
        { name: 'inhale', duration: 4 },
        { name: 'exhale', duration: 4 }
      ]
    };
  }
  
  if (!currentTechnique.id) {
    Logger.warn('component', 'BreathingFigure: currentTechnique.id is undefined, using fallback', currentTechnique);
    currentTechnique.id = 'fallback';
  }
  
  if (!currentTechnique.phases) {
    Logger.warn('component', 'BreathingFigure: currentTechnique.phases is undefined, using fallback', currentTechnique);
    currentTechnique.phases = [
      { name: 'inhale', duration: 4 },
      { name: 'exhale', duration: 4 }
    ];
  }
  
  // Ensure currentPhase has proper structure
  const safeCurrentPhase = currentPhase || { phase: { name: 'Unknown' }, timeLeft: 0 };

  // Ensure lungData and diaphragmOffset have proper values
  const safeLungData = lungData || {
    paint: { fill: currentColors?.green || '#34D399', stroke: currentColors?.stroke || '#9CA3AF' },
    scaling: 1
  };
  
  const safeDiaphragmOffset = diaphragmOffset || 0;

  // Ensure currentColors has proper values
  const safeCurrentColors = currentColors || {
    panel: '#0f172a',
    stroke: '#9CA3AF',
    diaphragm: '#4B5563',
    green: '#34D399',
    accent: '#60A5FA',
    themeKey: 'dark'
  };

  const auraId = useMemo(() => `figure-aura-${Math.random().toString(36).slice(2)}`, []);
  const glowId = useMemo(() => `figure-glow-${Math.random().toString(36).slice(2)}`, []);
  const starField = useMemo(() => {
    const count = 14;
    return Array.from({ length: count }, (_, i) => {
      const angle = (i * 137 * Math.PI) / 180;
      const r = 120 + (i % 5) * 10;
      return {
        x: 130 + Math.cos(angle) * r * 0.45,
        y: 170 + Math.sin(angle) * r * 0.35,
        size: 1.4 + (i % 4) * 0.6,
        opacity: 0.25 + (i % 3) * 0.1
      };
    });
  }, []);

  // Use precise, non-looping transitions for phase-driven updates
  const lungTransition = ANIMATION_CONFIG.lungScale;

  // Calculate figure dimensions based on technique
  const figureDimensions = React.useMemo(() => {
    if (!currentTechnique.phases) {
      Logger.warn('component', 'BreathingFigure: currentTechnique.phases is undefined', currentTechnique);
      return { width: "180", height: "225" };
    }
    
    if (currentTechnique.id === 'coherent') {
      return { width: "280", height: "350" };
    } else if (currentTechnique.phases.length === 4) {
      return { width: "320", height: "400" };
    } else {
      return { width: "180", height: "225" };
    }
  }, [currentTechnique]);

  // Calculate figure position
  const figurePosition = React.useMemo(() => {
    if (!currentTechnique.phases) {
      return '62%';
    }
    
    const moveUpTechniques = ['478', '478-extended', '555', 'triangle', '628'];
    const shouldMoveUp = moveUpTechniques.includes(currentTechnique.id);
    
    if (shouldMoveUp) {
      return '52%';
    } else if (currentTechnique.id === 'coherent') {
      return '50%';
    } else if (currentTechnique.phases.length === 4) {
      return '50%';
    } else {
      return '62%';
    }
  }, [currentTechnique]);

  // Compute localized phase label from key
  const phaseKey = safeCurrentPhase?.phase?.key || safeCurrentPhase?.key;
  const localizedPhaseName = phaseKey ? t(phaseKey) : (safeCurrentPhase?.phase?.name || safeCurrentPhase?.name || 'Unknown');

  return (
    <div 
      style={{ 
        position: 'absolute', 
        zIndex: 1,
        top: figurePosition,
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }}
    >
      <motion.svg
        width={figureDimensions.width}
        height={figureDimensions.height}
        viewBox="0 0 260 340"
        aria-label={`Phase: ${localizedPhaseName} (${safeCurrentPhase?.timeLeft || 0}s)`}
      >
        <defs>
          <radialGradient id={auraId} cx="50%" cy="45%" r="65%">
            <stop offset="0%" stopColor={`${safeCurrentColors.green}aa`} />
            <stop offset="60%" stopColor={`${safeCurrentColors.stroke}55`} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="16" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g filter={`url(#${glowId})`}>
          <circle cx="130" cy="170" r="140" fill={`url(#${auraId})`} />
          {starField.map((star, idx) => (
            <circle
              key={`figure-star-${idx}`}
              cx={star.x}
              cy={star.y}
              r={star.size}
              fill={safeCurrentColors.green}
              opacity={star.opacity}
            />
          ))}
        </g>

        {/* Head */}
        <circle
          cx="130"
          cy="55"
          r="35"
          fill={safeCurrentColors.panel} 
          stroke={safeCurrentColors.stroke}
          strokeWidth="3"
          style={{ filter: `url(#${glowId})` }}
        />

        {/* Body */}
        <path
          d="M70 100 Q130 80 190 100 V260 Q130 300 70 260 Z"
          fill={safeCurrentColors.panel}
          stroke={safeCurrentColors.stroke}
          strokeWidth="3"
          style={{ filter: `url(#${glowId})` }}
        />

        {/* Spine */}
        <line
          x1="130"
          y1="110"
          x2="130"
          y2="230"
          stroke={safeCurrentColors.stroke}
          strokeWidth="3"
          style={{ filter: `url(#${glowId})` }}
        />

        {/* Neck */}
        <path
          d="M128 95 L132 95 L132 120 L128 120 Z"
          fill={safeCurrentColors.stroke}
        />

        {/* Left Lung */}
        <motion.path
          d="M125 120 C100 120, 80 150, 86 190 C90 220, 110 235, 125 230 C135 225, 140 205, 140 180 C140 155, 135 130, 125 120 Z"
          fill={safeLungData.paint.fill}
          stroke={safeLungData.paint.stroke}
          strokeWidth="3"
          animate={{ scale: safeLungData.scaling }}
          transition={lungTransition}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        />
        
        {/* Right Lung */}
        <motion.path
          d="M135 120 C160 120, 180 150, 174 190 C170 220, 150 235, 135 230 C125 225, 120 205, 120 180 C120 155, 125 130, 135 120 Z"
          fill={safeLungData.paint.fill}
          stroke={safeLungData.paint.stroke}
          strokeWidth="3"
          animate={{ scale: safeLungData.scaling }}
          transition={lungTransition}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        />
        
        {/* Diaphragm */}
        <motion.path
          d="M70 240 Q130 260 190 240"
          fill="none"
          stroke={safeCurrentColors.diaphragm}
          strokeWidth="3"
          animate={{ y: safeDiaphragmOffset }}
          transition={lungTransition}
        />
      </motion.svg>
    </div>
  );
};

export default BreathingFigure;
