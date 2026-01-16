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
 * Backend base URL - PRODUCTION HARDENED
 * 
 * Priority:
 * 1. VITE_API_URL environment variable (set in Vercel)
 * 2. Fallback to production Render backend
 * 
 * IMPORTANT: Frontend NEVER calls itself for /api/dashboard
 * All API calls go to the Render backend.
 */
const PRODUCTION_BACKEND_URL = 'https://electoral-roll-tracker-1.onrender.com'
const API_BASE_URL = import.meta.env.VITE_API_URL || PRODUCTION_BACKEND_URL

// ============================================
// STARTUP LOGGING - Essential for debugging production issues
// ============================================
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('[API SERVICE] Frontend API Configuration')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('[API SERVICE] VITE_API_URL env:', import.meta.env.VITE_API_URL || '(not set)')
console.log('[API SERVICE] Using backend:', API_BASE_URL)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

// Warn if VITE_API_URL is not explicitly set (using fallback)
if (!import.meta.env.VITE_API_URL) {
  console.warn('[API SERVICE] ⚠️ VITE_API_URL not set. Using fallback:', PRODUCTION_BACKEND_URL)
}

// SAFETY CHECK: Ensure we never accidentally call localhost or wrong domain
if (API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1')) {
  console.error('[API SERVICE] 🚨 CRITICAL: API pointing to localhost in production build!')
}

/**
 * Axios instance with base configuration
 * All API calls use this instance (baseURL is production backend)
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
 * Get Dashboard Aggregation
 * Calls GET /api/dashboard
 * Reads national-level CSV and returns aggregated statistics
 * 
 * SINGLE SOURCE OF TRUTH for dashboard data
 * Backend reads from: backend/data/indian-national-level-election.csv
 * 
 * @param {string} state - Optional state filter (use 'ALL' for national view)
 * @returns {Promise<Object>} Dashboard aggregation data with:
 *   - total_voters: number
 *   - states_count: number
 *   - constituencies_count: number
 *   - top_constituencies: array of {constituency, voter_count}
 * 
 * @example
 * // National view
 * const nationalData = await getDashboardAggregation('ALL');
 * 
 * // State view
 * const stateData = await getDashboardAggregation('Maharashtra');
 */
export const getDashboardAggregation = async (state = 'ALL') => {
  try {
    // National view: no query param OR state=ALL
    // State view: state=<state name>
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

/**
 * Get Notifications
 * Calls GET /api/notifications
 * 
 * @returns {Promise<Array>} List of notifications
 */
export const getNotifications = async () => {
  try {
    const response = await api.get('/api/notifications')
    return response.data
  } catch (error) {
    handleError(error)
    throw error
  }
}

/**
 * Mark Notification as Read
 * Calls PATCH /api/notifications/:id/read
 * 
 * @param {number} id - Notification ID
 * @returns {Promise<Object>} Success status
 */
export const markNotificationRead = async (id) => {
  try {
    const response = await api.patch(`/api/notifications/${id}/read`)
    return response.data
  } catch (error) {
    handleError(error)
    throw error
  }
}

/**
 * Get Top Anomaly
 * Calls GET /api/top-anomaly
 * 
 * Returns the constituency-period combination with highest anomaly score
 * 
 * @returns {Promise<Object>} Top anomaly data with:
 *   - constituency_id: string
 *   - constituency_name: string
 *   - state: string
 *   - period: string
 *   - score: number
 *   - voter_count: number
 *   - deletion_count: number
 *   - zoom_coordinates: { lat, lng, zoom }
 *   - impact_facts: { swing_seats, equivalent_town, statistical_certainty, confidence_level }
 */
export const getTopAnomaly = async () => {
  try {
    const url = '/api/top-anomaly'
    console.debug('[api] GET', `${API_BASE_URL}${url}`)
    const response = await api.get(url)
    console.debug('[api] Top anomaly response', response.data)
    return response.data
  } catch (error) {
    handleError(error)
    throw error
  }
}

/**
 * Get Constituency Impact Data
 * Calls GET /api/constituency/:id/impact-data
 * 
 * Returns detailed impact analysis for a specific constituency
 * 
 * @param {string} constituencyId - Constituency ID (e.g., "AC-042")
 * @returns {Promise<Object>} Impact data
 */
export const getConstituencyImpact = async (constituencyId) => {
  if (!constituencyId) {
    throw new Error('Constituency ID is required')
  }

  try {
    const url = `/api/constituency/${encodeURIComponent(constituencyId)}/impact-data`
    console.debug('[api] GET', `${API_BASE_URL}${url}`)
    const response = await api.get(url)
    console.debug('[api] Constituency impact response', response.data)
    return response.data
  } catch (error) {
    handleError(error)
    throw error
  }
}

/**
 * Get Anomaly Summary
 * Calls GET /api/anomaly-summary
 * 
 * Returns overall anomaly statistics for the dashboard
 * 
 * @returns {Promise<Object>} Anomaly summary with:
 *   - total_constituencies: number
 *   - anomaly_distribution: { critical, high, medium, low }
 *   - total_unexplained_deletions: number
 *   - potential_swing_seats: number
 */
export const getAnomalySummary = async () => {
  try {
    const url = '/api/anomaly-summary'
    console.debug('[api] GET', `${API_BASE_URL}${url}`)
    const response = await api.get(url)
    console.debug('[api] Anomaly summary response', response.data)
    return response.data
  } catch (error) {
    handleError(error)
    throw error
  }
}

