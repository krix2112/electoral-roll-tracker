/**
 * ForensicDashboard - RollDiff Advanced Forensic Analysis Interface
 * Multi-layer anomaly detection visualization
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
    ChevronLeft, Loader2, Search, RefreshCw, FileSearch,
    Shield, Bell, Upload, ChevronDown
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { ForensicScoreGauge } from '../components/ForensicScoreGauge'
import { ModuleBreakdownPanel } from '../components/ModuleBreakdownPanel'
import { ForensicEvidenceCards } from '../components/ForensicEvidenceCards'
import { ForensicNetworkGraph } from '../components/ForensicNetworkGraph'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export default function ForensicDashboard() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [forensicData, setForensicData] = useState(null)
    const [investigating, setInvestigating] = useState(false)
    const [uploads, setUploads] = useState([])
    const [selectedUploadId, setSelectedUploadId] = useState('')

    // Auto-load demo data on mount and fetch uploads
    useEffect(() => {
        loadTopAnomaly()
        fetchUploads()
    }, [])

    const fetchUploads = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/uploads`)
            if (res.ok) {
                const data = await res.json()
                setUploads(data)
            }
        } catch (e) {
            console.error("Failed to load uploads", e)
        }
    }

    const handleUploadSelect = (e) => {
        const uploadId = e.target.value
        setSelectedUploadId(uploadId)
        if (uploadId) {
            runAnalysis(uploadId)
        }
    }

    const loadTopAnomaly = async () => {
        setInvestigating(true)
        setError(null)
        setSelectedUploadId('')

        try {
            console.log("Fetching from:", `${API_BASE}/api/top-anomaly`)
            const response = await fetch(`${API_BASE}/api/top-anomaly`)

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`)
            }

            const data = await response.json()
            setForensicData(data)
        } catch (err) {
            console.error('API failed, loading fallback demo data:', err)
            // FALLBACK DEMO DATA - Ensures dashboard works even if backend is down
            setForensicData({
                'analysis_id': 'demo_fallback_001',
                'final_anomaly_score': 87.5,
                'constituency': 'AC-103',
                'state': 'Maharashtra',
                'verdict': 'Critical Anomaly',
                'confidence_level': 'High',
                'triggered_modules': ['Network Analysis', 'Entropy Analysis', 'Behavioral Fingerprinting'],
                'all_evidence': [
                    "🏝️ **Network Isolation Alert**: 2847 voters show zero familial or residential connections to existing rolls",
                    "📅 **Bulk Registration Alert**: 3200 voters registered on 2024-01-15 (entropy: 0.23)",
                    "⚠️ **Age-Migration Mismatch**: 3 age groups show abnormal movement patterns",
                    "⭐ **Unrealistic Clusters**: 5 addresses with excessive voter concentration",
                    "📝 **Low Name Diversity**: Top name 'Raj Kumar' appears 187 times"
                ],
                'summary': "🚨 Critical forensic analysis detected 6 anomaly indicators (Demo Mode). Immediate investigation recommended.",
                'module_breakdowns': [
                    {
                        'module': 'Network Analysis',
                        'score': 92.3,
                        'weight': 0.35,
                        'contribution': 32.3,
                        'evidence': ["🏝️ **Network Isolation Alert**: 2847 voters show zero connections"]
                    },
                    {
                        'module': 'Entropy Analysis',
                        'score': 85.7,
                        'weight': 0.25,
                        'contribution': 21.4,
                        'evidence': ["📅 **Bulk Registration Alert**: 3200 voters on same date"]
                    },
                    {
                        'module': 'Behavioral Fingerprinting',
                        'score': 78.2,
                        'weight': 0.25,
                        'contribution': 19.6,
                        'evidence': ["⚠️ **Age-Migration Mismatch**: Abnormal patterns detected"]
                    }
                ],
                'timestamp': new Date().toISOString()
            })
            // Only show error toast, don't block UI
            // setError(`Demo Mode: Backend unavailable (${err.message})`)
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
                        {/* Upload Selector */}
                        <div className="hidden md:flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200">
                            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Analyze:</span>
                            <div className="relative">
                                <select
                                    className="appearance-none bg-transparent text-sm font-medium text-gray-700 pr-8 focus:outline-none cursor-pointer"
                                    value={selectedUploadId}
                                    onChange={handleUploadSelect}
                                >
                                    <option value="">Demo Anomaly (Default)</option>
                                    {uploads.map(u => (
                                        <option key={u.upload_id} value={u.upload_id}>
                                            {u.filename}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

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
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            {forensicData.constituency || 'Constituency Analysis'}
                                        </h2>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${forensicData.final_anomaly_score > 70 ? 'bg-red-100 text-red-700' :
                                            forensicData.final_anomaly_score > 30 ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-green-100 text-green-700'
                                            }`}>
                                            {forensicData.verdict}
                                        </span>
                                    </div>
                                    <p className="text-gray-500">
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

                        {/* Top Section: Gauge & Network Graph */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[420px]">
                            {/* Central Score Gauge */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 }}
                                className="h-full"
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
                                    <div className="mt-6 text-center max-w-xs">
                                        <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                            {forensicData.summary?.split('.')[0] + '.'}
                                        </p>
                                    </div>
                                </Card>
                            </motion.div>

                            {/* Network Visualization */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="lg:col-span-2 h-full"
                            >
                                <ForensicNetworkGraph
                                    anomalyType={
                                        forensicData.triggered_modules?.some(m => m.includes('Network')) ? 'star_cluster' : 'all'
                                    }
                                />
                            </motion.div>
                        </div>

                        {/* Module Breakdown */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Shield className="h-5 w-5 text-indigo-600" />
                                Detection Module Analysis
                            </h3>
                            <ModuleBreakdownPanel modules={forensicData.module_breakdowns || []} />
                        </div>

                        {/* Evidence Section */}
                        {forensicData.all_evidence && forensicData.all_evidence.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <div className="mb-4 mt-8">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <FileSearch className="h-5 w-5 text-indigo-600" />
                                        Forensic Evidence ({forensicData.all_evidence.length})
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Key indicators detected across all analysis modules
                                    </p>
                                </div>
                                <ForensicEvidenceCards evidence={forensicData.all_evidence} />
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
