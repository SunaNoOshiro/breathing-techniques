import React from 'react';
import { ShapeRenderer } from './ShapeRenderer.js';

/**
 * Generic Polygon Renderer
 * Renders a regular polygon with N sides
 */
export class PolygonRenderer extends ShapeRenderer {
  constructor(sides) {
    super();
    this.sides = sides;
  }

  getKey() {
    return `polygon-${this.sides}`;
  }

  render(cx, cy, size, fill) {
    if (size <= 0) return null;
    const points = this.getPolygonPoints(cx, cy, size);
    const pointsStr = points.map(p => p.join(',')).join(' ');
    return <polygon points={pointsStr} fill={fill} />;
  }

  getPolygonPoints(cx, cy, size) {
    const r = size / 2;
    const angleStep = (2 * Math.PI) / this.sides;
    // Adjust start angle based on whether sides are even or odd for better orientation
    const startAngle = this.sides % 2 === 0 ? Math.PI / this.sides : -Math.PI / 2;
    
    const points = [];
    for (let i = 0; i < this.sides; i++) {
      const angle = startAngle + i * angleStep;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      points.push([x, y]);
    }
    return points;
  }
}

