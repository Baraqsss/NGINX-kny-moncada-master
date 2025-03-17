import { useState, useCallback } from 'react';
import { get, post, put, del, uploadFile, updateFile } from '../utils/apiUtils';

/**
 * Custom hook for handling API requests with loading and error states
 * @returns {Object} API request methods and states
 */
const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Reset error state
   */
  const resetError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Make a GET request
   * @param {string} url - The API endpoint URL
   * @param {Object} options - Additional options
   * @returns {Promise} - The fetch promise
   */
  const apiGet = useCallback(async (url, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await get(url, options);
      return response;
    } catch (err) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Make a POST request
   * @param {string} url - The API endpoint URL
   * @param {Object} data - The data to send
   * @param {Object} options - Additional options
   * @returns {Promise} - The fetch promise
   */
  const apiPost = useCallback(async (url, data, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await post(url, data, options);
      return response;
    } catch (err) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Make a PUT request
   * @param {string} url - The API endpoint URL
   * @param {Object} data - The data to send
   * @param {Object} options - Additional options
   * @returns {Promise} - The fetch promise
   */
  const apiPut = useCallback(async (url, data, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await put(url, data, options);
      return response;
    } catch (err) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Make a DELETE request
   * @param {string} url - The API endpoint URL
   * @param {Object} options - Additional options
   * @returns {Promise} - The fetch promise
   */
  const apiDelete = useCallback(async (url, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await del(url, options);
      return response;
    } catch (err) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Upload a file with form data
   * @param {string} url - The API endpoint URL
   * @param {FormData} formData - The form data to send
   * @param {Object} options - Additional options
   * @returns {Promise} - The fetch promise
   */
  const apiUpload = useCallback(async (url, formData, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await uploadFile(url, formData, options);
      return response;
    } catch (err) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update a file with form data
   * @param {string} url - The API endpoint URL
   * @param {FormData} formData - The form data to send
   * @param {Object} options - Additional options
   * @returns {Promise} - The fetch promise
   */
  const apiUpdateFile = useCallback(async (url, formData, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await updateFile(url, formData, options);
      return response;
    } catch (err) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    resetError,
    apiGet,
    apiPost,
    apiPut,
    apiDelete,
    apiUpload,
    apiUpdateFile
  };
};

export default useApi; 