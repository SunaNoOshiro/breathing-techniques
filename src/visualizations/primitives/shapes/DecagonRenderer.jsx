import { PolygonRenderer } from './PolygonRenderer.jsx';

/**
 * DecagonRenderer - 10-sided regular polygon
 * Extends PolygonRenderer for consistency
 */
export class DecagonRenderer extends PolygonRenderer {
  constructor() {
    super(10); // 10 sides
  }

  getKey() {
    return 'decagon';
  }
}

