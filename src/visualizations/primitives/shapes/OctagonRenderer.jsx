import { PolygonRenderer } from './PolygonRenderer.jsx';

/**
 * OctagonRenderer - 8-sided regular polygon
 * Extends PolygonRenderer for consistency
 */
export class OctagonRenderer extends PolygonRenderer {
  constructor() {
    super(8); // 8 sides
  }

  getKey() {
    return 'octagon';
  }
}

