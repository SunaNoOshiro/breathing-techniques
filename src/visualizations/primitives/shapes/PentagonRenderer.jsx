import { PolygonRenderer } from './PolygonRenderer.jsx';

/**
 * PentagonRenderer - 5-sided regular polygon
 * Extends PolygonRenderer for consistency
 */
export class PentagonRenderer extends PolygonRenderer {
  constructor() {
    super(5); // 5 sides
  }

  getKey() {
    return 'pentagon';
  }
}

