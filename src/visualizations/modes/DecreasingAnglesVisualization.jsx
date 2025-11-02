import React from 'react';
import { VisualizationMode } from '../VisualizationMode.js';
import NestedLayeredShape from '../primitives/NestedLayeredShape.jsx';
import { CircleRenderer } from '../primitives/shapes/CircleRenderer.jsx';
import { TriangleRenderer } from '../primitives/shapes/TriangleRenderer.jsx';
import { SquareRenderer } from '../primitives/shapes/SquareRenderer.jsx';
import { PolygonRenderer } from '../primitives/shapes/PolygonRenderer.jsx';

// Generate shape sequence based on number of steps
// Decreases by 1 side each time, ending with circle
// Example for 8 steps: 9, 8, 7, 6, 5, 4, 3, circle
function generateShapeSequence(numSteps) {
  if (numSteps <= 0) return [new CircleRenderer()];
  if (numSteps === 1) return [new CircleRenderer()];
  
  const shapes = [];
  
  // Calculate starting number of sides
  // We want: numSteps - 1 polygons + 1 circle
  // Last shape is always circle, before that decrease by 1
  // So if numSteps = 8: 9, 8, 7, 6, 5, 4, 3, circle
  const startingSides = numSteps + 1;
  
  // Generate decreasing polygons (decrease by 1 each time)
  for (let i = 0; i < numSteps - 1; i++) {
    const sides = startingSides - i;
    
    // Use specific renderers for common shapes, PolygonRenderer for others
    if (sides === 3) {
      shapes.push(new TriangleRenderer());
    } else if (sides === 4) {
      shapes.push(new SquareRenderer());
    } else {
      shapes.push(new PolygonRenderer(sides));
    }
  }
  
  // Always end with circle
  shapes.push(new CircleRenderer());
  
  return shapes;
}

export class DecreasingAnglesVisualization extends VisualizationMode {
  getKey() { return 'decreasing-angles'; }
  getLabel() { return 'visualization.decreasing'; }

  render(props) {
    const {
      currentTechnique,
      currentPhase,
      currentColors,
      containerDimensions
    } = props;

    // Get number of steps from current phase duration
    const numSteps = currentPhase?.duration || 4;
    
    // Generate shape sequence based on number of steps
    const shapeSequence = generateShapeSequence(numSteps);

    // Selector: pick shape based on layer index
    const rendererSelector = (layerIndex) => {
      if (layerIndex >= shapeSequence.length) {
        return shapeSequence[shapeSequence.length - 1]; // Use circle for overflow
      }
      return shapeSequence[layerIndex];
    };

    return (
      <NestedLayeredShape
        rendererSelector={rendererSelector}
        currentTechnique={currentTechnique}
        currentPhase={currentPhase}
        currentColors={currentColors}
        containerDimensions={containerDimensions}
      />
    );
  }
}

