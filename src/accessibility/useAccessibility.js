/**
 * Accessibility Hook
 * Provides accessibility utilities and state management for components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { AccessibilityUtils } from './AccessibilityUtils.js';

export function useAccessibility() {
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const announcementRef = useRef(null);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Check for high contrast preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);

    const handleChange = (e) => setIsHighContrast(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Announce messages to screen readers
  const announce = useCallback((message, priority = 'polite') => {
    const announcement = {
      id: Date.now(),
      message,
      priority,
      timestamp: new Date()
    };

    setAnnouncements(prev => [...prev, announcement]);

    // Remove announcement after 3 seconds
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== announcement.id));
    }, 3000);
  }, []);

  // Generate ARIA labels for breathing phases
  const generatePhaseAriaLabel = useCallback((phaseKey, phaseName, timeRemaining) => {
    return AccessibilityUtils.generatePhaseAriaLabel(phaseKey, phaseName, timeRemaining);
  }, []);

  // Generate ARIA labels for techniques
  const generateTechniqueAriaLabel = useCallback((technique) => {
    return AccessibilityUtils.generateTechniqueAriaLabel(technique);
  }, []);

  // Generate ARIA labels for session status
  const generateSessionAriaLabel = useCallback((sessionState) => {
    return AccessibilityUtils.generateSessionAriaLabel(sessionState);
  }, []);

  // Handle keyboard navigation
  const handleKeyboardNavigation = useCallback((event, handlers) => {
    AccessibilityUtils.handleBreathingKeyboard(event, handlers);
  }, []);

  // Handle settings keyboard navigation
  const handleSettingsKeyboard = useCallback((event, handlers) => {
    AccessibilityUtils.handleSettingsKeyboard(event, handlers);
  }, []);

  // Focus management
  const focusElement = useCallback((elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  // Generate focus props
  const generateFocusProps = useCallback((elementId) => {
    return AccessibilityUtils.generateFocusProps(elementId);
  }, []);

  // Generate live region props
  const generateLiveRegionProps = useCallback((message, priority = 'polite') => {
    return AccessibilityUtils.generateLiveRegionProps(message, priority);
  }, []);

  // Generate keyboard props
  const generateKeyboardProps = useCallback((onKeyDown, onKeyUp) => {
    return AccessibilityUtils.generateKeyboardProps(onKeyDown, onKeyUp);
  }, []);

  // Generate form field props
  const generateFormFieldProps = useCallback((fieldId, label, description, required = false, invalid = false, errorMessage = '') => {
    return AccessibilityUtils.generateFormFieldProps(fieldId, label, description, required, invalid, errorMessage);
  }, []);

  // Generate progress props
  const generateProgressProps = useCallback((value, max, label) => {
    return AccessibilityUtils.generateProgressProps(value, max, label);
  }, []);

  // Announce phase changes
  const announcePhaseChange = useCallback((phaseName, duration) => {
    announce(`Now ${phaseName.toLowerCase()} for ${duration} seconds`, 'assertive');
  }, [announce]);

  // Announce session status changes
  const announceSessionStatus = useCallback((status) => {
    announce(`Breathing session ${status}`, 'polite');
  }, [announce]);

  // Generate skip link props
  const generateSkipLinkProps = useCallback((targetId, text) => {
    return AccessibilityUtils.generateSkipLinkProps(targetId, text);
  }, []);

  // Generate screen reader text props
  const generateScreenReaderText = useCallback((text) => {
    return AccessibilityUtils.generateScreenReaderText(text);
  }, []);

  return {
    // State
    isReducedMotion,
    isHighContrast,
    announcements,
    
    // Utilities
    announce,
    generatePhaseAriaLabel,
    generateTechniqueAriaLabel,
    generateSessionAriaLabel,
    handleKeyboardNavigation,
    handleSettingsKeyboard,
    focusElement,
    generateFocusProps,
    generateLiveRegionProps,
    generateKeyboardProps,
    generateFormFieldProps,
    generateProgressProps,
    announcePhaseChange,
    announceSessionStatus,
    generateSkipLinkProps,
    generateScreenReaderText
  };
}
