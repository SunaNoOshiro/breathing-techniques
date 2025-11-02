/**
 * Analytics Enhanced Technique Decorator
 * Adds analytics and tracking capabilities to any technique
 * Implements IAnalytics interface
 */

import { TechniqueDecorator } from './TechniqueDecorator.js';
import { IAnalytics } from '../techniques/interfaces/ITechnique.js';
import Logger from '../utils/Logger.js';

export class AnalyticsEnhancedTechnique extends TechniqueDecorator {
  constructor(technique, analyticsConfig = {}) {
    super(technique);
    this.analyticsConfig = {
      enabled: true,
      trackUsage: true,
      trackPerformance: true,
      trackErrors: true,
      ...analyticsConfig
    };
    this.metrics = {
      totalSessions: 0,
      totalDuration: 0,
      averageSessionDuration: 0,
      lastUsed: null,
      errorCount: 0,
      successRate: 1.0
    };
  }

  /**
   * Track technique usage
   * @param {object} data - Usage data
   */
  trackUsage(data) {
    if (!this.analyticsConfig.enabled || !this.analyticsConfig.trackUsage) {
      return;
    }

    const usageData = {
      techniqueId: this.getId(),
      timestamp: new Date().toISOString(),
      sessionDuration: data.sessionDuration || 0,
      completedCycles: data.completedCycles || 0,
      userAgent: navigator.userAgent,
      ...data
    };

    // Update internal metrics
    this.metrics.totalSessions++;
    this.metrics.totalDuration += usageData.sessionDuration;
    this.metrics.averageSessionDuration = this.metrics.totalDuration / this.metrics.totalSessions;
    this.metrics.lastUsed = new Date().toISOString();

    // Store in localStorage for persistence
    this.persistMetrics();

    // Send to analytics service (if available)
    this.sendToAnalytics(usageData);
  }

  /**
   * Get technique metrics
   * @returns {object} - Technique metrics
   */
  getMetrics() {
    return { ...this.metrics };
  }

  /**
   * Track performance metrics
   * @param {object} performanceData - Performance data
   */
  trackPerformance(performanceData) {
    if (!this.analyticsConfig.enabled || !this.analyticsConfig.trackPerformance) {
      return;
    }

    const perfData = {
      techniqueId: this.getId(),
      timestamp: new Date().toISOString(),
      renderTime: performanceData.renderTime || 0,
      audioLatency: performanceData.audioLatency || 0,
      vibrationLatency: performanceData.vibrationLatency || 0,
      ...performanceData
    };

    this.sendToAnalytics(perfData, 'performance');
  }

  /**
   * Track errors
   * @param {object} errorData - Error data
   */
  trackError(errorData) {
    if (!this.analyticsConfig.enabled || !this.analyticsConfig.trackErrors) {
      return;
    }

    this.metrics.errorCount++;
    this.metrics.successRate = (this.metrics.totalSessions - this.metrics.errorCount) / this.metrics.totalSessions;

    const errorInfo = {
      techniqueId: this.getId(),
      timestamp: new Date().toISOString(),
      errorType: errorData.type || 'unknown',
      errorMessage: errorData.message || 'Unknown error',
      stack: errorData.stack || '',
      ...errorData
    };

    this.persistMetrics();
    this.sendToAnalytics(errorInfo, 'error');
  }

  /**
   * Get analytics configuration
   * @returns {object} - Analytics configuration
   */
  getAnalyticsConfig() {
    return { ...this.analyticsConfig };
  }

  /**
   * Update analytics configuration
   * @param {object} config - New analytics configuration
   */
  updateAnalyticsConfig(config) {
    this.analyticsConfig = { ...this.analyticsConfig, ...config };
  }

  /**
   * Enable/disable analytics
   * @param {boolean} enabled - Analytics enabled state
   */
  setAnalyticsEnabled(enabled) {
    this.analyticsConfig.enabled = enabled;
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      totalSessions: 0,
      totalDuration: 0,
      averageSessionDuration: 0,
      lastUsed: null,
      errorCount: 0,
      successRate: 1.0
    };
    this.persistMetrics();
  }

  /**
   * Persist metrics to localStorage
   */
  persistMetrics() {
    try {
      const key = `analytics_${this.getId()}`;
      localStorage.setItem(key, JSON.stringify(this.metrics));
    } catch (error) {
      Logger.warn("decorator", 'Failed to persist analytics metrics:', error);
    }
  }

  /**
   * Load metrics from localStorage
   */
  loadMetrics() {
    try {
      const key = `analytics_${this.getId()}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        this.metrics = { ...this.metrics, ...JSON.parse(stored) };
      }
    } catch (error) {
      Logger.warn("decorator", 'Failed to load analytics metrics:', error);
    }
  }

  /**
   * Send data to analytics service
   * @param {object} data - Data to send
   * @param {string} type - Data type
   */
  sendToAnalytics(data, type = 'usage') {
    // This would integrate with actual analytics services
    // For now, just log to console
    Logger.debug("decorator", `Analytics [${type}]:`, data);
    
    // Example integration points:
    // - Google Analytics
    // - Mixpanel
    // - Custom analytics endpoint
    // - Error tracking service (Sentry, etc.)
  }
}
