import React from 'react';
import { VisualizationMode } from '../VisualizationMode.js';
import BreathingFigure from '../../components/Visualization/BreathingFigure.jsx';
import VisualizationPoint from '../../components/Visualization/VisualizationPoint.jsx';

export class ClassicVisualization extends VisualizationMode {
  getKey() { return 'classic'; }
  getLabel() { return 'visualization.classic'; }

  render(props) {
    const {
      visualizationPoints,
      isRunning,
      activePointIndex,
      currentTechnique,
      themeColors,
      currentColors,
      containerDimensions,
      currentPhase,
      lungData,
      diaphragmOffset
    } = props;

    return (
      <>
        {visualizationPoints.map((point, idx) => {
          const isActive = isRunning && idx === activePointIndex;
          const isDone = isRunning && idx <= activePointIndex;
          return (
            <VisualizationPoint
              key={idx}
              point={point}
              isActive={isActive}
              isDone={isDone}
              currentTechnique={currentTechnique}
              themeColors={themeColors}
              currentColors={currentColors}
              containerDimensions={containerDimensions}
            />
          );
        })}
        {currentTechnique && (
          <BreathingFigure
            currentTechnique={currentTechnique}
            currentPhase={currentPhase}
            lungData={lungData}
            diaphragmOffset={diaphragmOffset}
            currentColors={currentColors}
            containerDimensions={containerDimensions}
          />
        )}
      </>
    );
  }
}




