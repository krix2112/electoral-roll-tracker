import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Users, Building2, BarChart3, TrendingDown, Info } from 'lucide-react'
import { Card } from './ui/Card'

/**
 * ImpactPanel Component
 * 
 * Displays human impact translation when anomaly score > 70.
 * Shows the real-world implications of voter deletions.
 * 
 * @param {Object} props
 * @param {number} props.anomalyScore - The current anomaly score (0-100)
 * @param {number} props.deletionCount - Number of unexplained deletions
 * @param {Object} props.impactFacts - Impact data from API
 * @param {boolean} props.visible - Whether to show the panel
 */
export function ImpactPanel({
    anomalyScore = 0,
    deletionCount = 0,
    impactFacts = {},
    visible = false,
    className = ''
}) {
    // Only show panel when anomaly score > 70
    const shouldShow = visible && anomalyScore > 70

    if (!shouldShow) return null

    const {
        swing_seats = 0,
        equivalent_town = 'a small town',
        statistical_certainty = 'p < 0.05',
        confidence_level = 95
    } = impactFacts

    // Format large numbers
    const formatNumber = (num) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
        return num.toLocaleString()
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={className}
            >
                <Card className="overflow-hidden shadow-lg border-l-4 border-l-rose-500 bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50">
                    <div className="p-5">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-gradient-to-br from-rose-500 to-orange-500 rounded-lg shadow-md">
                                <AlertTriangle className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Impact Analysis</h3>
                                <p className="text-xs text-gray-500">Human impact of detected anomalies</p>
                            </div>
                            <div className="ml-auto">
                                <motion.div
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full"
                                >
                                    HIGH RISK
                                </motion.div>
                            </div>
                        </div>

                        {/* Main Impact Statement */}
                        <motion.div
                            className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-rose-100"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-rose-600">
                                    {formatNumber(deletionCount)}
                                </span>
                                <span className="text-gray-700 font-medium">Voters Removed</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                <TrendingDown className="h-3 w-3" />
                                Unexplained deletions in this constituency
                            </p>
                        </motion.div>

                        {/* Impact Bullets */}
                        <div className="space-y-3">
                            {/* Swing Seats */}
                            <motion.div
                                className="flex items-start gap-3 p-3 bg-white/80 rounded-lg border border-orange-100"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="p-1.5 bg-orange-100 rounded-md mt-0.5">
                                    <BarChart3 className="h-4 w-4 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-800">
                                        Enough to swing <span className="font-bold text-orange-600">{swing_seats} assembly seat{swing_seats !== 1 ? 's' : ''}</span>
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Based on average winning margins
                                    </p>
                                </div>
                            </motion.div>

                            {/* Equivalent Town */}
                            <motion.div
                                className="flex items-start gap-3 p-3 bg-white/80 rounded-lg border border-amber-100"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className="p-1.5 bg-amber-100 rounded-md mt-0.5">
                                    <Building2 className="h-4 w-4 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-800">
                                        The entire voter population of <span className="font-bold text-amber-600">{equivalent_town}</span>
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        For scale comparison
                                    </p>
                                </div>
                            </motion.div>

                            {/* Statistical Significance */}
                            <motion.div
                                className="flex items-start gap-3 p-3 bg-white/80 rounded-lg border border-indigo-100"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <div className="p-1.5 bg-indigo-100 rounded-md mt-0.5">
                                    <Info className="h-4 w-4 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-800">
                                        Statistical significance: <span className="font-bold text-indigo-600">{statistical_certainty}</span>
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {confidence_level}% confidence level
                                    </p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Footer Note */}
                        <motion.p
                            className="mt-4 text-xs text-gray-400 text-center italic"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            Analysis based on synthetic data simulating ECI publication formats
                        </motion.p>
                    </div>
                </Card>
            </motion.div>
        </AnimatePresence>
    )
}

export default ImpactPanel
