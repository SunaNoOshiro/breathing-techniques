import React, { useId, useMemo } from 'react';
import { motion } from 'framer-motion';

const HOLD_PHASES = new Set(['hold', 'hold1', 'hold2']);

function getInitialScale(phaseKey) {
  switch (phaseKey) {
    case 'inhale':
      return 1;
    case 'exhale':
    case 'hold':
    case 'hold1':
      return 1.5;
    case 'hold2':
    default:
      return 1;
  }
}

function getMotionConfig({ isActive, phaseKey, scale, duration, prefersReducedMotion }) {
  if (prefersReducedMotion) {
    return {
      initial: false,
      animate: { scale: isActive ? scale : 1 },
      transition: { duration: 0.01, ease: 'linear' }
    };
  }

  if (!isActive) {
    return {
      initial: false,
      animate: { scale: 1 },
      transition: { duration: 0.45, ease: 'easeInOut' }
    };
  }

  if (HOLD_PHASES.has(phaseKey)) {
    return {
      initial: { scale: getInitialScale(phaseKey) },
      animate: { scale: [scale, scale + 0.05, scale - 0.05, scale] },
      transition: {
        duration: Math.max(duration, 2.2),
        ease: 'easeInOut',
        repeat: Infinity
      }
    };
  }

  return {
    initial: { scale: getInitialScale(phaseKey) },
    animate: { scale },
    transition: {
      duration: Math.max(duration, 0.35),
      ease: 'easeInOut'
    }
  };
}

const facetPolygons = [
  { points: '160,18 220,44 202,98 160,82 118,98 100,44', fill: 'rgba(255,255,255,0.20)' },
  { points: '100,44 118,98 84,146 40,112 52,64', fill: 'rgba(255,255,255,0.10)' },
  { points: '220,44 268,64 280,112 236,146 202,98', fill: 'rgba(255,255,255,0.12)' },
  { points: '84,146 118,98 160,82 160,158 108,186', fill: 'rgba(255,255,255,0.16)' },
  { points: '202,98 236,146 212,186 160,158 160,82', fill: 'rgba(255,255,255,0.18)' },
  { points: '40,112 84,146 108,186 74,238 34,196', fill: 'rgba(255,255,255,0.10)' },
  { points: '236,146 280,112 286,196 246,238 212,186', fill: 'rgba(255,255,255,0.12)' },
  { points: '108,186 160,158 160,236 118,280 74,238', fill: 'rgba(255,255,255,0.14)' },
  { points: '160,158 212,186 246,238 202,280 160,236', fill: 'rgba(255,255,255,0.18)' },
  { points: '118,280 160,236 202,280 160,304', fill: 'rgba(255,255,255,0.22)' }
];

const MotionDiv = motion.div;

const BreathingSphere = ({
  isActive,
  phaseKey,
  scale,
  color,
  duration,
  motionKey,
  prefersReducedMotion = false
}) => {
  const gradientId = useId();
  const highlightId = useId();
  const filterId = useId();
  const clipId = useId();

  const motionConfig = useMemo(
    () => getMotionConfig({ isActive, phaseKey, scale, duration, prefersReducedMotion }),
    [isActive, phaseKey, scale, duration, prefersReducedMotion]
  );

  return (
    <MotionDiv
      key={isActive ? motionKey : 'sphere-rest'}
      className="breathing-sphere"
      style={{
        filter: `drop-shadow(0 0 26px ${color}66) drop-shadow(0 0 60px ${color}33)`
      }}
      {...motionConfig}
    >
      <svg viewBox="0 0 320 320" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="52" y1="44" x2="260" y2="278" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.7" />
            <stop offset="48%" stopColor="#67e8f9" stopOpacity="0.72" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.7" />
          </linearGradient>
          <radialGradient id={highlightId} cx="0.38" cy="0.3" r="0.7">
            <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
            <stop offset="28%" stopColor="rgba(255,255,255,0.45)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="8" result="softGlow" />
            <feOffset dy="2" />
            <feFlood floodColor="#ffffff" floodOpacity="0.22" />
            <feComposite in2="softGlow" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id={clipId}>
            <path d="M160 18 L220 44 L268 64 L300 118 L286 196 L246 238 L202 280 L160 304 L118 280 L74 238 L34 196 L20 118 L52 64 L100 44 Z" />
          </clipPath>
        </defs>

        <g filter={`url(#${filterId})`}>
          <path
            d="M160 18 L220 44 L268 64 L300 118 L286 196 L246 238 L202 280 L160 304 L118 280 L74 238 L34 196 L20 118 L52 64 L100 44 Z"
            fill={`url(#${gradientId})`}
            stroke="rgba(255,255,255,0.38)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          <g clipPath={`url(#${clipId})`}>
            {facetPolygons.map((facet) => (
              <polygon
                key={facet.points}
                points={facet.points}
                fill={facet.fill}
                stroke="rgba(255,255,255,0.22)"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            ))}

            <path
              d="M64 82 C118 44, 202 36, 254 94"
              stroke="rgba(255,255,255,0.24)"
              strokeWidth="1.6"
              fill="none"
            />
            <path
              d="M54 190 C98 218, 168 238, 256 198"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1.6"
              fill="none"
            />
            <ellipse cx="136" cy="102" rx="98" ry="72" fill={`url(#${highlightId})`} />
          </g>

          <path
            d="M84 146 L160 82 L236 146"
            stroke="rgba(255,255,255,0.16)"
            strokeWidth="1.4"
            fill="none"
          />
          <path
            d="M74 238 L160 158 L246 238"
            stroke="rgba(255,255,255,0.16)"
            strokeWidth="1.4"
            fill="none"
          />
        </g>
      </svg>
    </MotionDiv>
  );
};

export default BreathingSphere;
