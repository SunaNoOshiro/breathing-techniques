# Visualization Primitives

Reusable components for building visualization modes.

## Components

### LayeredShape.jsx
Simple layered shapes with smooth crossfading.

**Props:**
- `shapeRenderer` - A ShapeRenderer instance
- `currentTechnique`, `currentPhase`, `currentColors`, `containerDimensions`

**Behavior:**
- Number of layers = phase duration (seconds)
- Outer layers fade as inner layers appear
- Previous phase overlaps with fade-out

### NestedLayeredShape.jsx
Perfectly nested shapes (each fits exactly inside the previous).

**Props:**
- `rendererSelector` - Function: `(layerIndex, context) => ShapeRenderer`
- Same props as LayeredShape

**Behavior:**
- Uses geometric formulas for perfect nesting
- Binary search for complex polygon pairs
- Used by DecreasingAngles and Random modes

## Shape Renderers

See **`shapes/README.md`** for complete documentation.

**Quick reference:**
- `new PolygonRenderer(N)` - Any N-sided polygon
- `CircleRenderer`, `TriangleRenderer`, `SquareRenderer`
- `HexagonRenderer`, `OctagonRenderer`, `DodecagonRenderer`

## Usage Example

```javascript
import LayeredShape from './primitives/LayeredShape.jsx';
import { CircleRenderer } from './primitives/shapes/CircleRenderer.jsx';

const circle = new CircleRenderer();
<LayeredShape shapeRenderer={circle} {...props} />
```

