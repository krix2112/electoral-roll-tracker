/**
 * ForensicDashboard - RollDiff Advanced Forensic Analysis Interface
 * Multi-layer anomaly detection visualization
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
    ChevronLeft, Loader2, Search, RefreshCw, FileSearch,
    Shield, Bell, Upload
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { ForensicScoreGauge } from '../components/ForensicScoreGauge'
import { ModuleBreakdownPanel } from '../components/ModuleBreakdownPanel'
import { ForensicEvidenceCards } from '../components/ForensicEvidenceCards'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export default function ForensicDashboard() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [forensicData, setForensicData] = useState(null)
    const [investigating, setInvestigating] = useState(false)

    // Auto-load demo data on mount
    useEffect(() => {
        loadTopAnomaly()
    }, [])

    const loadTopAnomaly = async () => {
        setInvestigating(true)
        setError(null)

        try {
            const response = await fetch(`${API_BASE}/api/top-anomaly`)
            if (!response.ok) throw new Error('Failed to fetch top anomaly')

            const data = await response.json()
            setForensicData(data)
        } catch (err) {
            console.error('Error loading top anomaly:', err)
            setError(err.message)
        } finally {
            setInvestigating(false)
        }
    }

    const runAnalysis = async (currentUploadId, previousUploadId = null) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`${API_BASE}/api/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    current_upload_id: currentUploadId,
                    previous_upload_id: previousUploadId
                })
            })

            if (!response.ok) throw new Error('Analysis failed')

            const data = await response.json()
            setForensicData(data)
        } catch (err) {
            console.error('Analysis error:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/dashboard" className="text-gray-500 hover:text-gray-900 flex items-center gap-2">
                            <ChevronLeft className="h-5 w-5" />
                            <span className="font-medium">Back to Dashboard</span>
                        </Link>
                        <div className="h-6 w-px bg-gray-200 mx-2"></div>
                        <div className="flex items-center gap-3">
                            <Shield className="h-8 w-8 text-indigo-600" />
                            <div>
                                <h1 className="font-bold text-gray-900 leading-none">RollDiff Forensic System</h1>
                                <p className="text-[10px] text-gray-500 font-medium">Advanced Multi-Layer Anomaly Detection</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            onClick={loadTopAnomaly}
                            disabled={investigating}
                            size="sm"
                            variant="outline"
                            className="gap-2"
                        >
                            {investigating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Search className="h-4 w-4" />
                            )}
                            Investigate Top Anomaly
                        </Button>
                        <Link to="/notifications" className="relative p-2 rounded-full hover:bg-gray-50 text-gray-500 hover:text-indigo-600 transition-colors">
                            <Bell className="w-5 h-5" />
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

            {/* Main Content */}
            <main className="max-w-7xl mx-auto p-6">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
                    >
                        <strong>Error:</strong> {error}
                    </motion.div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
                            <p className="text-gray-600">Running forensic analysis...</p>
                        </div>
                    </div>
                ) : forensicData ? (
                    <div className="space-y-6">
                        {/* Header Info */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {forensicData.constituency || 'Constituency Analysis'}
                                    </h2>
                                    <p className="text-gray-500 mt-1">
                                        {forensicData.state || 'State'} • Analysis ID: {forensicData.analysis_id?.substring(0, 16)}...
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-500">Timestamp</div>
                                    <div className="font-medium text-gray-900">
                                        {forensicData.timestamp ? new Date(forensicData.timestamp).toLocaleString() : 'Just now'}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Main Score & Breakdown Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Central Score Gauge */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Card className="p-8 bg-white shadow-xl border-none ring-1 ring-gray-100 flex flex-col items-center justify-center h-full">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
                                        Final Anomaly Score
                                    </h3>
                                    <ForensicScoreGauge
                                        score={forensicData.final_anomaly_score || 0}
                                        verdict={forensicData.verdict}
                                        confidenceLevel={forensicData.confidence_level}
                                        size="lg"
                                    />

                                    {/* Summary */}
                                    <div className="mt-6 text-center max-w-md">
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {forensicData.summary || 'Analysis complete.'}
                                        </p>
                                    </div>
                                </Card>
                            </motion.div>

                            {/* Module Breakdown */}
                            <div className="lg:col-span-2">
                                <ModuleBreakdownPanel modules={forensicData.module_breakdowns || []} />
                            </div>
                        </div>

                        {/* Evidence Section */}
                        {forensicData.all_evidence && forensicData.all_evidence.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <div className="mb-4">
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <FileSearch className="h-6 w-6 text-indigo-600" />
                                        Forensic Evidence ({forensicData.all_evidence.length})
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Key indicators detected across all analysis modules
                                    </p>
                                </div>
                                <ForensicEvidenceCards evidence={forensicData.all_evidence} />
                            </motion.div>
                        )}

                        {/* Triggered Modules Highlight */}
                        {forensicData.triggered_modules && forensicData.triggered_modules.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <Card className="p-6 bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
                                    <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        High-Alert Modules
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {forensicData.triggered_modules.map((module, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium"
                                            >
                                                {module}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-sm text-red-700 mt-3">
                                        These modules detected scores above 50, indicating significant anomalies.
                                    </p>
                                </Card>
                            </motion.div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Analysis Data</h3>
                        <p className="text-gray-500 mb-6">
                            Click "Investigate Top Anomaly" to load forensic analysis
                        </p>
                        <Button onClick={loadTopAnomaly} className="gap-2">
                            <Search className="h-4 w-4" />
                            Load Analysis
                        </Button>
                    </div>
                )}
            </main>
        </div>
    )
}
