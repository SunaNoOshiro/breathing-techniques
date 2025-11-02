/**
 * LocalStorage implementation of StorageAdapter
 * Provides localStorage-based storage with error handling and validation
 */

import { StorageAdapter } from './StorageAdapter.js';
import { StorageError, ERROR_CODES } from '../errors/AppError.js';

/**
 * LocalStorage adapter implementation
 */
export class LocalStorageAdapter extends StorageAdapter {
  constructor() {
    super();
    this.storage = window.localStorage;
    this.isSupported = this.checkSupport();
  }

  /**
   * Check if localStorage is supported
   * @returns {boolean} - True if localStorage is supported
   */
  checkSupport() {
    try {
      const testKey = '__localStorage_test__';
      this.storage.setItem(testKey, 'test');
      this.storage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if storage is available
   * @returns {Promise<boolean>} - True if storage is available
   */
  async isAvailable() {
    return this.isSupported;
  }

  /**
   * Get value from localStorage
   * @param {string} key - Storage key
   * @returns {Promise<any>} - Stored value or null if not found
   */
  async get(key) {
    if (!this.isSupported) {
      throw new StorageError(
        'localStorage is not supported in this environment',
        'STORAGE_NOT_SUPPORTED',
        { key }
      );
    }

    try {
      const serializedValue = this.storage.getItem(key);
      if (serializedValue === null) {
        return null;
      }
      return this.deserialize(serializedValue);
    } catch (error) {
      throw new StorageError(
        'Failed to get value from localStorage',
        ERROR_CODES.STORAGE_READ_FAILED,
        { key, originalError: error.message }
      );
    }
  }

  /**
   * Set value in localStorage
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   * @returns {Promise<void>}
   */
  async set(key, value) {
    if (!this.isSupported) {
      throw new StorageError(
        'localStorage is not supported in this environment',
        'STORAGE_NOT_SUPPORTED',
        { key, value }
      );
    }

    try {
      const serializedValue = this.serialize(value);
      this.storage.setItem(key, serializedValue);
    } catch (error) {
      // Handle quota exceeded error specifically
      if (error.name === 'QuotaExceededError') {
        throw new StorageError(
          'localStorage quota exceeded',
          'STORAGE_QUOTA_EXCEEDED',
          { key, value, originalError: error.message }
        );
      }
      
      throw new StorageError(
        'Failed to set value in localStorage',
        ERROR_CODES.STORAGE_WRITE_FAILED,
        { key, value, originalError: error.message }
      );
    }
  }

  /**
   * Remove value from localStorage
   * @param {string} key - Storage key
   * @returns {Promise<void>}
   */
  async remove(key) {
    if (!this.isSupported) {
      throw new StorageError(
        'localStorage is not supported in this environment',
        'STORAGE_NOT_SUPPORTED',
        { key }
      );
    }

    try {
      this.storage.removeItem(key);
    } catch (error) {
      throw new StorageError(
        'Failed to remove value from localStorage',
        ERROR_CODES.STORAGE_CLEAR_FAILED,
        { key, originalError: error.message }
      );
    }
  }

  /**
   * Clear all values from localStorage
   * @returns {Promise<void>}
   */
  async clear() {
    if (!this.isSupported) {
      throw new StorageError(
        'localStorage is not supported in this environment',
        'STORAGE_NOT_SUPPORTED'
      );
    }

    try {
      this.storage.clear();
    } catch (error) {
      throw new StorageError(
        'Failed to clear localStorage',
        ERROR_CODES.STORAGE_CLEAR_FAILED,
        { originalError: error.message }
      );
    }
  }

  /**
   * Get all keys from localStorage
   * @returns {Promise<string[]>} - Array of storage keys
   */
  async keys() {
    if (!this.isSupported) {
      throw new StorageError(
        'localStorage is not supported in this environment',
        'STORAGE_NOT_SUPPORTED'
      );
    }

    try {
      const keys = [];
      for (let i = 0; i < this.storage.length; i++) {
        keys.push(this.storage.key(i));
      }
      return keys;
    } catch (error) {
      throw new StorageError(
        'Failed to get keys from localStorage',
        'STORAGE_KEYS_FAILED',
        { originalError: error.message }
      );
    }
  }

  /**
   * Check if key exists in localStorage
   * @param {string} key - Storage key
   * @returns {Promise<boolean>} - True if key exists
   */
  async has(key) {
    if (!this.isSupported) {
      return false;
    }

    try {
      return this.storage.getItem(key) !== null;
    } catch (error) {
      throw new StorageError(
        'Failed to check if key exists in localStorage',
        'STORAGE_HAS_FAILED',
        { key, originalError: error.message }
      );
    }
  }

  /**
   * Get localStorage size (number of items)
   * @returns {Promise<number>} - Number of items in storage
   */
  async size() {
    if (!this.isSupported) {
      return 0;
    }

    try {
      return this.storage.length;
    } catch (error) {
      throw new StorageError(
        'Failed to get localStorage size',
        'STORAGE_SIZE_FAILED',
        { originalError: error.message }
      );
    }
  }

  /**
   * Get localStorage quota information
   * @returns {Promise<object|null>} - Quota info or null if not supported
   */
  async getQuota() {
    if (!this.isSupported || !('storage' in navigator)) {
      return null;
    }

    try {
      const estimate = await navigator.storage.estimate();
      return {
        quota: estimate.quota,
        usage: estimate.usage,
        available: estimate.quota - estimate.usage,
        percentage: estimate.quota ? (estimate.usage / estimate.quota) * 100 : 0
      };
    } catch (error) {
      // Quota API not supported or failed
      return null;
    }
  }

  /**
   * Get storage usage for specific keys
   * @param {string[]} keys - Keys to check usage for
   * @returns {Promise<object>} - Usage information
   */
  async getUsageForKeys(keys) {
    if (!this.isSupported) {
      return { totalSize: 0, keySizes: {} };
    }

    try {
      const keySizes = {};
      let totalSize = 0;

      for (const key of keys) {
        const value = this.storage.getItem(key);
        if (value !== null) {
          const size = new Blob([value]).size;
          keySizes[key] = size;
          totalSize += size;
        }
      }

      return { totalSize, keySizes };
    } catch (error) {
      throw new StorageError(
        'Failed to get usage for keys',
        'STORAGE_USAGE_FAILED',
        { keys, originalError: error.message }
      );
    }
  }

  /**
   * Clean up old or unused items
   * @param {string[]} keepKeys - Keys to keep
   * @returns {Promise<number>} - Number of items removed
   */
  async cleanup(keepKeys = []) {
    if (!this.isSupported) {
      return 0;
    }

    try {
      const allKeys = await this.keys();
      const keysToRemove = allKeys.filter(key => !keepKeys.includes(key));
      
      for (const key of keysToRemove) {
        await this.remove(key);
      }

      return keysToRemove.length;
    } catch (error) {
      throw new StorageError(
        'Failed to cleanup localStorage',
        'STORAGE_CLEANUP_FAILED',
        { keepKeys, originalError: error.message }
      );
    }
  }
}
