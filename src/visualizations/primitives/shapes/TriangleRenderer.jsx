import React from 'react';
import { ShapeRenderer } from './ShapeRenderer.js';

function getTrianglePoints(cx, cy, size) {
  const half = size / 2;
  const heightTri = (Math.sqrt(3) / 2) * size;
  return [
    [cx, cy - heightTri / 2],
    [cx - half, cy + heightTri / 2],
    [cx + half, cy + heightTri / 2]
  ]
    .map((p) => p.join(','))
    .join(' ');
}

export class TriangleRenderer extends ShapeRenderer {
  constructor() {
    super();
    this.sides = 3; // Triangle has 3 sides
  }
  
  getKey() { return 'triangle'; }
  render(cx, cy, size, fill) {
    if (size <= 0) return null;
    const points = getTrianglePoints(cx, cy, size);
    return <polygon points={points} fill={fill} />;
  }

  getPolygonPoints(cx, cy, size) {
    const half = size / 2;
    const heightTri = (Math.sqrt(3) / 2) * size;
    return [
      [cx, cy - heightTri / 2],
      [cx - half, cy + heightTri / 2],
      [cx + half, cy + heightTri / 2]
    ];
  }
}


