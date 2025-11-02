# Visualization System

A flexible, SOLID-compliant visualization system for breathing techniques.

## Active Modes (4)

### 1. 🫁 Organic Flow (Classic)
- Traditional lungs and diaphragm animation with breathing points
- File: `modes/ClassicVisualization.jsx`

### 2. 🎲 Shape Shifter (Random)
- One random shape per breathing phase (changes on phase transitions)
- Includes: Circle, Triangle, Square, Hexagon, Octagon, Dodecagon
- First full cycle: ordered sequence by number of sides
- After that: random shapes (avoiding last 2 used)
- Uses `LayeredShape` with geometric ratio sizing (0.85^i)
- File: `modes/RandomObjectVisualization.jsx`

### 3. 🔻 Geometric Cascade (Decreasing Angles)
- Shapes decrease in complexity from outer to inner layers
- Number of shapes = phase duration (seconds)
- Pattern: N sides decreasing by 1 → ending with line (2 sides) and point (1 side)
- Example (8 steps): 7→6→5→4→3→2→1
- Uses `NestedLayeredShape` for perfect geometric nesting
- File: `modes/DecreasingAnglesVisualization.jsx`

### 4. 🌀 Spiral Dance (Rotating)
- Layered shapes with progressive rotation and linear size scaling
- Changes shape each breathing phase (Square → Pentagon → Hexagon → Heptagon → Octagon → Nonagon → Decagon → Hendecagon → Dodecagon)
- **Rotation**: Each layer rotates by half of natural angle (360°/sides/2)
  - Example: Square layers rotate by 45°, creating diamond pattern
- **Size scaling**: Linear percentage reduction (100% → 90% → 80%... based on phase duration)
- **Smooth transitions**: Each layer fades in already rotated
- After first cycle: random shapes (avoiding last 2)
- File: `modes/RotatingShapeVisualization.jsx`

## Architecture

```
src/visualizations/
├── VisualizationMode.js          # Base interface
├── VisualizationModeManager.js   # Mode management
├── index.js                      # Mode registration
├── modes/                        # Visualization implementations
└── primitives/                   # Reusable components
    ├── LayeredShape.jsx          # Simple layering
    ├── NestedLayeredShape.jsx    # Perfect geometric nesting
    └── shapes/                   # Shape renderers (see shapes/README.md)
```

## Adding a New Mode

1. Create class extending `VisualizationMode` in `modes/`
2. Implement: `getKey()`, `getLabel()`, `render(props)`
3. Register in `index.js`

```javascript
export class MyMode extends VisualizationMode {
  getKey() { return 'my-mode'; }
  getLabel() { return 'My Mode'; }
  render(props) { return <MyComponent {...props} />; }
}
```

## Documentation

- **Primitives**: See `primitives/README.md`
- **Shapes**: See `primitives/shapes/README.md`

