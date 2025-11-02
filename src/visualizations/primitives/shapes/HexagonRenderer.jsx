import { PolygonRenderer } from './PolygonRenderer.jsx';

/**
 * HexagonRenderer - 6-sided regular polygon
 * Extends PolygonRenderer for consistency
 */
export class HexagonRenderer extends PolygonRenderer {
  constructor() {
    super(6); // 6 sides
  }

  getKey() {
    return 'hexagon';
  }
}


