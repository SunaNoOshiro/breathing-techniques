import { PolygonRenderer } from './PolygonRenderer.jsx';

/**
 * HeptagonRenderer - 7-sided regular polygon
 * Extends PolygonRenderer for consistency
 */
export class HeptagonRenderer extends PolygonRenderer {
  constructor() {
    super(7); // 7 sides
  }

  getKey() {
    return 'heptagon';
  }
}

