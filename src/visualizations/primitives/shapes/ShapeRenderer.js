/**
 * ShapeRenderer Strategy Interface
 * Concrete implementations must provide getKey() and render(cx, cy, size, fill)
 */

export class ShapeRenderer {
  getKey() {
    throw new Error('getKey() must be implemented');
  }

  /**
   * @param {number} cx
   * @param {number} cy
   * @param {number} size
   * @param {string} fill
   * @returns {React.ReactNode}
   */
  render(cx, cy, size, fill) {
    throw new Error('render(cx, cy, size, fill) must be implemented');
  }

  /**
   * Return polygon points approximating the shape for layout calculations
   * @param {number} cx
   * @param {number} cy
   * @param {number} size
   * @param {number} samples - for curved shapes (e.g., circle)
   * @returns {Array<[number, number]>}
   */
  getPolygonPoints(cx, cy, size, samples = 60) {
    throw new Error('getPolygonPoints(cx, cy, size, samples) must be implemented');
  }
}


