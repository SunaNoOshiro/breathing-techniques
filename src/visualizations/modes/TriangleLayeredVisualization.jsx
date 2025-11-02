import React from 'react';
import { VisualizationMode } from '../VisualizationMode.js';
import LayeredShape from '../primitives/LayeredShape.jsx';
import { TriangleRenderer } from '../primitives/shapes/TriangleRenderer.jsx';

const triangleRenderer = new TriangleRenderer();

export class TriangleLayeredVisualization extends VisualizationMode {
  getKey() { return 'triangle'; }
  getLabel() { return 'visualization.triangle'; }

  render(props) {
    const {
      currentTechnique,
      currentPhase,
      currentColors,
      containerDimensions
    } = props;

    return (
      <LayeredShape
        shapeRenderer={triangleRenderer}
        currentTechnique={currentTechnique}
        currentPhase={currentPhase}
        currentColors={currentColors}
        containerDimensions={containerDimensions}
      />
    );
  }
}


