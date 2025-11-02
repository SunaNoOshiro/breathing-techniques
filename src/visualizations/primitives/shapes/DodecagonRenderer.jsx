import { PolygonRenderer } from './PolygonRenderer.jsx';

/**
 * DodecagonRenderer - 12-sided regular polygon
 * Extends PolygonRenderer for consistency
 */
export class DodecagonRenderer extends PolygonRenderer {
  constructor() {
    super(12); // 12 sides
  }

  getKey() {
    return 'dodecagon';
  }
}

