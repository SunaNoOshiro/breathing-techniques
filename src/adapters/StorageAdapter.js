/**
 * Abstract storage adapter interface
 * Defines contract for storage operations following Dependency Inversion Principle
 */

import { StorageError, ERROR_CODES } from '../errors/AppError.js';

/**
 * Abstract storage adapter class
 * Provides interface for different storage implementations
 */
export class StorageAdapter {
  constructor() {
    if (this.constructor === StorageAdapter) {
      throw new Error('StorageAdapter is abstract and cannot be instantiated directly');
    }
  }

  /**
   * Get value from storage
   * @param {string} key - Storage key
   * @returns {Promise<any>} - Stored value or null if not found
   */
  async get(key) {
    throw new Error('get method must be implemented by subclass');
  }

  /**
   * Set value in storage
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   * @returns {Promise<void>}
   */
  async set(key, value) {
    throw new Error('set method must be implemented by subclass');
  }

  /**
   * Remove value from storage
   * @param {string} key - Storage key
   * @returns {Promise<void>}
   */
  async remove(key) {
    throw new Error('remove method must be implemented by subclass');
  }

  /**
   * Clear all values from storage
   * @returns {Promise<void>}
   */
  async clear() {
    throw new Error('clear method must be implemented by subclass');
  }

  /**
   * Get all keys from storage
   * @returns {Promise<string[]>} - Array of storage keys
   */
  async keys() {
    throw new Error('keys method must be implemented by subclass');
  }

  /**
   * Check if key exists in storage
   * @param {string} key - Storage key
   * @returns {Promise<boolean>} - True if key exists
   */
  async has(key) {
    throw new Error('has method must be implemented by subclass');
  }

  /**
   * Get storage size (number of items)
   * @returns {Promise<number>} - Number of items in storage
   */
  async size() {
    throw new Error('size method must be implemented by subclass');
  }

  /**
   * Check if storage is available
   * @returns {Promise<boolean>} - True if storage is available
   */
  async isAvailable() {
    throw new Error('isAvailable method must be implemented by subclass');
  }

  /**
   * Get storage quota information (if supported)
   * @returns {Promise<object|null>} - Quota info or null if not supported
   */
  async getQuota() {
    return null; // Default implementation returns null
  }

  /**
   * Validate storage key
   * @param {string} key - Storage key to validate
   * @throws {StorageError} - If key is invalid
   */
  validateKey(key) {
    if (typeof key !== 'string') {
      throw new StorageError(
        'Storage key must be a string',
        'VALIDATE_KEY',
        { key, type: typeof key }
      );
    }

    if (key.length === 0) {
      throw new StorageError(
        'Storage key cannot be empty',
        'VALIDATE_KEY',
        { key }
      );
    }

    if (key.length > 100) {
      throw new StorageError(
        'Storage key too long (max 100 characters)',
        'VALIDATE_KEY',
        { key, length: key.length }
      );
    }
  }

  /**
   * Validate storage value
   * @param {any} value - Value to validate
   * @throws {StorageError} - If value is invalid
   */
  validateValue(value) {
    if (value === undefined) {
      throw new StorageError(
        'Cannot store undefined value',
        'VALIDATE_VALUE',
        { value }
      );
    }
  }

  /**
   * Serialize value for storage
   * @param {any} value - Value to serialize
   * @returns {string} - Serialized value
   */
  serialize(value) {
    try {
      return JSON.stringify(value);
    } catch (error) {
      throw new StorageError(
        'Failed to serialize value for storage',
        'SERIALIZE_VALUE',
        { value, error: error.message }
      );
    }
  }

  /**
   * Deserialize value from storage
   * @param {string} serializedValue - Serialized value
   * @returns {any} - Deserialized value
   */
  deserialize(serializedValue) {
    try {
      return JSON.parse(serializedValue);
    } catch (error) {
      throw new StorageError(
        'Failed to deserialize value from storage',
        'DESERIALIZE_VALUE',
        { serializedValue, error: error.message }
      );
    }
  }

  /**
   * Safe get operation with error handling
   * @param {string} key - Storage key
   * @returns {Promise<any>} - Stored value or null if error
   */
  async safeGet(key) {
    try {
      this.validateKey(key);
      return await this.get(key);
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError(
        'Failed to get value from storage',
        ERROR_CODES.STORAGE_READ_FAILED,
        { key, originalError: error.message }
      );
    }
  }

  /**
   * Safe set operation with error handling
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   * @returns {Promise<void>}
   */
  async safeSet(key, value) {
    try {
      this.validateKey(key);
      this.validateValue(value);
      await this.set(key, value);
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError(
        'Failed to set value in storage',
        ERROR_CODES.STORAGE_WRITE_FAILED,
        { key, value, originalError: error.message }
      );
    }
  }

  /**
   * Safe remove operation with error handling
   * @param {string} key - Storage key
   * @returns {Promise<void>}
   */
  async safeRemove(key) {
    try {
      this.validateKey(key);
      await this.remove(key);
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError(
        'Failed to remove value from storage',
        ERROR_CODES.STORAGE_CLEAR_FAILED,
        { key, originalError: error.message }
      );
    }
  }
}
