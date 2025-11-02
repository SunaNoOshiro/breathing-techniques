import React from 'react';
import { ShapeRenderer } from './ShapeRenderer.js';

function getSquarePoints(cx, cy, size) {
  const half = size / 2;
  return [
    [cx - half, cy - half],
    [cx + half, cy - half],
    [cx + half, cy + half],
    [cx - half, cy + half]
  ]
    .map((p) => p.join(','))
    .join(' ');
}

export class SquareRenderer extends ShapeRenderer {
  constructor() {
    super();
    this.sides = 4; // Square has 4 sides
  }
  
  getKey() { return 'square'; }
  render(cx, cy, size, fill) {
    if (size <= 0) return null;
    const points = getSquarePoints(cx, cy, size);
    return <polygon points={points} fill={fill} />;
  }

  getPolygonPoints(cx, cy, size) {
    const half = size / 2;
    return [
      [cx - half, cy - half],
      [cx + half, cy - half],
      [cx + half, cy + half],
      [cx - half, cy + half]
    ];
  }
}



