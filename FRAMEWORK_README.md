# Breathing Techniques Framework

A modular, extensible framework for breathing technique applications built with React. Each technique is isolated in its own file with custom logic for visualization, timing, and behavior.

## Architecture

### Core Components

1. **BaseTechnique** - Abstract base class that all techniques extend
2. **TechniqueRegistry** - Factory and registry for managing techniques
3. **Individual Technique Classes** - Each breathing pattern in its own file
4. **Shared Utilities** - Common functionality for colors, audio, animations

### Design Patterns Used

- **Factory Pattern** - TechniqueRegistry creates technique instances
- **Strategy Pattern** - Each technique implements its own visualization and behavior
- **Template Method Pattern** - BaseTechnique defines common structure, subclasses customize
- **Singleton Pattern** - TechniqueRegistry is a singleton instance
- **Observer Pattern** - React state management for UI updates

## File Structure

```
src/
├── techniques/
│   ├── BaseTechnique.js              # Base class with common functionality
│   ├── TechniqueRegistry.js          # Factory and registry
│   ├── BoxBreathingTechnique.js      # 4-4-4-4 pattern
│   ├── FourSevenEightTechnique.js    # 4-7-8 pattern
│   ├── ExtendedFourSevenEightTechnique.js # 6-10-12 pattern
│   ├── TriangleBreathingTechnique.js # 4-4-4 pattern
│   ├── EqualBreathingTechnique.js    # 5-5-5 pattern
│   ├── EnergyBreathingTechnique.js   # 6-2-8 pattern
│   ├── ExtendedBoxBreathingTechnique.js # 6-6-6-6 pattern
│   └── CoherentBreathingTechnique.js # 5-5 pattern
├── utils/
│   └── breathingUtils.js             # Shared utilities
├── breathingFramework.js            # Main export file
└── App.jsx                          # Main React component
```

## Adding New Techniques

To add a new breathing technique:

1. Create a new file in `src/techniques/`
2. Extend `BaseTechnique` class
3. Implement required methods
4. Register in `TechniqueRegistry.js`

### Example:

```javascript
import { BaseTechnique } from './BaseTechnique.js';

export class MyCustomTechnique extends BaseTechnique {
  constructor() {
    super({
      id: 'my-custom',
      name: 'My Custom Breathing',
      description: 'Custom breathing pattern',
      benefits: 'Custom benefits',
      phases: [
        { key: 'inhale', name: 'Inhale' },
        { key: 'exhale', name: 'Exhale' }
      ],
      durationsSec: [3, 3],
      pattern: '3-3',
    });
  }

  // Override methods for custom behavior
  getColorScheme() {
    return {
      primary: '#FF6B6B',
      secondary: '#4ECDC4',
      // ... custom colors
    };
  }

  getVisualizationPoints() {
    // Custom visualization layout
    return this.generateCircularLayout();
  }
}
```

## Technique Customization

Each technique can customize:

- **Colors** - `getColorScheme()` and `getPhaseColors()`
- **Visualization** - `getVisualizationPoints()` for custom layouts
- **Scaling** - `getLungScaling()` for custom lung animations
- **Instructions** - `getInstructions()` for technique-specific guidance

## Benefits of This Architecture

1. **Isolation** - Each technique is self-contained
2. **Extensibility** - Easy to add new techniques
3. **Maintainability** - Clear separation of concerns
4. **Reusability** - Shared utilities prevent code duplication
5. **Testability** - Each component can be tested independently
6. **Flexibility** - Techniques can have unique behaviors

## Usage

```javascript
import { techniqueRegistry } from './breathingFramework.js';

// Get all techniques
const techniques = techniqueRegistry.getAllTechniques();

// Get specific technique
const technique = techniqueRegistry.getTechnique('box4');

// Create new instance
const instance = techniqueRegistry.createTechnique('box4');

// Search techniques
const results = techniqueRegistry.searchTechniques('relaxation');
```

## Future Enhancements

- Technique categories (beginner, intermediate, advanced)
- Difficulty levels
- Custom technique builder
- Technique sharing/export
- Analytics and progress tracking
- Custom audio patterns per technique
