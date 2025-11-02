/**
 * Performance Optimizations
 * Provides utilities for code splitting, memoization, and lazy loading
 */

import { lazy, Suspense, memo, useMemo, useCallback } from 'react';
import { AnimatedLoading } from '../animations/BreathingAnimations.jsx';
import { useLocalization } from '../contexts/LocalizationContext.jsx';
import Logger from '../utils/Logger.js';

/**
 * Lazy-loaded components for code splitting
 */
export const LazyComponents = {
  // Settings screen - heavy component
  SettingsScreen: lazy(() => import('../components/Settings/SettingsScreen.jsx')),
  
  // Technique components - loaded on demand
  TechniqueInfo: lazy(() => import('../components/Technique/TechniqueInfo.jsx')),
  
  // Desktop components - only loaded on desktop
  DesktopControlPanel: lazy(() => import('../components/Desktop/DesktopControlPanel.jsx')),
  
  // Visualization components - heavy animations
  VisualizationContainer: lazy(() => import('../components/Visualization/VisualizationContainer.jsx')),
  BreathingFigure: lazy(() => import('../components/Visualization/BreathingFigure.jsx')),
  
  // Error boundaries - loaded when needed
  ErrorBoundary: lazy(() => import('../accessibility/ErrorBoundary.jsx')),
  TechniqueErrorBoundary: lazy(() => import('../accessibility/ErrorBoundary.jsx').then(module => ({ default: module.TechniqueErrorBoundary })))
};

/**
 * Higher-order component for lazy loading with fallback
 */
export function withLazyLoading(Component, fallback = null) {
  return function LazyLoadedComponent(props) {
    return (
      <Suspense fallback={fallback || <AnimatedLoading />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

/**
 * Memoized components for performance
 */
export const MemoizedComponents = {
  // Memoized visualization components
  VisualizationPoint: memo(({ phaseKey, timeInPhase, duration, theme, ...props }) => {
    const pointStyle = useMemo(() => ({
      backgroundColor: theme.colors.phases[phaseKey] || theme.colors.primary,
      opacity: 0.7 + (0.3 * (timeInPhase / duration)),
      transform: `scale(${1 + (0.2 * (timeInPhase / duration))})`,
      ...props.style
    }), [phaseKey, timeInPhase, duration, theme.colors, props.style]);

    return <div style={pointStyle} {...props} />;
  }),

  // Memoized technique info
  TechniqueInfo: memo(({ technique, ...props }) => {
    const techniqueData = useMemo(() => ({
      name: technique?.name || 'Unknown Technique',
      description: technique?.description || 'No description available',
      pattern: technique?.pattern || 'N/A',
      benefits: technique?.benefits || 'No benefits listed'
    }), [technique]);

    return (
      <div {...props}>
        <h3>{techniqueData.name}</h3>
        <p>{techniqueData.description}</p>
        <p>Pattern: {techniqueData.pattern}</p>
        <p>Benefits: {techniqueData.benefits}</p>
      </div>
    );
  }),

  // Memoized phase indicator
  PhaseIndicator: memo(({ currentPhase, timeRemaining, ...props }) => {
    const { t } = useLocalization();
    const phaseInfo = useMemo(() => {
      const key = currentPhase?.phase?.key || currentPhase?.key;
      const name = key ? t(key) : (currentPhase?.name || 'Unknown');
      return {
        name,
        timeRemaining: Math.ceil(timeRemaining || 0),
        progress: currentPhase ? (currentPhase.timeInPhase / currentPhase.duration) * 100 : 0
      };
    }, [currentPhase, timeRemaining, t]);

    return (
      <div {...props}>
        <div>{phaseInfo.name}</div>
        <div>{phaseInfo.timeRemaining}s remaining</div>
        <div style={{ width: '100%', height: '4px', backgroundColor: '#eee' }}>
          <div 
            style={{ 
              width: `${phaseInfo.progress}%`, 
              height: '100%', 
              backgroundColor: '#007bff' 
            }} 
          />
        </div>
      </div>
    );
  })
};

/**
 * Custom hooks for performance optimization
 */
export function usePerformanceOptimization() {
  // Memoized technique calculations
  const memoizedTechniqueCalculations = useCallback((technique) => {
    if (!technique) return null;
    
    return {
      totalDuration: technique.getTotalDuration(),
      phaseCount: technique.getPhases().length,
      averagePhaseDuration: technique.getTotalDuration() / technique.getPhases().length,
      isLongTechnique: technique.getTotalDuration() > 60
    };
  }, []);

  // Memoized theme calculations
  const memoizedThemeCalculations = useCallback((theme) => {
    if (!theme) return null;
    
    return {
      hasHighContrast: theme.colors.primary === '#000000' && theme.colors.background === '#FFFFFF',
      isDarkTheme: theme.colors.background === '#1A1A1A',
      colorCount: Object.keys(theme.colors).length
    };
  }, []);

  // Memoized session statistics
  const memoizedSessionStats = useCallback((sessionState) => {
    if (!sessionState) return null;
    
    return {
      isActive: sessionState.isActive,
      isPaused: sessionState.isPaused,
      elapsedTime: sessionState.elapsedTime,
      totalCycles: sessionState.totalCycles,
      averageCycleTime: sessionState.totalCycles > 0 ? sessionState.elapsedTime / sessionState.totalCycles : 0
    };
  }, []);

  return {
    memoizedTechniqueCalculations,
    memoizedThemeCalculations,
    memoizedSessionStats
  };
}

/**
 * Virtual scrolling hook for large lists
 */
export function useVirtualScrolling(items, itemHeight, containerHeight) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return items.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      index: startIndex + index
    }));
  }, [items, itemHeight, containerHeight, scrollTop]);

  const totalHeight = items.length * itemHeight;
  const offsetY = scrollTop;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop
  };
}

