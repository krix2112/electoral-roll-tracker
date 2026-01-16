import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2, Target, Zap } from 'lucide-react'
import { Button } from './ui/Button'

/**
 * InvestigationButton Component
 * 
 * Prominent button that triggers investigation of the top anomaly.
 * When clicked, it fetches the worst constituency-period combination
 * and triggers callbacks to update the dashboard state.
 * 
 * @param {Function} onInvestigate - Callback when investigation starts
 * @param {Function} onAnomalyFound - Callback with anomaly data
 * @param {boolean} isLoading - External loading state
 */
export function InvestigationButton({ onInvestigate, onAnomalyFound, isLoading = false, className = '' }) {
    const [localLoading, setLocalLoading] = useState(false)
    const [pulseActive, setPulseActive] = useState(true)

    const loading = isLoading || localLoading

    const handleClick = async () => {
        if (loading) return

        setLocalLoading(true)
        setPulseActive(false)

        try {
            if (onInvestigate) {
                await onInvestigate()
            }
        } catch (error) {
            console.error('Investigation failed:', error)
        } finally {
            setLocalLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative ${className}`}
        >
            {/* Pulsing ring effect */}
            <AnimatePresence>
                {pulseActive && (
                    <motion.div
                        className="absolute inset-0 rounded-lg bg-gradient-to-r from-rose-500 to-orange-500"
                        initial={{ opacity: 0.7, scale: 1 }}
                        animate={{
                            opacity: [0.7, 0, 0.7],
                            scale: [1, 1.15, 1]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                )}
            </AnimatePresence>

            <Button
                onClick={handleClick}
                disabled={loading}
                className={`
          relative z-10
          bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500
          hover:from-rose-700 hover:via-orange-600 hover:to-amber-600
          text-white font-semibold
          shadow-lg shadow-rose-500/25
          hover:shadow-xl hover:shadow-rose-500/40
          transition-all duration-300
          px-6 py-3
          ${loading ? 'cursor-wait' : 'cursor-pointer'}
        `}
            >
                <div className="flex items-center gap-2">
                    {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Search className="h-5 w-5" />
                    )}
                    <span className="text-sm md:text-base">
                        {loading ? 'Investigating...' : '🔍 Investigate Top Anomaly'}
                    </span>
                    {!loading && (
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            <Zap className="h-4 w-4 text-yellow-200" />
                        </motion.div>
                    )}
                </div>
            </Button>
        </motion.div>
    )
}

/**
 * InvestigationBadge Component
 * 
 * Small indicator that shows investigation mode is active.
 * 
 * @param {boolean} active - Whether investigation mode is active
 * @param {string} constituencyName - Name of the constituency being investigated
 */
export function InvestigationBadge({ active, constituencyName, onClose }) {
    if (!active) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg"
            >
                <Target className="h-4 w-4 animate-pulse" />
                <span className="text-sm font-medium">
                    Investigating: {constituencyName || 'Loading...'}
                </span>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors"
                    >
                        <span className="sr-only">Close</span>
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </motion.div>
        </AnimatePresence>
    )
}

export default InvestigationButton
