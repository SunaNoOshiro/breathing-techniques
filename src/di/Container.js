/**
 * Simple Dependency Injection Container
 * Provides service registration, resolution, and lifecycle management
 */

import { AppError, ERROR_CODES } from '../errors/AppError.js';

/**
 * Service lifecycle types
 */
export const SERVICE_LIFECYCLE = {
  SINGLETON: 'singleton',
  TRANSIENT: 'transient',
  SCOPED: 'scoped'
};

/**
 * Service registration metadata
 */
class ServiceRegistration {
  constructor(serviceName, factory, lifecycle = SERVICE_LIFECYCLE.SINGLETON) {
    this.serviceName = serviceName;
    this.factory = factory;
    this.lifecycle = lifecycle;
    this.instance = null;
    this.dependencies = [];
    this.isResolving = false;
  }

  /**
   * Set service dependencies
   */
  withDependencies(dependencies) {
    this.dependencies = dependencies;
    return this;
  }

  /**
   * Set service lifecycle
   */
  withLifecycle(lifecycle) {
    this.lifecycle = lifecycle;
    return this;
  }
}

/**
 * Dependency Injection Container
 */
export class Container {
  constructor() {
    this.services = new Map();
    this.scopedInstances = new Map();
    this.currentScope = null;
  }

  /**
   * Register a service
   * @param {string} serviceName - Name of the service
   * @param {Function} factory - Factory function to create service instance
   * @param {string} lifecycle - Service lifecycle (singleton, transient, scoped)
   * @returns {ServiceRegistration} - Registration object for chaining
   */
  register(serviceName, factory, lifecycle = SERVICE_LIFECYCLE.SINGLETON) {
    if (typeof serviceName !== 'string' || serviceName.length === 0) {
      throw new AppError(
        'Service name must be a non-empty string',
        ERROR_CODES.CONFIGURATION_INVALID,
        { serviceName }
      );
    }

    if (typeof factory !== 'function') {
      throw new AppError(
        'Service factory must be a function',
        ERROR_CODES.CONFIGURATION_INVALID,
        { serviceName, factory }
      );
    }

    const registration = new ServiceRegistration(serviceName, factory, lifecycle);
    this.services.set(serviceName, registration);
    
    return registration;
  }

  /**
   * Register a singleton service
   * @param {string} serviceName - Name of the service
   * @param {Function} factory - Factory function to create service instance
   * @returns {ServiceRegistration} - Registration object for chaining
   */
  singleton(serviceName, factory) {
    return this.register(serviceName, factory, SERVICE_LIFECYCLE.SINGLETON);
  }

  /**
   * Register a transient service
   * @param {string} serviceName - Name of the service
   * @param {Function} factory - Factory function to create service instance
   * @returns {ServiceRegistration} - Registration object for chaining
   */
  transient(serviceName, factory) {
    return this.register(serviceName, factory, SERVICE_LIFECYCLE.TRANSIENT);
  }

  /**
   * Register a scoped service
   * @param {string} serviceName - Name of the service
   * @param {Function} factory - Factory function to create service instance
   * @returns {ServiceRegistration} - Registration object for chaining
   */
  scoped(serviceName, factory) {
    return this.register(serviceName, factory, SERVICE_LIFECYCLE.SCOPED);
  }

  /**
   * Register a service instance directly
   * @param {string} serviceName - Name of the service
   * @param {any} instance - Service instance
   */
  registerInstance(serviceName, instance) {
    if (typeof serviceName !== 'string' || serviceName.length === 0) {
      throw new AppError(
        'Service name must be a non-empty string',
        ERROR_CODES.CONFIGURATION_INVALID,
        { serviceName }
      );
    }

    const registration = new ServiceRegistration(
      serviceName, 
      () => instance, 
      SERVICE_LIFECYCLE.SINGLETON
    );
    registration.instance = instance;
    this.services.set(serviceName, registration);
  }

  /**
   * Resolve a service
   * @param {string} serviceName - Name of the service to resolve
   * @returns {any} - Service instance
   */
  resolve(serviceName) {
    const registration = this.services.get(serviceName);
    
    if (!registration) {
      throw new AppError(
        `Service '${serviceName}' is not registered`,
        ERROR_CODES.DEPENDENCY_INJECTION_FAILED,
        { serviceName, availableServices: Array.from(this.services.keys()) }
      );
    }

    // Check for circular dependencies
    if (registration.isResolving) {
      throw new AppError(
        `Circular dependency detected for service '${serviceName}'`,
        ERROR_CODES.DEPENDENCY_INJECTION_FAILED,
        { serviceName }
      );
    }

    try {
      registration.isResolving = true;

      switch (registration.lifecycle) {
        case SERVICE_LIFECYCLE.SINGLETON:
          return this.resolveSingleton(registration);
        case SERVICE_LIFECYCLE.TRANSIENT:
          return this.resolveTransient(registration);
        case SERVICE_LIFECYCLE.SCOPED:
          return this.resolveScoped(registration);
        default:
          throw new AppError(
            `Unknown service lifecycle '${registration.lifecycle}'`,
            ERROR_CODES.CONFIGURATION_INVALID,
            { serviceName, lifecycle: registration.lifecycle }
          );
      }
    } finally {
      registration.isResolving = false;
    }
  }

