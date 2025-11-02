import { visualizationModeManager } from './VisualizationModeManager.js';
import { ClassicVisualization } from './modes/ClassicVisualization.jsx';
import { RandomObjectVisualization } from './modes/RandomObjectVisualization.jsx';
import { DecreasingAnglesVisualization } from './modes/DecreasingAnglesVisualization.jsx';
import { RotatingShapeVisualization } from './modes/RotatingShapeVisualization.jsx';

// Individual shape modes (kept for future extensibility)
import { CircleLayeredVisualization } from './modes/CircleLayeredVisualization.jsx';
import { TriangleLayeredVisualization } from './modes/TriangleLayeredVisualization.jsx';
import { HexagonLayeredVisualization } from './modes/HexagonLayeredVisualization.jsx';
import { SquareLayeredVisualization } from './modes/SquareLayeredVisualization.jsx';

// Register active modes
visualizationModeManager.register(new ClassicVisualization());
visualizationModeManager.register(new RandomObjectVisualization());
visualizationModeManager.register(new DecreasingAnglesVisualization());
visualizationModeManager.register(new RotatingShapeVisualization());

// Individual shape modes available but not registered
// To re-enable, uncomment these lines:
// visualizationModeManager.register(new CircleLayeredVisualization());
// visualizationModeManager.register(new TriangleLayeredVisualization());
// visualizationModeManager.register(new HexagonLayeredVisualization());
// visualizationModeManager.register(new SquareLayeredVisualization());

export { visualizationModeManager } from './VisualizationModeManager.js';


