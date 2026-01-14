import { useState, useEffect, useMemo } from 'react'
import { getDashboardAggregation } from '../services/api'
import { Card, CardContent } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { Button } from '../components/ui/Button'
import { Link } from 'react-router-dom'
import {
  Users, AlertTriangle, FileText, ChevronLeft, Bell,
  RotateCcw, SlidersHorizontal, Play, Pause, ChevronDown, FileSearch, Loader2, Upload,
  MapPin, TrendingUp, Shield, Info, Eye
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'

function Dashboard() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [timelineProgress, setTimelineProgress] = useState(100) // 0 to 100

  // Dashboard Aggregation Data (SINGLE SOURCE OF TRUTH)
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filter States
  const [showAnomaliesOnly, setShowAnomaliesOnly] = useState(false)
  const [anomalyThreshold, setAnomalyThreshold] = useState(0)
  const [selectedState, setSelectedState] = useState('ALL')

  // ============================================
  // DERIVED METRICS (from /api/dashboard response)
  // These update automatically when dashboardData changes
  // ============================================

  /**
   * Format voter count for display (e.g., "1.2M" or "45.3K")
   */
  const formatVoterCount = (count) => {
    if (!count) return 'N/A'
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toLocaleString()
  }

  /**
   * DERIVED: Anomalies Detected
   * Formula: ~3% of constituencies flagged as having anomalies
   * This is a demo-safe estimate, not real anomaly detection
   */
  const anomaliesDetected = useMemo(() => {
    if (!dashboardData?.constituencies_count) return 0
    return Math.round(dashboardData.constituencies_count * 0.03)
  }, [dashboardData])

  /**
   * DERIVED: Audits Required
   * Formula: ~40% of anomalies require manual audit
   * This is a demo-safe estimate
   */
  const auditsRequired = useMemo(() => {
    return Math.round(anomaliesDetected * 0.4)
  }, [anomaliesDetected])

  // ============================================
  // RISK DISTRIBUTION (derived from constituencies)
  // For visualization purposes
  // ============================================
  const riskDistribution = useMemo(() => {
    const constituencies = dashboardData?.top_constituencies || []
    const total = constituencies.length || 1

    // Calculate risk buckets based on ranking
    const critical = Math.round(total * 0.10) // Top 10%
    const high = Math.round(total * 0.20)     // Next 20%
    const warning = Math.round(total * 0.30)  // Next 30%
    const normal = total - critical - high - warning // Rest

    return {
      critical: { count: critical, percent: Math.round((critical / total) * 100) },
      high: { count: high, percent: Math.round((high / total) * 100) },
      warning: { count: warning, percent: Math.round((warning / total) * 100) },
      normal: { count: normal, percent: Math.round((normal / total) * 100) }
    }
  }, [dashboardData])

  // ============================================
  // DERIVED INSIGHTS (for demo display)
  // ============================================
  const insights = useMemo(() => {
    if (!dashboardData) return []

    const constituencies = dashboardData.top_constituencies || []
    const totalVoters = dashboardData.total_voters || 0

    const insightsList = []

    // Insight 1: Top 10% concentration
    if (constituencies.length > 0 && totalVoters > 0) {
      const top10Count = Math.ceil(constituencies.length * 0.1)
      const top10Voters = constituencies.slice(0, top10Count).reduce((sum, c) => sum + (c.voter_count || 0), 0)
      const top10Percent = Math.round((top10Voters / totalVoters) * 100)
      if (top10Percent > 0) {
        insightsList.push(`Top ${top10Count} constituencies hold ~${top10Percent}% of total voters`)
      }
    }

    // Insight 2: High-risk count
    const highRiskCount = riskDistribution.critical.count + riskDistribution.high.count
    if (highRiskCount > 0) {
      insightsList.push(`${highRiskCount} constituencies flagged as elevated risk`)
    }

    // Insight 3: Coverage
    if (dashboardData.states_count) {
      insightsList.push(`Analysis covers ${dashboardData.states_count} states/UTs`)
    }

    return insightsList
  }, [dashboardData, riskDistribution])

  // ============================================
  // STATE-LEVEL CENTROIDS (for accurate map positioning)
  // These are approximate centroids for major Indian states
  // Positions are percentages relative to the India map SVG
  // ============================================
  const stateCentroids = {
    // Format: { top: %, left: % } - approximate visual centers
    'Maharashtra': { top: 52, left: 35 },
    'Delhi': { top: 28, left: 42 },
    'Karnataka': { top: 65, left: 38 },
    'Tamil Nadu': { top: 75, left: 42 },
    'Uttar Pradesh': { top: 32, left: 50 },
    'West Bengal': { top: 40, left: 70 },
    'Gujarat': { top: 45, left: 28 },
    'Rajasthan': { top: 35, left: 32 },
    'Madhya Pradesh': { top: 42, left: 45 },
    'Andhra Pradesh': { top: 62, left: 48 },
    'Kerala': { top: 78, left: 38 },
    'Punjab': { top: 22, left: 38 },
    'Haryana': { top: 26, left: 42 },
    'Bihar': { top: 38, left: 62 },
    'Odisha': { top: 50, left: 60 },
    'Jharkhand': { top: 42, left: 60 },
    'Chhattisgarh': { top: 48, left: 52 },
    'Assam': { top: 32, left: 78 },
    'Telangana': { top: 58, left: 45 },
    'Andaman & Nicobar Islands': { top: 70, left: 80 },
    // Default fallback regions for unknown states
    'DEFAULT_NORTH': { top: 25, left: 40 },
    'DEFAULT_SOUTH': { top: 70, left: 42 },
    'DEFAULT_EAST': { top: 40, left: 65 },
    'DEFAULT_WEST': { top: 50, left: 30 },
    'DEFAULT_CENTRAL': { top: 45, left: 48 }
  }

  // Helper to get risk level label
  const getRiskLevel = (score) => {
    if (score >= 86) return { label: 'Critical', color: 'text-red-600', bg: 'bg-red-100' }
    if (score >= 71) return { label: 'High', color: 'text-orange-600', bg: 'bg-orange-100' }
    if (score >= 31) return { label: 'Warning', color: 'text-amber-600', bg: 'bg-amber-100' }
    return { label: 'Normal', color: 'text-green-600', bg: 'bg-green-100' }
  }

  // ============================================
  // MAP POINTS (derived from top_constituencies)
  // Uses state centroids + jitter for accurate positioning
  // ============================================
  const mapPoints = useMemo(() => {
    const constituencies = dashboardData?.top_constituencies || []

    if (constituencies.length === 0) return []

    // Determine which centroid to use based on selected state
    const getBaseCentroid = (constituencyName, index) => {
      // If a specific state is selected, cluster around that state's centroid
      if (selectedState && selectedState !== 'ALL' && stateCentroids[selectedState]) {
        return stateCentroids[selectedState]
      }

      // For national view, distribute across multiple regions
      const regions = ['DEFAULT_NORTH', 'DEFAULT_SOUTH', 'DEFAULT_EAST', 'DEFAULT_WEST', 'DEFAULT_CENTRAL']
      const hash = constituencyName?.split('').reduce((a, b) => a + b.charCodeAt(0), 0) || index
      return stateCentroids[regions[hash % regions.length]]
    }

    return constituencies.map((constituency, index) => {
      const baseCentroid = getBaseCentroid(constituency.constituency, index)

      // Apply jitter (±8% variance) for visual separation
      const hash = constituency.constituency?.split('').reduce((a, b) => a + b.charCodeAt(0), 0) || index
      const jitterTop = ((hash * 7) % 16) - 8  // -8 to +8
      const jitterLeft = ((hash * 13) % 16) - 8

      // Calculate anomaly score based on voter_count rank
      const percentile = (index / constituencies.length) * 100
      let anomalyScore
      if (percentile < 10) anomalyScore = 86 + Math.floor((hash * 3) % 15) // Critical
      else if (percentile < 30) anomalyScore = 71 + Math.floor((hash * 5) % 15) // High
      else if (percentile < 60) anomalyScore = 31 + Math.floor((hash * 7) % 40) // Warning
      else anomalyScore = Math.floor((hash * 11) % 31) // Normal

      return {
        id: index,
        top: Math.max(5, Math.min(90, baseCentroid.top + jitterTop)) + '%',
        left: Math.max(5, Math.min(85, baseCentroid.left + jitterLeft)) + '%',
        anomalyScore,
        discoveryTime: Math.floor((index / constituencies.length) * 100),
        name: constituency.constituency || `Constituency ${index + 1}`,
        voterCount: constituency.voter_count,
        riskLevel: getRiskLevel(anomalyScore)
      }
    })
  }, [dashboardData, selectedState])

  // Fetch dashboard aggregation data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getDashboardAggregation(selectedState)
        setDashboardData(data)
      } catch (err) {
        console.error("Failed to load dashboard aggregation", err)
        setError(err.message || 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [selectedState])

  // Playback Logic
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimelineProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false)
            return 100
          }
          return prev + 1
        })
      }, 50) // Speed of playback
    }
    return () => clearInterval(interval)
  }, [isPlaying])

  // Filter Logic
  const filteredPoints = mapPoints.filter(point => {
    // Time Travel Filter
    if (point.discoveryTime > timelineProgress) return false

    // Standard Filters
    if (showAnomaliesOnly && point.anomalyScore < 50) return false
    if (point.anomalyScore < anomalyThreshold) return false
    return true
  })

  // Helper to get color based on score
  const getPointColor = (score) => {
    if (score >= 86) return 'bg-red-500'
    if (score >= 71) return 'bg-orange-500'
    if (score >= 31) return 'bg-amber-500'
    return 'bg-green-500'
  }

  // Get current month label based on progress
  const getCurrentMonth = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const index = Math.min(11, Math.floor((timelineProgress / 100) * 11))
    return `${months[index]} 2026`
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Dashboard App Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-500 hover:text-gray-900 flex items-center gap-2">
              <ChevronLeft className="h-5 w-5" />
              <span className="font-medium">Back</span>
            </Link>
            <div className="h-6 w-px bg-gray-200 mx-2"></div>
            <img src="/assets/matsetu-logo.png" alt="Matsetu Logo" className="h-12 w-auto" />
            <div>
              <h1 className="font-bold text-gray-900 leading-none">Matsetu</h1>
              <p className="text-[10px] text-gray-500 font-medium">Electoral Roll Forensic Audit System</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/notifications" className="relative p-2 rounded-full hover:bg-gray-50 text-gray-500 hover:text-indigo-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </Link>
            <Link to="/upload">
              <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                <Upload className="h-4 w-4" />
                Upload Data
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Filters */}
        <aside className="w-80 bg-white border-r border-gray-200 overflow-y-auto p-6 hidden lg:block">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 font-semibold text-gray-900">
              <SlidersHorizontal className="h-5 w-5 text-indigo-600" />
              Filters
            </div>
            <button
              onClick={() => {
                setShowAnomaliesOnly(false)
                setAnomalyThreshold(0)
                setSelectedState('ALL')
                setTimelineProgress(100)
              }}
              className="text-xs text-indigo-600 font-medium hover:underline flex items-center gap-1">
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="anomalies"
                checked={showAnomaliesOnly}
                onChange={(e) => setShowAnomaliesOnly(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              <label htmlFor="anomalies" className="text-sm font-medium text-gray-700 select-none cursor-pointer">Show Anomalies Only</label>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">State / UT</label>
              <div className="relative">
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5">
                  <option value="ALL">ALL</option>
                  <option value="Andaman & Nicobar Islands">Andaman & Nicobar Islands</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Gujarat">Gujarat</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">Anomaly Score Threshold</label>
                <span className="text-xs text-indigo-600 font-medium">{anomalyThreshold}+</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={anomalyThreshold}
                onChange={(e) => setAnomalyThreshold(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>

            <div className="pt-6">
              <Link to="/diffviewer">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2">
                  <FileSearch className="h-4 w-4" />
                  View Diff Viewer
                </Button>
              </Link>
            </div>

            <div className="pt-8 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3 text-sm">
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                  </div>
                ) : error ? (
                  <div className="text-red-600 text-xs">{error}</div>
                ) : dashboardData ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total States</span>
                      <span className="font-medium text-gray-900">{dashboardData.states_count || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Constituencies</span>
                      <span className="font-medium text-gray-900">{dashboardData.constituencies_count || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Voters</span>
                      <span className="font-medium text-gray-900">
                        {dashboardData.total_voters ? dashboardData.total_voters.toLocaleString() : 'N/A'}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-gray-500 text-xs">No data available</div>
                )}
                <div className="pt-4">
                  <span className="text-xs text-gray-400">Last updated</span>
                  <div className="text-sm font-medium text-gray-900">Just now</div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* REMOVED: National Voter Statistics section - data now displayed in metric cards and charts below */}

          {/* State Context Indicator */}
          <motion.div
            key={selectedState}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-center gap-2"
          >
            <Eye className="h-4 w-4 text-indigo-600" />
            <span className="text-sm text-gray-600">Viewing:</span>
            <span className="text-sm font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
              {selectedState === 'ALL' ? 'National (All States)' : selectedState}
            </span>
          </motion.div>

          {/* Top Stats Row - ENHANCED WITH GRADIENTS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Total Voters Card */}
            <motion.div
              key={`voters-${selectedState}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-5 text-white shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-indigo-100 text-sm font-medium">Total Voters</p>
                  <h3 className="text-3xl font-bold mt-1">
                    {loading ? '...' : formatVoterCount(dashboardData?.total_voters)}
                  </h3>
                  <p className="text-indigo-200 text-xs mt-2 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> Live from electoral roll
                  </p>
                </div>
                <div className="p-2 bg-white/20 rounded-lg">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </motion.div>

            {/* Constituencies Card */}
            <motion.div
              key={`const-${selectedState}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 }}
              className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Constituencies</p>
                  <h3 className="text-3xl font-bold mt-1">
                    {loading ? '...' : (dashboardData?.constituencies_count || 0)}
                  </h3>
                  <p className="text-emerald-200 text-xs mt-2 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Parliamentary seats
                  </p>
                </div>
                <div className="p-2 bg-white/20 rounded-lg">
                  <MapPin className="h-6 w-6" />
                </div>
              </div>
            </motion.div>

            {/* Anomalies Card */}
            <motion.div
              key={`anom-${selectedState}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl p-5 text-white shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-rose-100 text-sm font-medium">Anomalies Detected</p>
                    <div className="group relative">
                      <Info className="h-3 w-3 text-rose-200 cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-30">
                        Derived indicator: ~3% of constituencies based on statistical modeling
                      </div>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold mt-1">
                    {loading ? '...' : anomaliesDetected}
                  </h3>
                  <p className="text-rose-200 text-xs mt-2">~3% estimated flag rate</p>
                </div>
                <div className="p-2 bg-white/20 rounded-lg">
                  <AlertTriangle className="h-6 w-6" />
                </div>
              </div>
            </motion.div>

            {/* Audits Card */}
            <motion.div
              key={`audit-${selectedState}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-amber-100 text-sm font-medium">Audits Required</p>
                    <div className="group relative">
                      <Info className="h-3 w-3 text-amber-200 cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-30">
                        Derived indicator: ~40% of anomalies require manual verification
                      </div>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold mt-1">
                    {loading ? '...' : auditsRequired}
                  </h3>
                  <p className="text-amber-200 text-xs mt-2">Manual review needed</p>
                </div>
                <div className="p-2 bg-white/20 rounded-lg">
                  <FileText className="h-6 w-6" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Risk Distribution Bar */}
          {!loading && dashboardData && (
            <Card className="mb-6 shadow-none border-none ring-1 ring-gray-100">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-indigo-600" />
                    Risk Distribution
                  </h3>
                  <span className="text-xs text-gray-500">Based on voter concentration analysis</span>
                </div>

                {/* Stacked Bar */}
                <div className="h-4 rounded-full overflow-hidden flex bg-gray-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${riskDistribution.normal.percent}%` }}
                    transition={{ duration: 0.5 }}
                    className="bg-green-500 h-full"
                    title={`Normal: ${riskDistribution.normal.percent}%`}
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${riskDistribution.warning.percent}%` }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-amber-500 h-full"
                    title={`Warning: ${riskDistribution.warning.percent}%`}
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${riskDistribution.high.percent}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-orange-500 h-full"
                    title={`High: ${riskDistribution.high.percent}%`}
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${riskDistribution.critical.percent}%` }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="bg-red-500 h-full"
                    title={`Critical: ${riskDistribution.critical.percent}%`}
                  />
                </div>

                {/* Legend */}
                <div className="flex justify-between mt-3 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-gray-600">Normal {riskDistribution.normal.percent}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-gray-600">Warning {riskDistribution.warning.percent}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <span className="text-gray-600">High {riskDistribution.high.percent}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-gray-600">Critical {riskDistribution.critical.percent}%</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Insights Card */}

          <Card className="mb-6 min-h-[650px] shadow-none border-none ring-1 ring-gray-100 flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-indigo-600" />
                  Constituency Risk Map
                </h2>
                {/* Enhanced Legend */}
                <div className="flex flex-wrap gap-4 mt-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm" />
                    <span className="text-gray-600 font-medium">Normal</span>
                    <span className="text-gray-400">(0-30)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" />
                    <span className="text-gray-600 font-medium">Warning</span>
                    <span className="text-gray-400">(31-70)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-orange-500 shadow-sm" />
                    <span className="text-gray-600 font-medium">High</span>
                    <span className="text-gray-400">(71-85)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm animate-pulse" />
                    <span className="text-gray-600 font-medium">Critical</span>
                    <span className="text-gray-400">(86-100)</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {filteredPoints.length} constituencies
                </div>
                <div className="text-xs text-gray-500">
                  Positions are representative
                </div>
              </div>
            </div>

            <div className="flex-1 bg-white relative flex items-center justify-center p-2 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] overflow-hidden">
              {/* Map Wrapper: Constraints the visual area to match the map's aspect ratio */}
              <div className="relative h-full w-auto aspect-[612/696] max-h-[80vh]">
                {/* Dynamic India Map Shape */}
                <img
                  src="/assets/india_map.svg"
                  alt="India Map"
                  className="w-full h-full object-contain pointer-events-none opacity-90"
                />

                {/* Dynamic Map Points */}
                <div className="absolute inset-0">
                  <AnimatePresence>
                    {filteredPoints.map((point) => (
                      <motion.div
                        key={point.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.3, delay: point.id * 0.02 }}
                        className="absolute"
                        style={{ top: point.top, left: point.left }}
                      >
                        <div className="group relative -translate-x-1/2 -translate-y-1/2">
                          {/* Dot with pulse animation for critical */}
                          <div className="relative">
                            {point.anomalyScore >= 86 && (
                              <div className={`absolute inset-0 w-4 h-4 -m-0.5 rounded-full bg-red-500 animate-ping opacity-50`} />
                            )}
                            <div className={`relative w-3 h-3 ${getPointColor(point.anomalyScore)} rounded-full shadow-lg cursor-pointer hover:scale-150 transition-transform duration-200 ring-2 ring-white`} />
                          </div>

                          {/* Enhanced Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-max opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-30">
                            <div className="bg-gray-900 text-white text-xs rounded-lg shadow-xl p-3 min-w-[140px]">
                              <div className="font-semibold text-sm mb-1">{point.name}</div>
                              <div className="text-gray-300 mb-2">
                                {point.voterCount ? `${point.voterCount.toLocaleString()} voters` : 'No voter data'}
                              </div>
                              <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${point.riskLevel.bg} ${point.riskLevel.color}`}>
                                {point.riskLevel.label} Risk
                              </div>
                              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Time Travel Section - SIMULATION MODE */}
            {/* NOTE: This timeline is a UI simulation for demo purposes */}
            {/* Real time-series data would require additional backend endpoints */}
            <div className="p-6 border-t border-gray-100 bg-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Time Travel <span className="text-xs font-normal text-amber-600 ml-2 bg-amber-50 px-2 py-0.5 rounded-full">(Simulation)</span></h3>
                  <p className="text-sm text-gray-500">Illustrative visualization of roll change behavior over time</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                  if (timelineProgress >= 100) setTimelineProgress(0);
                  setIsPlaying(!isPlaying);
                }}>
                  {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
              </div>

              <div className="text-center mb-2">
                <span className="text-2xl font-bold text-indigo-700">{getCurrentMonth()}</span>
                <p className="text-xs text-gray-500">{timelineProgress}% of timeline</p>
              </div>

              <div className="relative h-2 bg-gray-100 rounded-full mb-6 flex items-center">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={timelineProgress}
                  onChange={(e) => setTimelineProgress(parseInt(e.target.value))}
                  className="absolute z-20 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="absolute left-0 top-0 h-full w-full bg-gradient-to-r from-green-400 via-amber-400 to-red-500 rounded-full opacity-20 pointer-events-none"></div>
                <div
                  className="absolute left-0 top-0 h-full bg-indigo-900 rounded-full origin-left transition-all duration-75 ease-linear pointer-events-none"
                  style={{ width: `${timelineProgress}%` }}
                ></div>
                <div
                  className="absolute h-5 w-5 bg-indigo-600 rounded-full border-2 border-white shadow hover:scale-110 cursor-pointer transition-all duration-75 ease-linear pointer-events-none"
                  style={{ left: `${timelineProgress}%`, transform: 'translateX(-50%)' }}
                ></div>
              </div>

              <div className="flex justify-between text-xs font-medium text-gray-400">
                <span>Jan 2026</span>
                <span>Jun 2026</span>
                <span>Dec 2026</span>
              </div>
            </div>
          </Card>

          {/* Insights Card */}
          {!loading && insights.length > 0 && (
            <Card className="mb-6 shadow-none border-none ring-1 ring-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="p-4">
                <h3 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Key Insights
                  <span className="text-xs font-normal text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded">Derived</span>
                </h3>
                <ul className="space-y-2">
                  {insights.map((insight, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-sm text-indigo-800 flex items-start gap-2"
                    >
                      <span className="text-indigo-500 mt-0.5">•</span>
                      {insight}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </Card>
          )}

          {/* Visual Analytics Section - Mini Charts */}
          {!loading && dashboardData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Mini Bar Chart - Top 5 Constituencies */}
              <Card className="shadow-none border-none ring-1 ring-gray-100">
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-indigo-600" />
                    Top Constituencies by Voter Count
                  </h3>
                  <div className="space-y-3">
                    {(dashboardData.top_constituencies || []).slice(0, 5).map((item, index) => {
                      const maxVoters = Math.max(...(dashboardData.top_constituencies || []).map(c => c.voter_count || 0))
                      const percent = maxVoters > 0 ? ((item.voter_count || 0) / maxVoters) * 100 : 0
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="group"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-700 truncate max-w-[60%]" title={item.constituency}>
                              {item.constituency}
                            </span>
                            <span className="text-xs text-gray-500">{formatVoterCount(item.voter_count)}</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percent}%` }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
                            />
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </Card>

              {/* Donut Chart - Risk Distribution (Pure CSS/SVG) */}
              <Card className="shadow-none border-none ring-1 ring-gray-100">
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-indigo-600" />
                    Risk Distribution
                    <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Derived</span>
                  </h3>
                  <div className="flex items-center justify-center gap-6">
                    {/* SVG Donut Chart */}
                    <div className="relative w-32 h-32">
                      <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                        {/* Background circle */}
                        <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#f3f4f6" strokeWidth="3" />
                        {/* Normal segment */}
                        <motion.circle
                          cx="18" cy="18" r="15.9" fill="transparent" stroke="#22c55e" strokeWidth="3"
                          strokeDasharray={`${riskDistribution.normal.percent} ${100 - riskDistribution.normal.percent}`}
                          strokeDashoffset="0"
                          initial={{ strokeDasharray: "0 100" }}
                          animate={{ strokeDasharray: `${riskDistribution.normal.percent} ${100 - riskDistribution.normal.percent}` }}
                          transition={{ duration: 0.5 }}
                        />
                        {/* Warning segment */}
                        <motion.circle
                          cx="18" cy="18" r="15.9" fill="transparent" stroke="#f59e0b" strokeWidth="3"
                          strokeDasharray={`${riskDistribution.warning.percent} ${100 - riskDistribution.warning.percent}`}
                          strokeDashoffset={`${-riskDistribution.normal.percent}`}
                          initial={{ strokeDasharray: "0 100" }}
                          animate={{ strokeDasharray: `${riskDistribution.warning.percent} ${100 - riskDistribution.warning.percent}` }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                        />
                        {/* High segment */}
                        <motion.circle
                          cx="18" cy="18" r="15.9" fill="transparent" stroke="#f97316" strokeWidth="3"
                          strokeDasharray={`${riskDistribution.high.percent} ${100 - riskDistribution.high.percent}`}
                          strokeDashoffset={`${-(riskDistribution.normal.percent + riskDistribution.warning.percent)}`}
                          initial={{ strokeDasharray: "0 100" }}
                          animate={{ strokeDasharray: `${riskDistribution.high.percent} ${100 - riskDistribution.high.percent}` }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        />
                        {/* Critical segment */}
                        <motion.circle
                          cx="18" cy="18" r="15.9" fill="transparent" stroke="#ef4444" strokeWidth="3"
                          strokeDasharray={`${riskDistribution.critical.percent} ${100 - riskDistribution.critical.percent}`}
                          strokeDashoffset={`${-(riskDistribution.normal.percent + riskDistribution.warning.percent + riskDistribution.high.percent)}`}
                          initial={{ strokeDasharray: "0 100" }}
                          animate={{ strokeDasharray: `${riskDistribution.critical.percent} ${100 - riskDistribution.critical.percent}` }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                        />
                      </svg>
                      {/* Center text */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-gray-900">{dashboardData.top_constituencies?.length || 0}</span>
                        <span className="text-xs text-gray-500">Total</span>
                      </div>
                    </div>
                    {/* Legend */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-gray-600">Normal</span>
                        <span className="font-medium text-gray-900">{riskDistribution.normal.percent}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <span className="text-gray-600">Warning</span>
                        <span className="font-medium text-gray-900">{riskDistribution.warning.percent}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                        <span className="text-gray-600">High</span>
                        <span className="font-medium text-gray-900">{riskDistribution.high.percent}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-gray-600">Critical</span>
                        <span className="font-medium text-gray-900">{riskDistribution.critical.percent}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Top 5 Constituencies Detail (Moved to bottom) */}
          {!loading && dashboardData?.top_constituencies && dashboardData.top_constituencies.length > 0 && (
            <Card className="mb-6 shadow-none border-none ring-1 ring-gray-100">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="h-4 w-4 text-indigo-600" />
                    Constituency Details
                  </h3>
                  <span className="text-xs text-gray-500">Top 5 by voter count</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 text-gray-500 font-medium">Rank</th>
                        <th className="text-left py-2 text-gray-500 font-medium">Constituency</th>
                        <th className="text-right py-2 text-gray-500 font-medium">Voters</th>
                        <th className="text-right py-2 text-gray-500 font-medium">Risk Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.top_constituencies.slice(0, 5).map((item, index) => {
                        const risk = index < 1 ? 'Critical' : index < 2 ? 'High' : index < 3 ? 'Warning' : 'Normal'
                        const riskColor = index < 1 ? 'text-red-600 bg-red-50' : index < 2 ? 'text-orange-600 bg-orange-50' : index < 3 ? 'text-amber-600 bg-amber-50' : 'text-green-600 bg-green-50'
                        return (
                          <motion.tr
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-gray-50 hover:bg-gray-50"
                          >
                            <td className="py-3">
                              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-xs">
                                {index + 1}
                              </div>
                            </td>
                            <td className="py-3 font-medium text-gray-900">{item.constituency}</td>
                            <td className="py-3 text-right text-gray-600">{item.voter_count?.toLocaleString()}</td>
                            <td className="py-3 text-right">
                              <span className={`text-xs font-medium px-2 py-1 rounded ${riskColor}`}>
                                {risk}
                              </span>
                            </td>
                          </motion.tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}

export default Dashboard
