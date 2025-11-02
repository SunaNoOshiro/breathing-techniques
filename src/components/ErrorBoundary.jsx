/**
 * Error Boundaries
 * Provides error boundary components for graceful error handling
 */

import React from 'react';
import { AppError, ERROR_CODES } from '../errors/AppError.js';
import Logger from '../utils/Logger.js';

/**
 * Base Error Boundary Component
 */
class BaseErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: Date.now().toString()
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    Logger.error('component', 'Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      errorInfo
    });

    // Report error to error handler if available
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleReportError = () => {
    const { error, errorInfo, errorId } = this.state;
    
    // In a real application, you would send this to an error reporting service
    Logger.debug('component', 'Error Report:', {
      errorId,
      error: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString()
    });
    
    // Show user feedback
    alert('Error has been reported. Thank you for helping us improve!');
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      // Default fallback UI
      return (
        <div style={this.getErrorStyles()}>
          <div style={this.getErrorContainerStyles()}>
            <h2 style={this.getErrorTitleStyles()}>
              {this.props.title || 'Something went wrong'}
            </h2>
            
            <p style={this.getErrorMessageStyles()}>
              {this.props.message || 'An unexpected error occurred. Please try again.'}
            </p>
            
            {this.props.showDetails && (
              <details style={this.getErrorDetailsStyles()}>
                <summary>Error Details</summary>
                <pre style={this.getErrorPreStyles()}>
                  {this.state.error && this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            
            <div style={this.getErrorActionsStyles()}>
              <button
                onClick={this.handleRetry}
                style={this.getErrorButtonStyles()}
              >
                Try Again
              </button>
              
              {this.props.showReportButton && (
                <button
                  onClick={this.handleReportError}
                  style={this.getErrorButtonStyles()}
                >
                  Report Error
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }

  getErrorStyles() {
    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      margin: '10px'
    };
  }

  getErrorContainerStyles() {
    return {
      textAlign: 'center',
      maxWidth: '500px'
    };
  }

  getErrorTitleStyles() {
    return {
      color: '#dc3545',
      fontSize: '24px',
      marginBottom: '16px',
      fontWeight: 'bold'
    };
  }

  getErrorMessageStyles() {
    return {
      color: '#6c757d',
      fontSize: '16px',
      marginBottom: '20px',
      lineHeight: '1.5'
    };
  }

  getErrorDetailsStyles() {
    return {
      textAlign: 'left',
      marginBottom: '20px',
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      padding: '10px'
    };
  }

  getErrorPreStyles() {
    return {
      fontSize: '12px',
      color: '#6c757d',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      margin: '0'
    };
  }

  getErrorActionsStyles() {
    return {
      display: 'flex',
      gap: '10px',
      justifyContent: 'center',
      flexWrap: 'wrap'
    };
  }

  getErrorButtonStyles() {
    return {
      padding: '10px 20px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    };
  }
}

/**
 * General Error Boundary
 * Catches all errors in the application
 */
export const ErrorBoundary = ({ children, onError, ...props }) => {
  return (
    <BaseErrorBoundary
      onError={onError}
      title="Application Error"
      message="Something went wrong with the application. Please refresh the page or try again."
      showDetails={process.env.NODE_ENV === 'development'}
      showReportButton={true}
      {...props}
    >
      {children}
    </BaseErrorBoundary>
  );
};

/**
 * Technique Error Boundary
 * Specifically handles technique-related errors
 */
export const TechniqueErrorBoundary = ({ children, onError, ...props }) => {
  return (
    <BaseErrorBoundary
      onError={onError}
      title="Breathing Technique Error"
      message="There was an issue with the breathing technique. Please select a different technique or try again."
      showDetails={process.env.NODE_ENV === 'development'}
      showReportButton={true}
      {...props}
    >
      {children}
    </BaseErrorBoundary>
  );
};

/**
 * Visualization Error Boundary
 * Handles visualization-related errors
 */
export const VisualizationErrorBoundary = ({ children, onError, ...props }) => {
  return (
    <BaseErrorBoundary
      onError={onError}
      title="Visualization Error"
      message="There was an issue displaying the breathing visualization. The technique will still work, but the visual guide may not be available."
      showDetails={process.env.NODE_ENV === 'development'}
      showReportButton={false}
      {...props}
    >
      {children}
    </BaseErrorBoundary>
  );
};

/**
 * Service Error Boundary
 * Handles service-related errors
 */
export const ServiceErrorBoundary = ({ children, onError, ...props }) => {
  return (
    <BaseErrorBoundary
      onError={onError}
      title="Service Error"
      message="A service is temporarily unavailable. Some features may not work properly."
      showDetails={process.env.NODE_ENV === 'development'}
      showReportButton={true}
      {...props}
    >
      {children}
    </BaseErrorBoundary>
  );
};

/**
 * Theme Error Boundary
 * Handles theme-related errors
 */
export const ThemeErrorBoundary = ({ children, onError, ...props }) => {
  return (
    <BaseErrorBoundary
      onError={onError}
      title="Theme Error"
      message="There was an issue with the theme. The application will use the default theme."
      showDetails={process.env.NODE_ENV === 'development'}
      showReportButton={false}
      {...props}
    >
      {children}
    </BaseErrorBoundary>
  );
};

/**
 * Localization Error Boundary
 * Handles localization-related errors
 */
export const LocalizationErrorBoundary = ({ children, onError, ...props }) => {
  return (
    <BaseErrorBoundary
      onError={onError}
      title="Language Error"
      message="There was an issue loading the selected language. The application will use English."
      showDetails={process.env.NODE_ENV === 'development'}
      showReportButton={false}
      {...props}
    >
      {children}
    </BaseErrorBoundary>
  );
};

/**
 * Audio Error Boundary
 * Handles audio-related errors
 */
export const AudioErrorBoundary = ({ children, onError, ...props }) => {
  return (
    <BaseErrorBoundary
      onError={onError}
      title="Audio Error"
      message="There was an issue with audio playback. The breathing technique will work without sound."
      showDetails={process.env.NODE_ENV === 'development'}
      showReportButton={false}
      {...props}
    >
      {children}
    </BaseErrorBoundary>
  );
};

/**
 * Vibration Error Boundary
 * Handles vibration-related errors
 */
export const VibrationErrorBoundary = ({ children, onError, ...props }) => {
  return (
    <BaseErrorBoundary
      onError={onError}
      title="Vibration Error"
      message="There was an issue with device vibration. The breathing technique will work without vibration."
      showDetails={process.env.NODE_ENV === 'development'}
      showReportButton={false}
      {...props}
    >
      {children}
    </BaseErrorBoundary>
  );
};

/**
 * Higher-order component to wrap components with error boundary
 * @param {React.Component} Component - Component to wrap
 * @param {object} errorBoundaryProps - Props for error boundary
 * @returns {React.Component} - Wrapped component with error boundary
 */
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

/**
 * Hook for error boundary functionality
 * @returns {object} - Error boundary utilities
 */
export const useErrorBoundary = () => {
  const [error, setError] = React.useState(null);
  
  const resetError = React.useCallback(() => {
    setError(null);
  }, []);
  
  const captureError = React.useCallback((error) => {
    setError(error);
  }, []);
  
  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);
  
  return {
    captureError,
    resetError
  };
};

export default ErrorBoundary;
