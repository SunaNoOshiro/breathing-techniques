import React from 'react';
import { VisualizationMode } from '../VisualizationMode.js';
import LayeredShape from '../primitives/LayeredShape.jsx';
import { SquareRenderer } from '../primitives/shapes/SquareRenderer.jsx';

const squareRenderer = new SquareRenderer();

export class SquareLayeredVisualization extends VisualizationMode {
  getKey() { return 'square'; }
  getLabel() { return 'visualization.square'; }

  render(props) {
    return <LayeredShape {...props} shapeRenderer={squareRenderer} />;
  }
}



