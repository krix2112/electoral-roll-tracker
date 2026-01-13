/**
 * Frontend API Service Layer
 * 
 * This is the ONLY place where frontend talks to backend.
 * Frontend pages/components must never call fetch() directly.
 * 
 * Owner: Full-Stack/Integration Lead
 * Team: Teen Titans | Snowfrost Hackathon 2026
 */

import axios from 'axios'

// ============================================
// 1️⃣ BASE CONFIGURATION
// ============================================

/**
 * Backend base URL
 * Supports environment variable override via VITE_API_URL
 * Default: https://electoral-roll-tracker-1.onrender.com
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://electoral-roll-tracker-1.onrender.com' // FIX
console.debug('[api] Resolved base URL', API_BASE_URL) // FIX

/**
 * Axios instance with base configuration
 * Common headers and error handling are centralized here
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout for file uploads
})

/**
 * Centralized error handling
 * Converts axios errors to user-friendly error messages
 */
const handleError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response
    const errorMessage = data?.error || `Server error: ${status}`
    throw new Error(errorMessage)
  } else if (error.request) {
    // Request made but no response received
    throw new Error('Network error: Unable to reach the server. Please check your connection.')
  } else {
    // Something else happened
    throw new Error(error.message || 'An unexpected error occurred')
  }
}

// ============================================
// 2️⃣ API FUNCTIONS
// ============================================

/**
 * Health Check
 * Calls GET /health
 * Used to verify backend is alive
 * 
 * @returns {Promise<Object>} Health status object
 * @throws {Error} If health check fails
 * 
 * @example
 * const health = await healthCheck();
 * console.log(health.status); // "healthy"
 */
export const healthCheck = async () => {
  try {
    const response = await api.get('/health')
    return response.data
  } catch (error) {
    handleError(error)
    throw error
  }
}

/**
 * Upload Electoral Roll
 * Calls POST /api/upload
 * 
 * @param {File} file - CSV file object to upload
 * @returns {Promise<Object>} Upload result with upload_id, row_count, filename
 * @throws {Error} If upload fails
 * 
 * @example
 * const file = document.querySelector('input[type="file"]').files[0];
 * const result = await uploadRoll(file, "Maharashtra");
 * console.log(result.upload_id); // "uuid-string"
 * console.log(result.row_count); // 2000
 */
export const uploadRoll = async (files, state) => {
  if (!files) {
    throw new Error('Invalid file: File object or array is required')
  }

  // Normalize to array
  const fileList = Array.isArray(files) ? files : [files]

  if (fileList.length === 0) {
    throw new Error('No files provided')
  }

  try {
    const formData = new FormData()
    fileList.forEach(file => {
      formData.append('file', file)
    })

    if (state) {
      formData.append('state', state)
    }

    const response = await api.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  } catch (error) {
    handleError(error)
    throw error
  }
}

// Alias for backward compatibility with Upload.jsx; exported once to avoid duplicate identifier errors. // FIX
export const uploadElectoralRoll = uploadRoll // FIX

/**
 * Get All Uploads
 * Calls GET /api/uploads
 * 
 * @returns {Promise<Array>} List of uploaded electoral rolls
 * @throws {Error} If fetch fails
 * 
 * @example
 * const uploads = await getUploads();
 * console.log(uploads[0].upload_id); // "uuid-string"
 * console.log(uploads[0].filename); // "electoral_roll.csv"
 */
export const getUploads = async () => {
  try {
    const url = '/api/uploads' // FIX
    console.debug('[api] GET', `${API_BASE_URL}${url}`) // FIX
    const response = await api.get(url)
    console.debug('[api] Response', `${API_BASE_URL}${url}`, response?.data) // FIX
    return response.data
  } catch (error) {
    handleError(error)
    throw error
  }
}

/**
 * Compare Electoral Rolls
 * Calls POST /api/compare
 * 
 * @param {string} uploadId1 - Upload ID of the old electoral roll
 * @param {string} uploadId2 - Upload ID of the new electoral roll
 * @returns {Promise<Object>} Comparison result with added, deleted, modified, stats, alerts
 * @throws {Error} If comparison fails
 * 
 * @example
 * const result = await compareRolls("uuid-1", "uuid-2");
 * console.log(result.stats.total_added); // 150
 * console.log(result.stats.total_deleted); // 75
 * console.log(result.alerts); // Array of suspicious patterns
 */
export const compareRolls = async (uploadId1, uploadId2) => {
  if (!uploadId1 || !uploadId2) {
    throw new Error('Both upload IDs are required')
  }

  if (uploadId1 === uploadId2) {
    throw new Error('Cannot compare an electoral roll with itself')
  }

  try {
    const url = '/api/compare' // FIX
    const payload = {
      old_upload_id: uploadId1,
      new_upload_id: uploadId2,
    } // FIX
    console.debug('[api] POST', `${API_BASE_URL}${url}`, payload) // FIX

    const response = await api.post(url, payload)
    console.debug('[api] Response', `${API_BASE_URL}${url}`, response?.data) // FIX

    return response.data
  } catch (error) {
    handleError(error)
    throw error
  }
}

/**
 * Get Dashboard Stats
 * Calls GET /api/stats
 * 
 * @param {string} state - Optional state filter
 * @returns {Promise<Object>} Dashboard statistics
 */
export const getDashboardStats = async (state) => {
  try {
    const url = state && state !== 'All States' ? `/api/stats?state=${encodeURIComponent(state)}` : '/api/stats'
    console.debug('[api] GET', `${API_BASE_URL}${url}`)
    const response = await api.get(url)
    return response.data
  } catch (error) {
    handleError(error)
    throw error
  }
}

/**
 * Get Dashboard Aggregation
 * Calls GET /api/dashboard
 * Reads national-level CSV and returns aggregated statistics
 * 
 * @param {string} state - Optional state filter (use 'ALL' for all states)
 * @returns {Promise<Object>} Dashboard aggregation data
 * 
 * @example
 * const data = await getDashboardAggregation('Maharashtra');
 * console.log(data.total_voters); // 50000
 * console.log(data.top_constituencies); // Array of top 5
 */
export const getDashboardAggregation = async (state = 'ALL') => {
  try {
    const url = state && state !== 'ALL' ? `/api/dashboard?state=${encodeURIComponent(state)}` : '/api/dashboard'
    console.debug('[api] GET', `${API_BASE_URL}${url}`)
    const response = await api.get(url)
    console.debug('[api] Dashboard aggregation response', response.data)
    return response.data
  } catch (error) {
    handleError(error)
    throw error
  }
}

// Export default for potential future use
export default api
