import { lazy } from 'react';

export const LazyComponents = {
  SettingsScreen: lazy(() => import('./Settings/SettingsScreen.jsx')),
  TechniqueInfo: lazy(() => import('./Technique/TechniqueInfo.jsx')),
  DesktopControlPanel: lazy(() => import('./Desktop/DesktopControlPanel.jsx')),
  VisualizationContainer: lazy(() => import('./Visualization/VisualizationContainer.jsx'))
};
