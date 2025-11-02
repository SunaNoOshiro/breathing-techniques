import { PolygonRenderer } from './PolygonRenderer.jsx';

/**
 * HendecagonRenderer - 11-sided regular polygon
 * Extends PolygonRenderer for consistency
 */
export class HendecagonRenderer extends PolygonRenderer {
  constructor() {
    super(11); // 11 sides
  }

  getKey() {
    return 'hendecagon';
  }
}

