# Logger System Documentation

## Overview

The codebase has been refactored to use a centralized logging system that replaces all `console.log`, `console.warn`, `console.error`, and `console.info` statements. This provides better control over debug output and makes it easy to enable/disable logging as needed.

## Project Summary

- Created `src/utils/Logger.js` with levels (NONE, ERROR, WARN, INFO, DEBUG), category filtering, runtime and env configuration, and `window.Logger` access.
- Refactored 20+ files (contexts, services, state, components, hooks, commands, utilities) to use `Logger` instead of `console.*`.
- Added documentation (this README) and kept `LOGGER_CHANGELOG.md` as the audit trail.
- Default behavior: DEBUG in development, ERROR in production. Override via `VITE_LOG_LEVEL`, localStorage, or `Logger.setLevel()` at runtime.

## Features

- ✅ **Centralized logging** - All debug logs go through one system
- ✅ **Log levels** - Control verbosity (NONE, ERROR, WARN, INFO, DEBUG)
- ✅ **Category filtering** - Filter logs by module/category
- ✅ **Runtime configuration** - Change settings without code changes
- ✅ **Production-ready** - Automatically less verbose in production
- ✅ **Browser console access** - Control via browser developer tools

## Quick Start

### Using the Logger in Code

```javascript
import Logger from '@/utils/Logger.js';

// Debug logging (most verbose)
Logger.debug('category', 'Debug message', data);

// Info logging
Logger.info('component', 'Component initialized');

// Warning logging
Logger.warn('service', 'Service unavailable', error);

// Error logging
Logger.error('state', 'State update failed', error);
```

### Log Levels

From least to most verbose:

1. **NONE** - No logging at all
2. **ERROR** - Only errors
3. **WARN** - Errors and warnings
4. **INFO** - Errors, warnings, and info
5. **DEBUG** - Everything (default in development)

### Categories

The codebase uses these categories to organize logs:

- `context` - React contexts (BreathingContext, ThemeContext, etc.)
- `service` - Service classes (AudioService, TimerService, VibrationService, etc.)
- `state` - State management (BreathingSessionState, Observer, etc.)
- `component` - React components
- `hook` - React hooks
- `command` - Command pattern implementations
- `performance` - Performance monitoring

## Configuration

### Method 1: Browser Console (Runtime)

Open browser developer console and run:

```javascript
// Set log level
Logger.setLevel('debug');  // or 'error', 'warn', 'info', 'none'

// Filter by category (only show these categories)
Logger.enableCategories('state', 'service');

// Hide specific categories
Logger.disableCategories('component');

// Show all categories again
Logger.clearCategories();

// View current configuration
Logger.getConfig();

// Get help
Logger.help();
```

### Method 2: localStorage (Persistent)

Settings stored in localStorage persist across page reloads:

```javascript
// Set log level (persists across reloads)
localStorage.setItem('LOG_LEVEL', 'debug');

// Set categories (persists across reloads)
localStorage.setItem('LOG_CATEGORIES', '["state","service"]');

// Remove settings
localStorage.removeItem('LOG_LEVEL');
localStorage.removeItem('LOG_CATEGORIES');
```

### Method 3: Environment Variable (Build Time)

Set in `.env` file:

```bash
# Development - show everything
VITE_LOG_LEVEL=debug

# Production - only errors
VITE_LOG_LEVEL=error

# Staging - warnings and errors
VITE_LOG_LEVEL=warn
```

## Common Use Cases

### Debugging a Specific Module

When debugging state management issues:

```javascript
// In browser console
Logger.setLevel('debug');
Logger.enableCategories('state');
```

### Debugging Multiple Related Modules

When debugging breathing session flow:

```javascript
// In browser console
Logger.setLevel('debug');
Logger.enableCategories('context', 'service', 'command');
```

### Production Mode

Minimize logging in production:

```javascript
// In .env.production
VITE_LOG_LEVEL=error
```

Or via localStorage on live site:

```javascript
localStorage.setItem('LOG_LEVEL', 'error');
location.reload();
```

### Temporarily Disable All Logging

```javascript
// In browser console
Logger.setLevel('none');
```

### See Only Errors and Warnings

```javascript
// In browser console
Logger.setLevel('warn');
```

## Migration Summary

All console statements have been replaced:

```javascript
// Old
console.log('Debug info', data);
console.warn('Warning message');
console.error('Error occurred', error);

// New
Logger.debug('category', 'Debug info', data);
Logger.warn('category', 'Warning message');
Logger.error('category', 'Error occurred', error);
```

## Best Practices

### 1. Always Use Categories

```javascript
// Good
Logger.debug('service', 'Timer started');

// Less useful (harder to filter)
Logger.debug('Timer started');
```

### 2. Use Appropriate Log Levels

```javascript
// Debug - detailed flow information
Logger.debug('state', 'Updating state:', newState);

// Info - important milestones
Logger.info('context', 'Session initialized');

// Warn - recoverable issues
Logger.warn('service', 'Service unavailable, using fallback');

// Error - actual errors
Logger.error('command', 'Command execution failed:', error);
```

### 3. Include Context in Messages

```javascript
// Good - includes what and where
Logger.debug('hook', 'useTechnique: Loading technique:', techniqueId);

// Less useful - missing context
Logger.debug('hook', 'Loading...');
```

### 4. Development vs Production

```javascript
// Development: Use DEBUG level
if (import.meta.env.MODE === 'development') {
  Logger.setLevel('debug');
}

// Production: Use ERROR level
if (import.meta.env.MODE === 'production') {
  Logger.setLevel('error');
}
```

## Troubleshooting

### Logs Not Appearing

1. Check log level: `Logger.getConfig()`
2. Check if category is enabled: `Logger.getConfig()`
3. Clear category filters: `Logger.clearCategories()`
4. Set to debug mode: `Logger.setLevel('debug')`

### Too Many Logs

1. Reduce log level: `Logger.setLevel('warn')`
2. Filter by category: `Logger.enableCategories('state')`
3. Disable specific categories: `Logger.disableCategories('component')`

### Logs Persist After Page Reload

Settings in localStorage persist. To reset:

```javascript
localStorage.removeItem('LOG_LEVEL');
localStorage.removeItem('LOG_CATEGORIES');
location.reload();
```

## Examples

### Example 1: Debug State Updates

```javascript
// In browser console
Logger.setLevel('debug');
Logger.enableCategories('state', 'context');

// Now only state and context logs will show
// Perform actions and watch state changes
```

### Example 2: Monitor Service Layer

```javascript
// In browser console
Logger.setLevel('debug');
Logger.enableCategories('service');

// Watch service initialization, API calls, etc.
```

### Example 3: Production Error Monitoring

```javascript
// In production environment
Logger.setLevel('error');
// Only critical errors will be logged
```

## Benefits

1. **Better Performance** - Logs can be completely disabled in production
2. **Easier Debugging** - Filter logs by module/category
3. **Cleaner Console** - No more cluttered console output
4. **Flexibility** - Change log settings without code changes
5. **Maintainability** - Centralized logging logic
6. **Professional** - Production-ready logging system

## Support

For questions or issues with the logging system:

1. Check this documentation
2. Run `Logger.help()` in browser console
3. Check `src/utils/Logger.js` for implementation details

## Future Enhancements

Potential improvements:

- Remote logging integration
- Log persistence/export
- Performance metrics
- Custom log formatters
- Log aggregation
- Analytics integration

