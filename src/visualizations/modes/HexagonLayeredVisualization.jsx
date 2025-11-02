import React from 'react';
import { VisualizationMode } from '../VisualizationMode.js';
import LayeredShape from '../primitives/LayeredShape.jsx';
import { HexagonRenderer } from '../primitives/shapes/HexagonRenderer.jsx';

const hexagonRenderer = new HexagonRenderer();

export class HexagonLayeredVisualization extends VisualizationMode {
  getKey() { return 'hexagon'; }
  getLabel() { return 'visualization.hexagon'; }

  render(props) {
    const {
      currentTechnique,
      currentPhase,
      currentColors,
      containerDimensions
    } = props;

    return (
      <LayeredShape
        shapeRenderer={hexagonRenderer}
        currentTechnique={currentTechnique}
        currentPhase={currentPhase}
        currentColors={currentColors}
        containerDimensions={containerDimensions}
      />
    );
  }
}