  /**
   * Resolve singleton service
   * @param {ServiceRegistration} registration - Service registration
   * @returns {any} - Service instance
   */
  resolveSingleton(registration) {
    if (registration.instance === null) {
      registration.instance = this.createInstance(registration);
    }
    return registration.instance;
  }

  /**
   * Resolve transient service
   * @param {ServiceRegistration} registration - Service registration
   * @returns {any} - Service instance
   */
  resolveTransient(registration) {
    return this.createInstance(registration);
  }

  /**
   * Resolve scoped service
   * @param {ServiceRegistration} registration - Service registration
   * @returns {any} - Service instance
   */
  resolveScoped(registration) {
    if (!this.currentScope) {
      throw new AppError(
        'Cannot resolve scoped service outside of a scope',
        ERROR_CODES.DEPENDENCY_INJECTION_FAILED,
        { serviceName: registration.serviceName }
      );
    }

    const scopeKey = `${this.currentScope}:${registration.serviceName}`;
    
    if (!this.scopedInstances.has(scopeKey)) {
      const instance = this.createInstance(registration);
      this.scopedInstances.set(scopeKey, instance);
    }

    return this.scopedInstances.get(scopeKey);
  }

  /**
   * Create service instance
   * @param {ServiceRegistration} registration - Service registration
   * @returns {any} - Service instance
   */
  createInstance(registration) {
    try {
      // Resolve dependencies
      const dependencies = registration.dependencies.map(depName => this.resolve(depName));
      
      // Create instance using factory
      return registration.factory(...dependencies);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        `Failed to create instance of service '${registration.serviceName}'`,
        ERROR_CODES.DEPENDENCY_INJECTION_FAILED,
        { 
          serviceName: registration.serviceName, 
          dependencies: registration.dependencies,
          originalError: error.message 
        }
      );
    }
  }

  /**
   * Check if service is registered
   * @param {string} serviceName - Name of the service
   * @returns {boolean} - True if service is registered
   */
  isRegistered(serviceName) {
    return this.services.has(serviceName);
  }

  /**
   * Get all registered service names
   * @returns {string[]} - Array of service names
   */
  getRegisteredServices() {
    return Array.from(this.services.keys());
  }

  /**
   * Create a new scope
   * @param {string} scopeName - Name of the scope
   * @returns {Function} - Scope function that takes a callback
   */
  createScope(scopeName) {
    return (callback) => {
      const previousScope = this.currentScope;
      this.currentScope = scopeName;
      
      try {
        return callback();
      } finally {
        this.currentScope = previousScope;
      }
    };
  }

  /**
   * Clear scoped instances
   * @param {string} scopeName - Name of the scope to clear
   */
  clearScope(scopeName) {
    if (scopeName) {
      // Clear specific scope
      for (const key of this.scopedInstances.keys()) {
        if (key.startsWith(`${scopeName}:`)) {
          this.scopedInstances.delete(key);
        }
      }
    } else {
      // Clear all scoped instances
      this.scopedInstances.clear();
    }
  }

  /**
   * Dispose of singleton instances
   * @param {string} serviceName - Name of the service to dispose (optional)
   */
  dispose(serviceName) {
    if (serviceName) {
      const registration = this.services.get(serviceName);
      if (registration && registration.instance) {
        if (typeof registration.instance.dispose === 'function') {
          registration.instance.dispose();
        }
        registration.instance = null;
      }
    } else {
      // Dispose all singleton instances
      for (const registration of this.services.values()) {
        if (registration.instance) {
          if (typeof registration.instance.dispose === 'function') {
            registration.instance.dispose();
          }
          registration.instance = null;
        }
      }
    }
  }

  /**
   * Create a child container
   * @returns {Container} - Child container
   */
  createChild() {
    const child = new Container();
    
    // Copy service registrations (but not instances)
    for (const [name, registration] of this.services) {
      child.services.set(name, new ServiceRegistration(
        name,
        registration.factory,
        registration.lifecycle
      ).withDependencies(registration.dependencies));
    }
    
    return child;
  }

  /**
   * Validate container configuration
   * @returns {object} - Validation result
   */
  validate() {
    const errors = [];
    const warnings = [];

    for (const [name, registration] of this.services) {
      // Check for circular dependencies
      try {
        this.checkCircularDependencies(name, new Set());
      } catch (error) {
        errors.push(`Circular dependency detected: ${error.message}`);
      }

      // Check if dependencies exist
      for (const dep of registration.dependencies) {
        if (!this.services.has(dep)) {
          errors.push(`Service '${name}' depends on unregistered service '${dep}'`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      serviceCount: this.services.size
    };
  }

  /**
   * Check for circular dependencies
   * @param {string} serviceName - Service name to check
   * @param {Set} visited - Visited services
   */
  checkCircularDependencies(serviceName, visited) {
    if (visited.has(serviceName)) {
      throw new Error(`Circular dependency involving '${serviceName}'`);
    }

    visited.add(serviceName);
    const registration = this.services.get(serviceName);
    
    if (registration) {
      for (const dep of registration.dependencies) {
        this.checkCircularDependencies(dep, new Set(visited));
      }
    }
    
    visited.delete(serviceName);
  }
}

// Create and export singleton instance
export const container = new Container();
