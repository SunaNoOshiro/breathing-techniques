/**
 * VisualizationMode Interface (base class)
 * Strategy pattern for visualization rendering.
 */

export class VisualizationMode {
  /** @returns {string} unique key */
  getKey() {
    throw new Error('getKey() must be implemented');
  }

  /** @returns {string} localized or human-readable label */
  getLabel() {
    return this.getKey();
  }

  /**
   * Render the mode
   * @param {object} props - container-provided props
   * Required props include:
   *  - currentTechnique, currentPhase, currentColors, containerDimensions
   *  - visualizationPoints, isRunning, activePointIndex, themeColors
   *  - lungData, diaphragmOffset
   * @returns {React.ReactNode}
   */
  render(props) {
    throw new Error('render(props) must be implemented');
  }
}




