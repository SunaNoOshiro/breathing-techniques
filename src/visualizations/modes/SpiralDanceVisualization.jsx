import React from 'react';
import { VisualizationMode } from '../VisualizationMode.js';
import SpiralDanceCanvas from '../primitives/SpiralDanceCanvas.jsx';

export class SpiralDanceVisualization extends VisualizationMode {
  getKey() { return 'spiral-dance'; }
  getLabel() { return 'visualization.spiralDance'; }

  render(props) {
    const {
      containerDimensions,
      currentPhase,
      phaseProgress = 0,
      isActive = false,
      isRunning = false,
      prefersReducedMotion = false,
      phaseColor = '#2dd4bf',
      trackColor = 'rgba(148, 163, 184, 0.22)',
      cycleIndex = 0
    } = props;

    return (
      <SpiralDanceCanvas
        containerDimensions={containerDimensions}
        currentPhase={currentPhase}
        phaseProgress={phaseProgress}
        isActive={isActive}
        isAnimating={isRunning}
        prefersReducedMotion={prefersReducedMotion}
        phaseColor={phaseColor}
        trackColor={trackColor}
        cycleIndex={cycleIndex}
      />
    );
  }
}
