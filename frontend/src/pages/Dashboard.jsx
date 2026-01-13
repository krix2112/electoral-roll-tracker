import { useState, useEffect, useMemo } from 'react'
import { getDashboardStats, getDashboardAggregation } from '../services/api'
import { Card, CardContent } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { Button } from '../components/ui/Button'
import { Link } from 'react-router-dom'
import {
  Users, AlertTriangle, FileText, ChevronLeft, Bell, Search,
  RotateCcw, SlidersHorizontal, Play, Pause, ChevronDown, FileSearch, Loader2, Upload
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'

function Dashboard() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [timelineProgress, setTimelineProgress] = useState(100) // 0 to 100

  // Real stats from backend
  const [stats, setStats] = useState({
    voters: { value: 'Loading...', change: '...', trend: 'neutral' },
    anomalies: { value: '0', type: 'normal' },
    audits: { value: '0', type: 'info' }
  })

  // Dashboard Aggregation Data
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filter States
  const [showAnomaliesOnly, setShowAnomaliesOnly] = useState(false)
  const [anomalyThreshold, setAnomalyThreshold] = useState(0)
  const [selectedState, setSelectedState] = useState('ALL')

  // Map Data (Constituencies)
  // We generate this once so it doesn't change on every render
  const mapPoints = useMemo(() => {
    const points = []
    // Define rough bounding boxes for points to fall within India's shape 
    // to avoid them floating in the ocean
    const regions = [
      { topMin: 10, topMax: 30, leftMin: 20, leftMax: 45 }, // North
      { topMin: 30, topMax: 50, leftMin: 15, leftMax: 50 }, // Central/West
      { topMin: 30, topMax: 50, leftMin: 50, leftMax: 70 }, // East
      { topMin: 50, topMax: 80, leftMin: 30, leftMax: 55 }, // South
    ]

    for (let i = 0; i < 40; i++) {
      const region = regions[Math.floor(Math.random() * regions.length)];
      points.push({
        id: i,
        // Random positions within the selected region
        top: Math.floor(Math.random() * (region.topMax - region.topMin)) + region.topMin + '%',
        left: Math.floor(Math.random() * (region.leftMax - region.leftMin)) + region.leftMin + '%',
        anomalyScore: Math.floor(Math.random() * 100), // 0 to 100
        discoveryTime: Math.floor(Math.random() * 100), // When this anomaly appeared on timeline (0-100)
        name: `Constituency ${i + 1}`
      })
    }
    return points.sort((a, b) => a.discoveryTime - b.discoveryTime)
  }, [])

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

  // Keep existing stats fetch for backward compatibility
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats(selectedState === 'ALL' ? 'All States' : selectedState)
        setStats(data)
      } catch (error) {
        console.error("Failed to load dashboard stats", error)
        setStats(prev => ({
          ...prev,
          voters: { value: 'Error', change: '-', trend: 'neutral' }
        }))
      }
    }
    fetchStats()
  }, [selectedState])

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
    return `${months[index]} 2024`
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
          {/* Dashboard Aggregation Section */}
          <Card className="mb-6 shadow-none border-none ring-1 ring-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">National Voter Statistics</h2>
              <p className="text-sm text-gray-500 mt-1">Aggregated data from national electoral roll</p>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                  <span className="ml-3 text-gray-600">Loading dashboard data...</span>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">Error loading data</span>
                  </div>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              ) : dashboardData ? (
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-indigo-600 mb-1">Total Voters</p>
                      <p className="text-2xl font-bold text-indigo-900">
                        {dashboardData.total_voters?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-green-600 mb-1">Constituencies</p>
                      <p className="text-2xl font-bold text-green-900">
                        {dashboardData.constituencies_count || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-blue-600 mb-1">States</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {dashboardData.states_count || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Top Constituencies */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Top 5 Constituencies by Voter Count</h3>
                    {dashboardData.top_constituencies && dashboardData.top_constituencies.length > 0 ? (
                      <div className="space-y-2">
                        {dashboardData.top_constituencies.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
                                {index + 1}
                              </div>
                              <span className="font-medium text-gray-900">{item.constituency}</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-700">
                              {item.voter_count?.toLocaleString() || 'N/A'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No constituency data available</p>
                    )}
                  </div>

                  {/* Filter Info */}
                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                    Filter: <span className="font-medium text-gray-700">{dashboardData.filter_applied || 'ALL'}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No data available
                </div>
              )}
            </div>
          </Card>

          {/* Top Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <StatCard className="shadow-none border-none ring-1 ring-gray-100">
              <CardContent className="p-6 flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Registered Voters</p>
                  <h3 className="text-3xl font-bold text-gray-900">{stats.voters.value}</h3>
                  <p className="text-sm text-red-500 mt-1 font-medium flex items-center">
                    {/* Mock trend for now */}
                    ↘ -2.3%
                  </p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                  <Users className="h-6 w-6" />
                </div>
              </CardContent>
            </StatCard>

            <StatCard className="shadow-none border-none ring-1 ring-gray-100">
              <CardContent className="p-6 flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Anomalies Detected</p>
                  <h3 className="text-3xl font-bold text-gray-900">{stats.anomalies.value}</h3>
                </div>
                <div className="p-3 bg-red-50 rounded-lg text-red-600">
                  <AlertTriangle className="h-6 w-6" />
                </div>
              </CardContent>
            </StatCard>

            <StatCard className="shadow-none border-none ring-1 ring-gray-100">
              <CardContent className="p-6 flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Audits Required</p>
                  <h3 className="text-3xl font-bold text-gray-900">{stats.audits.value}</h3>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
                  <FileText className="h-6 w-6" />
                </div>
              </CardContent>
            </StatCard>
          </div>

          {/* Map Area */}
          <Card className="flex-1 min-h-[500px] shadow-none border-none ring-1 ring-gray-100 flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Constituency Anomaly Map</h2>
                <div className="flex gap-4 mt-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-600">Normal (0-30)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-gray-600">Warning (31-70)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-gray-600">High (71-85)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-gray-600">Critical (86-100)</span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Showing {filteredPoints.length} constituencies
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
                        transition={{ duration: 0.3 }}
                        className="absolute"
                        style={{ top: point.top, left: point.left }}
                      >
                        <div className={`group relative -translate-x-1/2 -translate-y-1/2`}> {/* Centered pin */}
                          <div className={`w-3 h-3 ${getPointColor(point.anomalyScore)} rounded-full shadow-lg cursor-pointer hover:scale-150 transition-transform duration-200 ring-2 ring-white`}></div>

                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20">
                            {point.name} (Score: {point.anomalyScore})
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Time Travel Section */}
            <div className="p-6 border-t border-gray-100 bg-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Time Travel</h3>
                  <p className="text-sm text-gray-500">Explore voter roll changes over time</p>
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
                <span>Jan 2024</span>
                <span>Jun 2024</span>
                <span>Dec 2024</span>
              </div>
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
