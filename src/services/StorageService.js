/**
 * Storage Service
 * Provides abstraction over storage adapters following Dependency Inversion Principle
 */

import { ServiceError, ERROR_CODES } from '../errors/AppError.js';
import { errorHandler } from '../errors/ErrorHandler.js';
import { StorageAdapter } from '../adapters/StorageAdapter.js';

/**
 * Storage Service class
 * Provides high-level storage operations with error handling
 */
export class StorageService {
  constructor(storageAdapter) {
    if (!(storageAdapter instanceof StorageAdapter)) {
      throw new ServiceError(
        'StorageService requires a StorageAdapter instance',
        'StorageService',
        { storageAdapter }
      );
    }
    
    this.storageAdapter = storageAdapter;
    this.isInitialized = false;
    this.cache = new Map();
    this.cacheEnabled = true;
    this.maxCacheSize = 100;
  }

  /**
   * Initialize storage service
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      const isAvailable = await this.storageAdapter.isAvailable();
      if (!isAvailable) {
        throw new ServiceError(
          'Storage adapter is not available',
          'StorageService',
          { adapter: this.storageAdapter.constructor.name }
        );
      }

      this.isInitialized = true;
    } catch (error) {
      throw new ServiceError(
        'Failed to initialize storage service',
        'StorageService',
        { originalError: error.message }
      );
    }
  }

  /**
   * Get value from storage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key not found
   * @returns {Promise<any>} - Stored value or default
   */
  async get(key, defaultValue = null) {
    await this.ensureInitialized();

    try {
      // Check cache first
      if (this.cacheEnabled && this.cache.has(key)) {
        return this.cache.get(key);
      }

      const value = await this.storageAdapter.safeGet(key);
      const result = value !== null ? value : defaultValue;

      // Cache the result
      if (this.cacheEnabled) {
        this.setCacheValue(key, result);
      }

      return result;
    } catch (error) {
      throw new ServiceError(
        'Failed to get value from storage',
        'StorageService',
        { key, defaultValue, originalError: error.message }
      );
    }
  }

  /**
   * Set value in storage
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   * @returns {Promise<void>}
   */
  async set(key, value) {
    await this.ensureInitialized();

    try {
      await this.storageAdapter.safeSet(key, value);
      
      // Update cache
      if (this.cacheEnabled) {
        this.setCacheValue(key, value);
      }
    } catch (error) {
      throw new ServiceError(
        'Failed to set value in storage',
        'StorageService',
        { key, value, originalError: error.message }
      );
    }
  }

  /**
   * Remove value from storage
   * @param {string} key - Storage key
   * @returns {Promise<void>}
   */
  async remove(key) {
    await this.ensureInitialized();

    try {
      await this.storageAdapter.safeRemove(key);
      
      // Remove from cache
      if (this.cacheEnabled) {
        this.cache.delete(key);
      }
    } catch (error) {
      throw new ServiceError(
        'Failed to remove value from storage',
        'StorageService',
        { key, originalError: error.message }
      );
    }
  }

  /**
   * Check if key exists in storage
   * @param {string} key - Storage key
   * @returns {Promise<boolean>} - True if key exists
   */
  async has(key) {
    await this.ensureInitialized();

    try {
      return await this.storageAdapter.has(key);
    } catch (error) {
      throw new ServiceError(
        'Failed to check if key exists in storage',
        'StorageService',
        { key, originalError: error.message }
      );
    }
  }

  /**
   * Clear all values from storage
   * @returns {Promise<void>}
   */
  async clear() {
    await this.ensureInitialized();

    try {
      await this.storageAdapter.clear();
      
      // Clear cache
      if (this.cacheEnabled) {
        this.cache.clear();
      }
    } catch (error) {
      throw new ServiceError(
        'Failed to clear storage',
        'StorageService',
        { originalError: error.message }
      );
    }
  }

