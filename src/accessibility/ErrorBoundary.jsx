/**
 * Error Boundary Component
 * Catches React errors and provides accessible error handling
 */

import React from 'react';
import { useAccessibility } from './useAccessibility.js';
import Logger from '../utils/Logger.js';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    Logger.error('component', 'ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Report error to analytics if available
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback 
        error={this.state.error}
        errorInfo={this.state.errorInfo}
        onRetry={this.props.onRetry}
        fallback={this.props.fallback}
      />;
    }

    return this.props.children;
  }
}

/**
 * Error Fallback Component
 * Accessible error display with retry functionality
 */
function ErrorFallback({ error, errorInfo, onRetry, fallback }) {
  const accessibility = useAccessibility();

  // Announce error to screen readers
  React.useEffect(() => {
    accessibility.announce('An error occurred. Please try again or contact support.', 'assertive');
  }, [accessibility]);

  if (fallback) {
    return fallback;
  }

  return (
    <div 
      role="alert" 
      aria-live="assertive"
      className="error-boundary"
      style={{
        padding: '2rem',
        margin: '1rem',
        border: '2px solid #e74c3c',
        borderRadius: '8px',
        backgroundColor: '#fdf2f2',
        color: '#721c24'
      }}
    >
      <h2 
        id="error-title"
        style={{ marginTop: 0, marginBottom: '1rem' }}
      >
        Something went wrong
      </h2>
      
      <p 
        aria-describedby="error-title"
        style={{ marginBottom: '1rem' }}
      >
        We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
      </p>

      {process.env.NODE_ENV === 'development' && (
        <details style={{ marginBottom: '1rem' }}>
          <summary 
            style={{ cursor: 'pointer', fontWeight: 'bold' }}
            aria-expanded="false"
          >
            Error Details (Development Only)
          </summary>
          <pre 
            style={{ 
              marginTop: '1rem', 
              padding: '1rem', 
              backgroundColor: '#f8f9fa', 
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '0.875rem'
            }}
          >
            {error && error.toString()}
            {errorInfo && errorInfo.componentStack}
          </pre>
        </details>
      )}

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={onRetry}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
          aria-describedby="error-title"
        >
          Try Again
        </button>
        
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
          aria-describedby="error-title"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}

/**
 * Technique Error Boundary
 * Specialized error boundary for technique-related errors
 */
export class TechniqueErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    Logger.error('component', 'TechniqueErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error
    });
  }

  render() {
    if (this.state.hasError) {
      return <TechniqueErrorFallback 
        error={this.state.error}
        onRetry={this.props.onRetry}
        techniqueId={this.props.techniqueId}
      />;
    }

    return this.props.children;
  }
}

/**
 * Technique Error Fallback Component
 * Specialized error display for technique errors
 */
function TechniqueErrorFallback({ error, onRetry, techniqueId }) {
  const accessibility = useAccessibility();

  React.useEffect(() => {
    accessibility.announce('Breathing technique error. Please select a different technique.', 'assertive');
  }, [accessibility]);

  return (
    <div 
      role="alert" 
      aria-live="assertive"
      className="technique-error-boundary"
      style={{
        padding: '1.5rem',
        margin: '1rem',
        border: '2px solid #f39c12',
        borderRadius: '8px',
        backgroundColor: '#fef9e7',
        color: '#8b4513'
      }}
    >
      <h3 
        id="technique-error-title"
        style={{ marginTop: 0, marginBottom: '1rem' }}
      >
        Technique Error
      </h3>
      
      <p 
        aria-describedby="technique-error-title"
        style={{ marginBottom: '1rem' }}
      >
        There was a problem with the current breathing technique. Please try selecting a different technique.
      </p>

      {techniqueId && (
        <p style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
          Failed technique: {techniqueId}
        </p>
      )}

      <button
        onClick={onRetry}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#f39c12',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '1rem'
        }}
        aria-describedby="technique-error-title"
      >
        Select Different Technique
      </button>
    </div>
  );
}