/**
 * Debounced hook for search and filtering
 */
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttled hook for scroll and resize events
 */
export function useThrottle(value, delay) {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastExecuted = useRef(Date.now());

  useEffect(() => {
    if (Date.now() >= lastExecuted.current + delay) {
      lastExecuted.current = Date.now();
      setThrottledValue(value);
    } else {
      const timer = setTimeout(() => {
        lastExecuted.current = Date.now();
        setThrottledValue(value);
      }, delay - (Date.now() - lastExecuted.current));

      return () => clearTimeout(timer);
    }
  }, [value, delay]);

  return throttledValue;
}

/**
 * Bundle optimization utilities
 */
export const BundleOptimization = {
  // Dynamic imports for heavy dependencies
  loadFramerMotion: () => import('framer-motion'),
  
  // Conditional loading based on features
  loadAdvancedFeatures: async () => {
    const [framerMotion] = await Promise.all([
      import('framer-motion')
    ]);
    
    return {
      framerMotion: framerMotion.default
    };
  },
  
  // Preload critical resources
  preloadCriticalResources: () => {
    // Preload critical CSS
    const criticalCSS = document.createElement('link');
    criticalCSS.rel = 'preload';
    criticalCSS.href = '/critical.css';
    criticalCSS.as = 'style';
    document.head.appendChild(criticalCSS);
    
    // Preload critical fonts
    const criticalFont = document.createElement('link');
    criticalFont.rel = 'preload';
    criticalFont.href = '/fonts/inter.woff2';
    criticalFont.as = 'font';
    criticalFont.type = 'font/woff2';
    criticalFont.crossOrigin = 'anonymous';
    document.head.appendChild(criticalFont);
  }
};

/**
 * Performance monitoring utilities
 */
export const PerformanceMonitoring = {
  // Measure component render time
  measureRenderTime: (componentName) => {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      const renderTime = end - start;
      
      if (renderTime > 16) { // More than one frame
        Logger.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
      
      return renderTime;
    };
  },
  
  // Monitor memory usage
  monitorMemoryUsage: () => {
    if ('memory' in performance) {
      const memory = performance.memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        usage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };
    }
    return null;
  },
  
  // Track bundle size
  trackBundleSize: () => {
    if ('getEntriesByType' in performance) {
      const resources = performance.getEntriesByType('resource');
      const jsResources = resources.filter(r => r.name.endsWith('.js'));
      
      return jsResources.reduce((total, resource) => {
        return total + (resource.transferSize || 0);
      }, 0);
    }
    return 0;
  }
};

/**
 * React.memo wrapper with custom comparison
 */
export function memoWithComparison(Component, areEqual) {
  return memo(Component, areEqual);
}

/**
 * useMemo wrapper with dependency array
 */
export function useMemoWithDeps(factory, deps) {
  return useMemo(factory, deps);
}

/**
 * useCallback wrapper with dependency array
 */
export function useCallbackWithDeps(callback, deps) {
  return useCallback(callback, deps);
}
