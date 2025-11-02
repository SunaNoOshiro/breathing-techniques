import React from 'react';
import { VisualizationMode } from '../VisualizationMode.js';
import LayeredShape from '../primitives/LayeredShape.jsx';
import { CircleRenderer } from '../primitives/shapes/CircleRenderer.jsx';

const circleRenderer = new CircleRenderer();

export class CircleLayeredVisualization extends VisualizationMode {
  getKey() { return 'circle'; }
  getLabel() { return 'visualization.circle'; }

  render(props) {
    const {
      currentTechnique,
      currentPhase,
      currentColors,
      containerDimensions
    } = props;

    return (
      <LayeredShape
        shapeRenderer={circleRenderer}
        currentTechnique={currentTechnique}
        currentPhase={currentPhase}
        currentColors={currentColors}
        containerDimensions={containerDimensions}
      />
    );
  }
}


