import React, { useRef } from 'react';
import { VisualizationMode } from '../VisualizationMode.js';
import LayeredShape from '../primitives/LayeredShape.jsx';
import { CircleRenderer } from '../primitives/shapes/CircleRenderer.jsx';
import { TriangleRenderer } from '../primitives/shapes/TriangleRenderer.jsx';
import { HexagonRenderer } from '../primitives/shapes/HexagonRenderer.jsx';
import { SquareRenderer } from '../primitives/shapes/SquareRenderer.jsx';
import { OctagonRenderer } from '../primitives/shapes/OctagonRenderer.jsx';
import { DodecagonRenderer } from '../primitives/shapes/DodecagonRenderer.jsx';

// Create renderers once outside the component (ordered by number of sides)
const allRenderersOrdered = [
  new CircleRenderer(),     // ∞ sides (smooth)
  new TriangleRenderer(),   // 3 sides
  new SquareRenderer(),     // 4 sides
  new HexagonRenderer(),    // 6 sides
  new OctagonRenderer(),    // 8 sides
  new DodecagonRenderer()   // 12 sides
];

// Helper function to get next renderer
// First cycle: ordered sequence, After: random (avoiding last 2)
function getNextRenderer(currentIndex, history) {
  // If we're still in the ordered cycle (haven't completed all shapes once)
  if (currentIndex < allRenderersOrdered.length) {
    return {
      renderer: allRenderersOrdered[currentIndex],
      nextIndex: currentIndex + 1
    };
  }
  
  // After first cycle: random selection avoiding last 2 shapes
  const lastTwo = history.slice(-2).map(r => r.getKey());
  const availableRenderers = allRenderersOrdered.filter(r => !lastTwo.includes(r.getKey()));
  
  // Fallback if somehow no renderers available
  if (availableRenderers.length === 0) {
    return {
      renderer: allRenderersOrdered[0],
      nextIndex: currentIndex + 1
    };
  }
  
  // Pick random from available
  const randomIndex = Math.floor(Math.random() * availableRenderers.length);
  return {
    renderer: availableRenderers[randomIndex],
    nextIndex: currentIndex + 1
  };
}

// Wrapper component to track shape progression
function RandomShapeWrapper(props) {
  const {
    currentTechnique,
    currentPhase,
    currentColors,
    containerDimensions
  } = props;

  const phaseKey = currentPhase?.phase?.key || '';
  const currentRendererRef = useRef(null);
  const shapeIndexRef = useRef(0); // Track position in sequence
  const historyRef = useRef([]); // Track history for random mode
  const lastPhaseKeyRef = useRef(phaseKey);

  // When phase changes, select next renderer
  if (phaseKey !== lastPhaseKeyRef.current) {
    lastPhaseKeyRef.current = phaseKey;
    
    // Get next renderer based on current index and history
    const { renderer, nextIndex } = getNextRenderer(shapeIndexRef.current, historyRef.current);
    
    // Update refs
    currentRendererRef.current = renderer;
    shapeIndexRef.current = nextIndex;
    
    // Add to history (keep last 10 for safety, only last 2 are used)
    historyRef.current = [...historyRef.current.slice(-9), renderer];
  }

  // Initialize on first render (start with circle)
  if (!currentRendererRef.current) {
    const { renderer, nextIndex } = getNextRenderer(0, []);
    currentRendererRef.current = renderer;
    shapeIndexRef.current = nextIndex;
    historyRef.current = [renderer];
  }

  return (
    <LayeredShape
      shapeRenderer={currentRendererRef.current}
      currentTechnique={currentTechnique}
      currentPhase={currentPhase}
      currentColors={currentColors}
      containerDimensions={containerDimensions}
    />
  );
}

export class RandomObjectVisualization extends VisualizationMode {
  getKey() { return 'random-object'; }
  getLabel() { return 'visualization.random'; }

  render(props) {
    return <RandomShapeWrapper {...props} />;
  }
}


