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
            className={`relative group ${className}`}
        >
            {/* Outer Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-full opacity-30 group-hover:opacity-60 blur-md transition duration-500 group-hover:duration-200" />

            <Button
                onClick={handleClick}
                disabled={loading}
                className={`
                    relative z-10 
                    bg-gradient-to-r from-[#FF6B4A] to-[#FF8F6B]
                    hover:from-[#e55a3b] hover:to-[#ff7d57]
                    text-white font-semibold tracking-wide
                    shadow-[0_2px_15px_-3px_rgba(255,107,74,0.4)]
                    hover:shadow-[0_8px_25px_-5px_rgba(255,107,74,0.6)]
                    transition-all duration-300
                    px-8 py-3 rounded-full border border-orange-400/30
                    overflow-hidden
                    ${loading ? 'cursor-wait' : 'cursor-pointer'}
                `}
            >
                {/* Shine Effect */}
                <div className="absolute inset-0 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 ease-in-out" />

                <div className="flex items-center gap-3 relative z-20">
                    {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                    ) : (
                        <Search className="h-5 w-5 text-white stroke-[2.5]" />
                    )}

                    <span className="text-sm md:text-base font-bold drop-shadow-sm">
                        {loading ? 'Investigating...' : 'Investigate Top Anomaly'}
                    </span>

                    {!loading && (
                        <Zap className="h-4 w-4 text-yellow-300 fill-yellow-300 animate-pulse" />
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
