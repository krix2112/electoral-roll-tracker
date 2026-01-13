import { useState, useEffect } from 'react'
import { getUploads } from '../services/api'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Link } from 'react-router-dom'
import {
  Users, AlertTriangle, FileText, ChevronLeft, Bell, Search,
  RotateCcw, SlidersHorizontal, Play, Pause, ChevronDown
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '../lib/utils'

function Dashboard() {
  const [isPlaying, setIsPlaying] = useState(false)

  // Mock data to match the UI visual until real backend data is fully wired for this view
  const stats = {
    voters: { value: '6.2M', change: '-2.3%', trend: 'down' },
    anomalies: { value: '9', type: 'critical' },
    audits: { value: '4', type: 'pending' }
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
            <div className="bg-indigo-700 text-white font-bold p-1.5 rounded text-lg">RD</div>
            <div>
              <h1 className="font-bold text-gray-900 leading-none">RollDiff</h1>
              <p className="text-[10px] text-gray-500 font-medium">Electoral Roll Forensic Audit System</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium text-sm">
                A
              </div>
              <span className="text-sm font-medium text-gray-700">Admin</span>
            </div>
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
            <button className="text-xs text-indigo-600 font-medium hover:underline flex items-center gap-1">
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <input type="checkbox" id="anomalies" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <label htmlFor="anomalies" className="text-sm font-medium text-gray-700">Show Anomalies Only</label>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">State / UT</label>
              <div className="relative">
                <select className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5">
                  <option>All States</option>
                  <option>Maharashtra</option>
                  <option>Delhi</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">Anomaly Score Threshold</label>
                <span className="text-xs text-indigo-600 font-medium">0+</span>
              </div>
              <input type="range" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
              <div className="flex justify-between text-xs text-gray-400">
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total States</span>
                  <span className="font-medium text-gray-900">10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Constituencies</span>
                  <span className="font-medium text-gray-900">21</span>
                </div>
                <div className="pt-4">
                  <span className="text-xs text-gray-400">Last updated</span>
                  <div className="text-sm font-medium text-gray-900">2 hours ago</div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Top Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="shadow-none border-none ring-1 ring-gray-100">
              <CardContent className="p-6 flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Registered Voters</p>
                  <h3 className="text-3xl font-bold text-gray-900">{stats.voters.value}</h3>
                  <p className="text-sm text-red-500 mt-1 font-medium flex items-center">
                    ↘ {stats.voters.change}
                  </p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                  <Users className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-none border-none ring-1 ring-gray-100">
              <CardContent className="p-6 flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Anomalies Detected</p>
                  <h3 className="text-3xl font-bold text-gray-900">{stats.anomalies.value}</h3>
                </div>
                <div className="p-3 bg-red-50 rounded-lg text-red-600">
                  <AlertTriangle className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-none border-none ring-1 ring-gray-100">
              <CardContent className="p-6 flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Audits Required</p>
                  <h3 className="text-3xl font-bold text-gray-900">{stats.audits.value}</h3>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
                  <FileText className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map Area */}
          <Card className="flex-1 min-h-[500px] shadow-none border-none ring-1 ring-gray-100 flex flex-col">
            <div className="p-6 border-b border-gray-100">
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

            <div className="flex-1 bg-white relative flex items-center justify-center p-8 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
              {/* Abstract India Map Shape Placeholder - using SVG for a clean look */}
              <svg viewBox="0 0 400 500" className="h-full w-auto opacity-10 absolute pointer-events-none">
                <path d="M200,10 C250,50 350,150 350,300 C350,450 200,490 200,490 C200,490 50,450 50,300 C50,150 150,50 200,10 Z" fill="#94a3b8" />
              </svg>

              {/* Mock Data Points */}
              <div className="relative w-[300px] h-[400px]">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}
                  className="absolute top-[30%] left-[40%] text-center"
                >
                  <div className="w-4 h-4 bg-red-500 rounded-full shadow-lg ring-4 ring-red-500/20 cursor-pointer hover:scale-125 transition"></div>
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 hover:opacity-100">Constituency 1</div>
                </motion.div>

                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}
                  className="absolute top-[45%] left-[60%] w-3 h-3 bg-amber-500 rounded-full shadow-lg cursor-pointer hover:scale-125 transition" />
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }}
                  className="absolute top-[60%] left-[30%] w-3 h-3 bg-green-500 rounded-full shadow-lg cursor-pointer hover:scale-125 transition" />
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }}
                  className="absolute top-[25%] left-[55%] w-3 h-3 bg-orange-500 rounded-full shadow-lg cursor-pointer hover:scale-125 transition" />
              </div>
            </div>

            {/* Time Travel Section */}
            <div className="p-6 border-t border-gray-100 bg-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Time Travel</h3>
                  <p className="text-sm text-gray-500">Explore voter roll changes over time</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
              </div>

              <div className="text-center mb-2">
                <span className="text-2xl font-bold text-indigo-700">Dec 2024</span>
                <p className="text-xs text-gray-500">100% of timeline</p>
              </div>

              <div className="relative h-2 bg-gray-100 rounded-full mb-6">
                <div className="absolute left-0 top-0 h-full w-full bg-gradient-to-r from-green-400 via-amber-400 to-red-500 rounded-full opacity-20"></div>
                <div className="absolute left-0 top-0 h-full w-full bg-indigo-900 rounded-full origin-left transform" style={{ transform: 'scaleX(1)' }}></div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 bg-indigo-600 rounded-full border-2 border-white shadow hover:scale-110 cursor-pointer"></div>
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
