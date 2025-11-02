import React from 'react';
import { ShapeRenderer } from './ShapeRenderer.js';

export class CircleRenderer extends ShapeRenderer {
  getKey() { return 'circle'; }
  render(cx, cy, size, fill) {
    if (size <= 0) return null;
    return <circle cx={cx} cy={cy} r={size / 2} fill={fill} />;
  }

  getPolygonPoints(cx, cy, size, samples = 60) {
    const r = size / 2;
    const pts = [];
    for (let i = 0; i < samples; i++) {
      const a = (i / samples) * Math.PI * 2;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    return pts;
  }
}


