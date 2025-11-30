/**
 * Visualization Point Component
 * Renders individual visualization points with animations
 */

import React from 'react';
import { ANIMATION_CONFIG } from '../../utils/animationUtils.js';

/**
 * Visualization Point Component
 * Renders a single visualization point with proper styling and animations
 */
const VisualizationPoint = ({ 
  point, 
  isActive, 
  isDone, 
  currentTechnique, 
  themeColors, 
  currentColors, 
  containerDimensions 
}) => {
  // Calculate point size based on technique and screen size
  const pointSize = React.useMemo(() => {
    const isSquare = currentTechnique.phases.length === 4;
    const isTriangle = currentTechnique.phases.length === 3;
    const isTwoPhase = currentTechnique.phases.length === 2;
    
    // Special handling for specific techniques
    const isCoherent55 = currentTechnique.id === 'coherent'; // 5-5
    const isTriangle444 = currentTechnique.id === 'triangle'; // 4-4-4
    const isEqual555 = currentTechnique.id === '555'; // 5-5-5
    
    // Base sizes for different shapes
    let baseDotSize;
    if (isSquare) {
      baseDotSize = 50; // Larger for square breathing
    } else if (isTriangle444 || isEqual555) {
      baseDotSize = 45; // Bigger for 4-4-4 and 5-5-5
    } else if (isCoherent55) {
      baseDotSize = 48; // Bigger for 5-5
    } else if (isTriangle) {
      baseDotSize = 35; // Default for other triangle breathing
    } else {
      baseDotSize = 42; // Default for other shapes
    }
    
    // Scale based on screen size
    const screenWidth = window.innerWidth;
    let sizeScaleFactor = 1;
    if (screenWidth >= 1024) {
      sizeScaleFactor = 1.2; // Desktop: larger points
    } else if (screenWidth >= 768) {
      sizeScaleFactor = 1.1; // Tablet: slightly larger
    } else {
      sizeScaleFactor = 0.7; // Mobile: smaller points to fit better
    }
    
    return Math.round(baseDotSize * sizeScaleFactor);
  }, [currentTechnique]);

  // Calculate scaled position
  const scaledPosition = React.useMemo(() => {
    // containerDimensions now contains numeric values
    const containerHeight = containerDimensions.height || 400;
    const containerWidth = containerDimensions.width || 400;
    
    // Add padding to account for point sizes (avoid clipping at edges)
    const isMobile = window.innerWidth < 768;
    const padding = isMobile ? 40 : 20; // Extra padding on mobile for point circles
    const effectiveWidth = containerWidth - padding;
    const effectiveHeight = containerHeight - padding;
    
    // Use the smaller dimension to maintain aspect ratio
    const scaleFactor = Math.min(effectiveHeight / 420, effectiveWidth / 420);
    
    // Move points up for specified techniques
    const moveUpTechniques = ['478', '478-extended', '555', 'triangle', '628'];
    const shouldMoveUp = moveUpTechniques.includes(currentTechnique.id);
    
    let upOffset = 0;
    if (currentTechnique.id === '555' || currentTechnique.id === 'triangle') {
      upOffset = -35; // Move up more for 5-5-5 and 4-4-4
    } else if (shouldMoveUp) {
      upOffset = -20; // Standard upward movement
    }
    
    // Center the points properly within the container
    const scaledX = (point.x * scaleFactor) + ((containerWidth - (420 * scaleFactor)) / 2);
    const scaledY = (point.y * scaleFactor) + upOffset + (padding / 2);
    
    return { x: scaledX, y: scaledY };
  }, [point, containerDimensions, currentTechnique]);

  // Calculate point styles
  const pointStyles = React.useMemo(() => {
    const isLightTheme = currentColors.themeKey === 'light';
    const halfSize = pointSize / 2;
    // Make font size proportional to point size (40% of point size)
    const fontSize = Math.round(pointSize * 0.4);

    const gradientCore = `radial-gradient(circle at 30% 30%, ${themeColors.active}dd, ${themeColors.active}99, ${themeColors.idle}44)`;

    return {
      container: {
        position: 'absolute',
        width: pointSize,
        height: pointSize,
        marginLeft: -halfSize,
        marginTop: -halfSize,
        left: scaledPosition.x,
        top: scaledPosition.y,
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      },
      glow: {
        position: 'absolute',
        width: pointSize * 1.6,
        height: pointSize * 1.6,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${themeColors.active}55, transparent 65%)`,
        filter: 'blur(18px)',
        opacity: isActive ? 0.9 : (isDone ? 0.55 : 0.35),
        transition: `opacity ${ANIMATION_CONFIG.dotTransition.duration}ms ${ANIMATION_CONFIG.dotTransition.ease}`,
      },
      ring: {
        position: 'absolute',
        width: pointSize * 1.25,
        height: pointSize * 1.25,
        borderRadius: '50%',
        border: `2px solid ${isDone ? themeColors.active : (isLightTheme ? currentColors.stroke : themeColors.idle)}`,
        boxShadow: isActive
          ? `0 0 24px ${themeColors.active}aa`
          : `0 0 12px ${themeColors.active}55`,
        opacity: isActive ? 1 : 0.65,
        transition: `all ${ANIMATION_CONFIG.dotTransition.duration}ms ${ANIMATION_CONFIG.dotTransition.ease}`,
      },
      core: {
        position: 'relative',
        width: pointSize,
        height: pointSize,
        borderRadius: '50%',
        background: isDone ? gradientCore : (isLightTheme ? 'rgba(255, 255, 255, 0.85)' : 'rgba(15, 23, 42, 0.65)'),
        border: `2px solid ${isDone ? themeColors.active : (isLightTheme ? currentColors.stroke : themeColors.idle)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `${fontSize}px`,
        fontWeight: '700',
        color: isDone ? (isLightTheme ? '#ffffff' : '#0B1020') : (isLightTheme ? currentColors.text : themeColors.textIdle),
        boxShadow: isActive
          ? `0 0 0 4px ${themeColors.active}55, inset 0 0 16px ${themeColors.active}aa`
          : (isDone ? `0 0 0 2px ${themeColors.active}33` : 'none'),
        transition: `all ${ANIMATION_CONFIG.dotTransition.duration}ms ${ANIMATION_CONFIG.dotTransition.ease}`,
        backdropFilter: isLightTheme ? 'blur(2px)' : 'none',
        overflow: 'hidden',
      }
    };
  }, [pointSize, scaledPosition, isActive, isDone, themeColors, currentColors]);

  return (
    <div style={pointStyles.container}>
      <div style={pointStyles.glow} />
      <div style={pointStyles.ring} />
      <div style={pointStyles.core}>{point.label}</div>
    </div>
  );
};

export default VisualizationPoint;
