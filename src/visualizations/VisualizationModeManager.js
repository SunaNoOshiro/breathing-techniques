import { VisualizationMode } from './VisualizationMode.js';

export class VisualizationModeManager {
  constructor() {
    this.modes = new Map();
    this.orderedKeys = [];
  }

  register(modeInstance) {
    if (!(modeInstance instanceof VisualizationMode)) {
      throw new Error('Mode must extend VisualizationMode');
    }
    const key = modeInstance.getKey();
    this.modes.set(key, modeInstance);
    if (!this.orderedKeys.includes(key)) this.orderedKeys.push(key);
  }

  getKeys() {
    return [...this.orderedKeys];
  }

  getLabel(key) {
    return this.modes.get(key)?.getLabel() || key;
  }

  getDefaultKey() {
    return this.orderedKeys[0] || null;
  }

  getNextKey(currentKey) {
    const keys = this.getKeys();
    if (!keys.length) return null;
    const idx = Math.max(0, keys.indexOf(currentKey));
    return keys[(idx + 1) % keys.length];
  }

  getPrevKey(currentKey) {
    const keys = this.getKeys();
    if (!keys.length) return null;
    const idx = Math.max(0, keys.indexOf(currentKey));
    return keys[(idx - 1 + keys.length) % keys.length];
  }

  getMode(key) {
    return this.modes.get(key);
  }

  render(key, props) {
    const mode = this.getMode(key);
    if (!mode) return null;
    return mode.render(props);
  }
}

export const visualizationModeManager = new VisualizationModeManager();