  /**
   * Get all keys from storage
   * @returns {Promise<string[]>} - Array of storage keys
   */
  async keys() {
    await this.ensureInitialized();

    try {
      return await this.storageAdapter.keys();
    } catch (error) {
      throw new ServiceError(
        'Failed to get storage keys',
        'StorageService',
        { originalError: error.message }
      );
    }
  }

  /**
   * Get storage size
   * @returns {Promise<number>} - Number of items in storage
   */
  async size() {
    await this.ensureInitialized();

    try {
      return await this.storageAdapter.size();
    } catch (error) {
      throw new ServiceError(
        'Failed to get storage size',
        'StorageService',
        { originalError: error.message }
      );
    }
  }

  /**
   * Get multiple values at once
   * @param {string[]} keys - Array of keys
   * @returns {Promise<object>} - Object with key-value pairs
   */
  async getMultiple(keys) {
    await this.ensureInitialized();

    try {
      const result = {};
      const promises = keys.map(async key => {
        const value = await this.get(key);
        result[key] = value;
      });

      await Promise.all(promises);
      return result;
    } catch (error) {
      throw new ServiceError(
        'Failed to get multiple values from storage',
        'StorageService',
        { keys, originalError: error.message }
      );
    }
  }

  /**
   * Set multiple values at once
   * @param {object} data - Object with key-value pairs
   * @returns {Promise<void>}
   */
  async setMultiple(data) {
    await this.ensureInitialized();

    try {
      const promises = Object.entries(data).map(([key, value]) => 
        this.set(key, value)
      );

      await Promise.all(promises);
    } catch (error) {
      throw new ServiceError(
        'Failed to set multiple values in storage',
        'StorageService',
        { data, originalError: error.message }
      );
    }
  }

  /**
   * Remove multiple keys at once
   * @param {string[]} keys - Array of keys to remove
   * @returns {Promise<void>}
   */
  async removeMultiple(keys) {
    await this.ensureInitialized();

    try {
      const promises = keys.map(key => this.remove(key));
      await Promise.all(promises);
    } catch (error) {
      throw new ServiceError(
        'Failed to remove multiple keys from storage',
        'StorageService',
        { keys, originalError: error.message }
      );
    }
  }

  /**
   * Get storage quota information
   * @returns {Promise<object|null>} - Quota info or null
   */
  async getQuota() {
    await this.ensureInitialized();

    try {
      return await this.storageAdapter.getQuota();
    } catch (error) {
      throw new ServiceError(
        'Failed to get storage quota',
        'StorageService',
        { originalError: error.message }
      );
    }
  }

  /**
   * Enable or disable caching
   * @param {boolean} enabled - Whether to enable caching
   */
  setCacheEnabled(enabled) {
    this.cacheEnabled = enabled;
    
    if (!enabled) {
      this.cache.clear();
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache size
   * @returns {number} - Number of cached items
   */
  getCacheSize() {
    return this.cache.size;
  }

  /**
   * Set cache value with size management
   * @param {string} key - Cache key
   * @param {any} value - Cache value
   */
  setCacheValue(key, value) {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, value);
  }

  /**
   * Ensure service is initialized
   * @returns {Promise<void>}
   */
  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * Get storage capabilities
   * @returns {Promise<object>} - Storage capabilities
   */
  async getCapabilities() {
    await this.ensureInitialized();

    try {
      const quota = await this.getQuota();
      const size = await this.size();
      const keys = await this.keys();

      return {
        isInitialized: this.isInitialized,
        cacheEnabled: this.cacheEnabled,
        cacheSize: this.cache.size,
        maxCacheSize: this.maxCacheSize,
        storageSize: size,
        storageKeys: keys.length,
        quota: quota,
        adapter: this.storageAdapter.constructor.name
      };
    } catch (error) {
      throw new ServiceError(
        'Failed to get storage capabilities',
        'StorageService',
        { originalError: error.message }
      );
    }
  }

  /**
   * Dispose of storage service
   */
  dispose() {
    this.cache.clear();
    this.isInitialized = false;
  }
}
