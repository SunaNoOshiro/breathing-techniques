# Shape Renderers

Shape renderers follow the **Strategy Pattern** and implement the `ShapeRenderer` interface.

## Architecture

```
ShapeRenderer (interface)
├── PolygonRenderer (generic N-sided polygon)
│   ├── HexagonRenderer (6 sides)
│   ├── OctagonRenderer (8 sides)
│   └── DodecagonRenderer (12 sides)
├── CircleRenderer (special case: infinite sides)
├── TriangleRenderer (equilateral triangle)
└── SquareRenderer (4 sides)
```

## SOLID Principles Applied

### Single Responsibility Principle (SRP)
- Each renderer is responsible for rendering only one type of shape
- `PolygonRenderer` handles the generic polygon logic
- Specific renderers (Hexagon, Octagon, etc.) only specify the number of sides

### Open/Closed Principle (OCP)
- New shapes can be added without modifying existing code
- Simply extend `PolygonRenderer` or `ShapeRenderer`

### Liskov Substitution Principle (LSP)
- All shape renderers can be used interchangeably via the `ShapeRenderer` interface
- `HexagonRenderer` can replace `PolygonRenderer(6)` without breaking anything

### Interface Segregation Principle (ISP)
- `ShapeRenderer` defines minimal interface: `getKey()`, `render()`, `getPolygonPoints()`
- No unnecessary methods

### Dependency Inversion Principle (DIP)
- Visualization modes depend on `ShapeRenderer` interface, not concrete implementations
- `LayeredShape` and `NestedLayeredShape` accept any `ShapeRenderer`

## Available Shape Renderers

| Renderer | Sides | Key | Size Parameter |
|----------|-------|-----|----------------|
| `CircleRenderer` | ∞ | `circle` | Diameter |
| `TriangleRenderer` | 3 | `triangle` | Base width |
| `SquareRenderer` | 4 | `square` | Side length |
| `HexagonRenderer` | 6 | `hexagon` | Diameter (circumradius * 2) |
| `OctagonRenderer` | 8 | `octagon` | Diameter (circumradius * 2) |
| `DodecagonRenderer` | 12 | `dodecagon` | Diameter (circumradius * 2) |
| `PolygonRenderer(N)` | N | `polygon-N` | Diameter (circumradius * 2) |

## Usage

### Using PolygonRenderer directly
```javascript
import { PolygonRenderer } from './primitives/shapes/PolygonRenderer.jsx';

// Create a pentagon (5 sides)
const pentagon = new PolygonRenderer(5);

// Use in a visualization
<LayeredShape shapeRenderer={pentagon} {...props} />
```

### Using specific renderers
```javascript
import { HexagonRenderer } from './primitives/shapes/HexagonRenderer.jsx';

const hexagon = new HexagonRenderer();
<LayeredShape shapeRenderer={hexagon} {...props} />
```

### Creating a custom named renderer
```javascript
// PentagonRenderer.jsx
import { PolygonRenderer } from './PolygonRenderer.jsx';

export class PentagonRenderer extends PolygonRenderer {
  constructor() {
    super(5); // 5 sides
  }
  
  getKey() {
    return 'pentagon'; // Custom key instead of 'polygon-5'
  }
}
```

## Implementation Details

### PolygonRenderer
- Calculates vertices using trigonometry
- Evenly distributes vertices around a circle
- Adjusts start angle for better orientation:
  - Even-sided polygons: rotated by π/N for flat bottom
  - Odd-sided polygons: point at top (-π/2 start angle)

### Size Parameter
All polygon renderers use `size` as the **diameter** (2 × circumradius):
- `size / 2` = circumradius (distance from center to vertex)
- All vertices lie on a circle of radius `size / 2`

### Coordinate Calculation
```javascript
for each vertex i from 0 to N-1:
  angle = startAngle + (i * 2π / N)
  x = cx + (size/2) * cos(angle)
  y = cy + (size/2) * sin(angle)
```

## Perfect Nesting

The `NestedLayeredShape` component uses geometric formulas to ensure shapes nest perfectly:

### Exact Formulas
- Circle → Triangle: `triangleSize = diameter * √3 / 2`
- Triangle → Circle: `circleDiameter = baseWidth / √3`
- Circle → Square: `squareSize = diameter / √2`
- Square → Circle: `circleDiameter = sideLength`
- Circle → Hexagon/Octagon/Dodecagon: `polygonSize ≈ diameter * 0.997`

### Binary Search
For complex polygon-to-polygon nesting (e.g., octagon → hexagon), a binary search algorithm finds the maximum inner size that fits perfectly within the outer shape.

## Adding New Shapes

1. **For regular polygons**: Just use `new PolygonRenderer(N)`
2. **For named polygons**: Extend `PolygonRenderer` and override `getKey()`
3. **For custom shapes**: Extend `ShapeRenderer` and implement all methods

No changes needed to visualization modes or containers!

