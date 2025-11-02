import { PolygonRenderer } from './PolygonRenderer.jsx';

/**
 * NonagonRenderer - 9-sided regular polygon
 * Extends PolygonRenderer for consistency
 */
export class NonagonRenderer extends PolygonRenderer {
  constructor() {
    super(9); // 9 sides
  }

  getKey() {
    return 'nonagon';
  }
}

