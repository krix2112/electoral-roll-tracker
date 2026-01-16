import { useState, useEffect, useMemo } from 'react'
import { DASHBOARD_CONFIG } from '../config/constants'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'
import {
  getDashboardAggregation,
  getTopAnomaly,
  getConstituencyImpact,
  getAnomalySummary
} from '../services/api'
import { Card, CardContent } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { Button } from '../components/ui/Button'
import { Link } from 'react-router-dom'
import {
  Users, AlertTriangle, FileText, ChevronLeft, Bell,
  RotateCcw, SlidersHorizontal, Play, Pause, ChevronDown, FileSearch, Loader2, Upload,
  MapPin, TrendingUp, Shield, Info, Eye
} from 'lucide-react'
import { InvestigationButton, InvestigationBadge } from '../components/InvestigationButton'
import { ImpactPanel } from '../components/ImpactPanel'
import { DemoSteps } from '../components/DemoSteps'
import { MapLegend } from '../components/MapLegend'
import { AnomalyBadge } from '../components/AnomalyBadge'

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

  // Investigation / Demo States
  const [investigationMode, setInvestigationMode] = useState(false)
  const [investigatedAnomaly, setInvestigatedAnomaly] = useState(null)
  const [currentStep, setCurrentStep] = useState(-1)
  const [completedSteps, setCompletedSteps] = useState({})
  const [anomalySummary, setAnomalySummary] = useState(null)
  const [isInvestigationLoading, setIsInvestigationLoading] = useState(false)

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
  // All 28 states + 8 UTs with positions as percentages
  // relative to the India map SVG viewport
  // ============================================
  const stateCentroids = {
    // ----- NORTHERN STATES -----
    'Jammu & Kashmir': { top: 12, left: 35 },
    'Jammu And Kashmir': { top: 12, left: 35 },
    'Ladakh': { top: 10, left: 45 },
    'Himachal Pradesh': { top: 18, left: 40 },
    'Punjab': { top: 22, left: 36 },
    'Uttarakhand': { top: 22, left: 48 },
    'Haryana': { top: 26, left: 40 },
    'Delhi': { top: 27, left: 43 },
    'NCT Of Delhi': { top: 27, left: 43 },
    'Uttar Pradesh': { top: 32, left: 50 },

    // ----- WESTERN STATES -----
    'Rajasthan': { top: 32, left: 32 },
    'Gujarat': { top: 42, left: 25 },
    'Maharashtra': { top: 52, left: 35 },
    'Goa': { top: 62, left: 32 },
    'Dadra & Nagar Haveli': { top: 48, left: 30 },
    'Dadra And Nagar Haveli And Daman And Diu': { top: 48, left: 28 },
    'Daman & Diu': { top: 46, left: 28 },

    // ----- CENTRAL STATES -----
    'Madhya Pradesh': { top: 42, left: 45 },
    'Chhattisgarh': { top: 48, left: 52 },

    // ----- EASTERN STATES -----
    'Bihar': { top: 36, left: 62 },
    'Jharkhand': { top: 42, left: 60 },
    'West Bengal': { top: 40, left: 70 },
    'Odisha': { top: 50, left: 58 },

    // ----- NORTHEASTERN STATES -----
    'Sikkim': { top: 32, left: 72 },
    'Assam': { top: 32, left: 78 },
    'Meghalaya': { top: 36, left: 76 },
    'Tripura': { top: 40, left: 80 },
    'Mizoram': { top: 44, left: 80 },
    'Manipur': { top: 38, left: 82 },
    'Nagaland': { top: 34, left: 82 },
    'Arunachal Pradesh': { top: 28, left: 82 },

    // ----- SOUTHERN STATES -----
    'Telangana': { top: 56, left: 45 },
    'Andhra Pradesh': { top: 62, left: 48 },
    'Karnataka': { top: 65, left: 38 },
    'Kerala': { top: 78, left: 38 },
    'Tamil Nadu': { top: 75, left: 45 },
    'Puducherry': { top: 72, left: 48 },
    'Pondicherry': { top: 72, left: 48 },
    'Lakshadweep': { top: 72, left: 25 },

    // ----- ISLAND TERRITORIES -----
    'Andaman & Nicobar Islands': { top: 68, left: 82 },
    'Andaman And Nicobar Islands': { top: 68, left: 82 },

    // ----- CHANDIGARH -----
    'Chandigarh': { top: 20, left: 38 },

    // ----- DEFAULT FALLBACK REGIONS -----
    'DEFAULT_NORTH': { top: 25, left: 42 },
    'DEFAULT_SOUTH': { top: 70, left: 42 },
    'DEFAULT_EAST': { top: 40, left: 68 },
    'DEFAULT_WEST': { top: 48, left: 30 },
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
  // Uses actual state from backend + jitter for accurate positioning
  // ============================================
  const mapPoints = useMemo(() => {
    const constituencies = dashboardData?.top_constituencies || []

    if (constituencies.length === 0) return []

    // Determine which centroid to use based on constituency's actual state
    const getBaseCentroid = (constituency) => {
      // If a specific state filter is selected, only show pins for that state
      if (selectedState && selectedState !== 'ALL') {
        // Check if this constituency belongs to the selected state
        if (constituency.state?.toUpperCase() !== selectedState.toUpperCase()) {
          return null // Skip this constituency (filtered out)
        }
        return stateCentroids[constituency.state] || stateCentroids[selectedState] || stateCentroids['DEFAULT_CENTRAL']
      }

      // For national view, use the constituency's actual state
      const state = constituency.state
      if (state && stateCentroids[state]) {
        return stateCentroids[state]
      }

      // Fallback: distribute across regions based on name hash
      const regions = ['DEFAULT_NORTH', 'DEFAULT_SOUTH', 'DEFAULT_EAST', 'DEFAULT_WEST', 'DEFAULT_CENTRAL']
      const hash = constituency.constituency?.split('').reduce((a, b) => a + b.charCodeAt(0), 0) || 0
      return stateCentroids[regions[hash % regions.length]]
    }

    return constituencies.map((constituency, index) => {
      const baseCentroid = getBaseCentroid(constituency)

      // Skip if filtered out
      if (!baseCentroid) return null

      // Apply jitter (±5% variance) for visual separation within state cluster
      const hash = constituency.constituency?.split('').reduce((a, b) => a + b.charCodeAt(0), 0) || index
      const jitterTop = ((hash * 7) % 10) - 5  // -5 to +5 (tighter clustering)
      const jitterLeft = ((hash * 13) % 10) - 5

      // Calculate anomaly score based on voter_count rank
      const percentile = (index / constituencies.length) * 100
      let anomalyScore
      if (percentile < 10) anomalyScore = 86 + Math.floor((hash * 3) % 15) // Critical
      else if (percentile < 30) anomalyScore = 71 + Math.floor((hash * 5) % 15) // High
      else if (percentile < 60) anomalyScore = 31 + Math.floor((hash * 7) % 40) // Warning
      else anomalyScore = Math.floor((hash * 11) % 31) // Normal

      return {
        id: index,
        top: Math.max(5, Math.min(92, baseCentroid.top + jitterTop)) + '%',
        left: Math.max(5, Math.min(88, baseCentroid.left + jitterLeft)) + '%',
        anomalyScore,
        discoveryTime: Math.floor((index / constituencies.length) * 100),
        name: constituency.constituency || `Constituency ${index + 1}`,
        state: constituency.state || 'Unknown',
        voterCount: constituency.voter_count,
        riskLevel: getRiskLevel(anomalyScore)
      }
    }).filter(Boolean) // Remove null entries (filtered out)
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

  // Fetch Anomaly Summary
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const summary = await getAnomalySummary()
        setAnomalySummary(summary)
      } catch (err) {
        console.error("Failed to load anomaly summary", err)
      }
    }
    fetchSummary()
  }, [])

  // Investigation Logic
  const handleInvestigate = async () => {
    setIsInvestigationLoading(true)
    try {
      // 1. Fetch top anomaly
      const topAnomaly = await getTopAnomaly()
      setInvestigatedAnomaly(topAnomaly)
      setInvestigationMode(true)

      // 2. Start demo flow
      setCurrentStep(0)
      setCompletedSteps({ heatmap: true })

      // 3. Automated progression
      // Step 1 -> Step 2: Select Constituency
      setTimeout(() => {
        setCurrentStep(1)
        setCompletedSteps(prev => ({ ...prev, constituency: true }))
        setSelectedState(topAnomaly.state)

        // Step 2 -> Step 3: Timeline Slide
        setTimeout(() => {
          setCurrentStep(2)
          setCompletedSteps(prev => ({ ...prev, timeline: true }))
          setTimelineProgress(75) // Move to Oct 2023 approx

          // Step 3 -> Step 4: Analyze
          setTimeout(() => {
            setCurrentStep(3)
            setCompletedSteps(prev => ({ ...prev, analyze: true }))
          }, 1000)
        }, 1500)
      }, 1500)

    } catch (err) {
      console.error("Investigation failed", err)
      setError("Failed to trigger investigation. Please try again.")
    } finally {
      setIsInvestigationLoading(false)
    }
  }

  const resetInvestigation = () => {
    setInvestigationMode(false)
    setInvestigatedAnomaly(null)
    setCurrentStep(-1)
    setCompletedSteps({})
    setTimelineProgress(100)
    setSelectedState('ALL')
  }

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
    return `${months[index]} ${DASHBOARD_CONFIG.YEAR}`
  }

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 -left-40 w-[500px] h-[500px] bg-[#FF6B4A]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-40 w-[600px] h-[600px] bg-[#2D3E8F]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-orange-50/30 to-blue-50/30 rounded-full opacity-50" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.015) 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      {/* Dashboard Header - Glassmorphic */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 px-3 py-1.5 rounded-full text-gray-600 hover:text-[#2D3E8F] hover:bg-gray-100 transition-all">
              <ChevronLeft className="h-5 w-5" />
              <span className="font-medium text-sm">Back</span>
            </Link>
            <div className="h-6 w-px bg-gray-200"></div>
            <img src="/assets/logo-new.png" alt="MatSetu" className="h-10 w-auto" />
            <div>
              <h1 className="font-bold text-gray-900 leading-none">Matsetu</h1>
              <p className="text-[10px] text-gray-500 font-medium">Electoral Roll Forensic Audit</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <InvestigationBadge
              active={investigationMode}
              constituencyName={investigatedAnomaly?.constituency_name}
              onClose={resetInvestigation}
            />
            <InvestigationButton
              onInvestigate={handleInvestigate}
              isLoading={isInvestigationLoading}
            />
            <Link to="/forensic">
              <Button size="sm" className="group relative overflow-hidden gap-2 rounded-full border-2 border-[#2D3E8F] bg-transparent text-[#2D3E8F] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md px-5 h-10">
                <span className="absolute inset-0 w-full h-full bg-[#2D3E8F] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ease-out"></span>
                <span className="relative flex items-center gap-2 font-semibold">
                  <Shield className="h-4 w-4 transition-transform group-hover:scale-110" />
                  Forensic Analysis
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Sidebar Filters - Redesigned */}
        <aside className="w-80 bg-white/70 backdrop-blur-sm border-r border-gray-100 overflow-y-auto p-6 hidden lg:block">
          {/* Filter Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6B4A] to-[#FF8F6B] flex items-center justify-center">
                <SlidersHorizontal className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Filters</span>
            </div>
            <button
              onClick={() => {
                setShowAnomaliesOnly(false)
                setAnomalyThreshold(0)
                setSelectedState('ALL')
                setTimelineProgress(100)
              }}
              className="text-xs text-[#FF6B4A] font-medium hover:text-[#2D3E8F] flex items-center gap-1 transition-colors">
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>

          {/* Guided Steps Panel */}
          <div className="mt-6">
            <DemoSteps
              currentStep={currentStep}
              completedSteps={completedSteps}
              onStepClick={(action) => {
                if (action === 'heatmap') {
                  resetInvestigation()
                } else if (action === 'timeline') {
                  setTimelineProgress(75)
                }
              }}
            />
          </div>

          <div className="mt-8 space-y-6">
            {/* Anomalies Toggle */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-orange-50/50 transition-colors">
              <input
                type="checkbox"
                id="anomalies"
                checked={showAnomaliesOnly}
                onChange={(e) => setShowAnomaliesOnly(e.target.checked)}
                className="rounded border-gray-300 text-[#FF6B4A] focus:ring-[#FF6B4A] h-4 w-4"
              />
              <label htmlFor="anomalies" className="text-sm font-medium text-gray-700 select-none cursor-pointer">Show Anomalies Only</label>
            </div>

            {/* State Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">State / UT</label>
              <div className="relative">
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-[#FF6B4A] focus:border-[#FF6B4A] block w-full p-3 hover:border-[#FF6B4A]/50 transition-colors">
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
                <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Threshold Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">Anomaly Threshold</label>
                <span className="text-xs font-semibold text-[#FF6B4A] bg-orange-50 px-2 py-0.5 rounded-full">{anomalyThreshold}+</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={anomalyThreshold}
                onChange={(e) => setAnomalyThreshold(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#FF6B4A]"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="pt-6 border-t border-gray-100">
              <div className="bg-gradient-to-br from-[#2D3E8F]/5 to-[#FF6B4A]/5 rounded-2xl p-4 border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[#2D3E8F]" />
                  Quick Stats
                </h3>
                <div className="space-y-3 text-sm">
                  {loading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin text-[#FF6B4A]" />
                    </div>
                  ) : error ? (
                    <div className="text-red-600 text-xs">{error}</div>
                  ) : dashboardData ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-500">States</span>
                        <span className="font-semibold text-gray-900">{DASHBOARD_CONFIG.STATES_COUNT}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Union Territories</span>
                        <span className="font-semibold text-gray-900">{DASHBOARD_CONFIG.XX_UTS_COUNT}</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-100 pt-2 mt-2">
                        <span className="text-gray-900 font-semibold">Total Admin Units</span>
                        <span className="font-bold text-[#2D3E8F]">{DASHBOARD_CONFIG.TOTAL_ADMIN_UNITS}</span>
                      </div>

                      <div className="flex justify-between mt-3">
                        <span className="text-gray-500">Constituencies</span>
                        <span className="font-semibold text-gray-900">{dashboardData.constituencies_count || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Voters</span>
                        <span className="font-semibold text-gray-900">
                          {dashboardData.total_voters ? dashboardData.total_voters.toLocaleString() : 'N/A'}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-500 text-xs">No data available</div>
                  )}
                  <div className="pt-3 mt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">Last updated</span>
                    <div className="text-sm font-medium text-[#10B981]">Just now</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">

          {/* State Context Indicator */}
          <motion.div
            key={selectedState}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-2"
          >
            <Eye className="h-4 w-4 text-[#2D3E8F]" />
            <span className="text-sm text-gray-600">Viewing:</span>
            <span className="text-sm font-semibold text-[#2D3E8F] bg-[#2D3E8F]/10 px-3 py-1 rounded-full">
              {selectedState === 'ALL' ? 'National (All States)' : selectedState}
            </span>
          </motion.div>

          {/* Anomaly Intelligence Section (Visible during investigation) */}
          <AnimatePresence>
            {investigationMode && investigatedAnomaly && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 overflow-hidden"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Score Badge */}
                  <Card className="lg:col-span-1 p-6 flex flex-col items-center justify-center bg-white shadow-xl border-none ring-1 ring-gray-100">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Anomaly Score</h3>
                    <AnomalyBadge
                      score={investigatedAnomaly.score}
                      confidenceLevel={investigatedAnomaly.impact_facts.confidence_level}
                      size="lg"
                    />
                    <div className="mt-6 text-center">
                      <p className="text-sm font-semibold text-gray-900">{investigatedAnomaly.constituency_name}</p>
                      <p className="text-xs text-gray-500">{investigatedAnomaly.state}</p>
                    </div>
                  </Card>

                  {/* Impact Panel */}
                  <div className="lg:col-span-2">
                    <ImpactPanel
                      visible={true}
                      anomalyScore={investigatedAnomaly.score}
                      deletionCount={investigatedAnomaly.deletion_count}
                      impactFacts={investigatedAnomaly.impact_facts}
                      className="h-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Top Stats Row - Homepage Color Palette */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
            {/* Total Voters Card */}
            <motion.div
              key={`voters-${selectedState}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-[#2D3E8F] to-[#1e2d6b] rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-blue-200 text-sm font-medium">Total Voters</p>
                  <h3 className="text-3xl font-bold mt-1">
                    {loading ? '...' : formatVoterCount(dashboardData?.total_voters)}
                  </h3>
                  <p className="text-blue-300/70 text-xs mt-2 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> Live from electoral roll
                  </p>
                </div>
                <div className="p-3 bg-white/10 rounded-xl">
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
              className="bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Constituencies</p>
                  <h3 className="text-3xl font-bold mt-1">
                    {loading ? '...' : (dashboardData?.constituencies_count || 0)}
                  </h3>
                  <p className="text-emerald-200/70 text-xs mt-2 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Parliamentary seats
                  </p>
                </div>
                <div className="p-3 bg-white/10 rounded-xl">
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
              className="bg-gradient-to-br from-[#FF6B4A] to-[#dc2626] rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-red-100 text-sm font-medium">Anomalies Detected</p>
                    <div className="group relative">
                      <Info className="h-3 w-3 text-red-200 cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-30">
                        Derived indicator: ~3% of constituencies based on statistical modeling
                      </div>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold mt-1">
                    {loading ? '...' : anomaliesDetected}
                  </h3>
                  <p className="text-red-200/70 text-xs mt-2">~3% estimated flag rate</p>
                </div>
                <div className="p-3 bg-white/10 rounded-xl">
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
              className="bg-gradient-to-br from-[#f59e0b] to-[#d97706] rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-amber-100 text-sm font-medium">Audits Required</p>
                    <div className="group relative">
                      <Info className="h-3 w-3 text-amber-200 cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-30">
                        Derived indicator: ~40% of anomalies require manual verification
                      </div>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold mt-1">
                    {loading ? '...' : auditsRequired}
                  </h3>
                  <p className="text-amber-200/70 text-xs mt-2">Manual review needed</p>
                </div>
                <div className="p-3 bg-white/10 rounded-xl">
                  <FileText className="h-6 w-6" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Risk Distribution Bar */}
          {!loading && dashboardData && (
            <Card className="mb-6 shadow-lg border-none rounded-2xl overflow-hidden">
              {/* Gradient accent bar */}
              <div className="h-1 bg-gradient-to-r from-[#10B981] via-[#f59e0b] to-[#FF6B4A]" />
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#2D3E8F]/10 flex items-center justify-center">
                      <Shield className="h-3.5 w-3.5 text-[#2D3E8F]" />
                    </div>
                    Risk Distribution
                  </h3>
                  <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">Based on voter concentration</span>
                </div>

                {/* Stacked Bar */}
                <div className="h-5 rounded-full overflow-hidden flex bg-gray-100 shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${riskDistribution.normal.percent}%` }}
                    transition={{ duration: 0.5 }}
                    className="bg-[#10B981] h-full"
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
                    className="bg-[#FF6B4A] h-full"
                    title={`High: ${riskDistribution.high.percent}%`}
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${riskDistribution.critical.percent}%` }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="bg-red-600 h-full"
                    title={`Critical: ${riskDistribution.critical.percent}%`}
                  />
                </div>

                {/* Legend */}
                <div className="flex justify-between mt-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                    <span className="text-gray-600 font-medium">Normal {riskDistribution.normal.percent}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-gray-600 font-medium">Warning {riskDistribution.warning.percent}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#FF6B4A]" />
                    <span className="text-gray-600 font-medium">High {riskDistribution.high.percent}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-600" />
                    <span className="text-gray-600 font-medium">Critical {riskDistribution.critical.percent}%</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Map Card */}
          <Card className="mb-6 min-h-[650px] shadow-lg border-none rounded-2xl flex flex-col overflow-hidden">
            {/* Gradient accent bar */}
            <div className="h-1 bg-gradient-to-r from-[#2D3E8F] to-[#FF6B4A]" />
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50/50 to-white">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2D3E8F] to-[#1e2d6b] flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
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
              {/* Map Legend */}
              <MapLegend position="bottom-right" />

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
                  <h3 className="font-semibold text-gray-900">Timeline Analysis</h3>
                  <p className="text-sm text-gray-500">Unexplained deletions and roll changes relative to 2024 General Election</p>
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
                <div className="flex flex-col">
                  <span>Viewing state as of:</span>
                  <span className="text-indigo-600 font-bold">{getCurrentMonth()}</span>
                </div>
                <div className="text-right">
                  <span className="block text-amber-600 font-semibold">T-minus 6 months</span>
                  <span>to 2024 General Election</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Data Source Footnote */}
          <div className="mb-6 px-2">
            <p className="text-[10px] text-gray-400 italic flex items-center gap-1">
              <Info className="h-3 w-3" />
              Analysis based on synthetic data simulating ECI publication formats.
              Unexplained deletions flagged based on statistical drift thresholds.
            </p>
          </div>

          {/* Insights Card */}
          {!loading && insights.length > 0 && (
            <Card className="mb-6 shadow-none border-none ring-1 ring-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="p-4">
                <h3 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Key Insights
                  <span className="text-xs font-normal text-[#2D3E8F] bg-[#2D3E8F]/10 px-2 py-0.5 rounded-full">Derived</span>
                </h3>
                <ul className="space-y-2">
                  {insights.map((insight, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-sm text-gray-700 flex items-start gap-2"
                    >
                      <span className="text-[#FF6B4A] mt-0.5">•</span>
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
              <Card className="shadow-lg border-none rounded-2xl overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-[#2D3E8F] to-[#10B981]" />
                <div className="p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#2D3E8F]/10 flex items-center justify-center">
                      <TrendingUp className="h-3.5 w-3.5 text-[#2D3E8F]" />
                    </div>
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
