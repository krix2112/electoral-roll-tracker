import { motion } from 'framer-motion'
import { AlertTriangle, Shield, CheckCircle, TrendingUp } from 'lucide-react'

/**
 * AnomalyBadge Component
 * 
 * Large, visually dominant badge displaying anomaly score with
 * conditional coloring and confidence level.
 * 
 * @param {Object} props
 * @param {number} props.score - Anomaly score (0-100)
 * @param {number} props.confidenceLevel - Confidence percentage
 * @param {string} props.size - Size variant ('sm', 'md', 'lg')
 * @param {boolean} props.showConfidence - Whether to show confidence text
 * @param {boolean} props.animate - Whether to animate on mount
 */
export function AnomalyBadge({
    score = 0,
    confidenceLevel = 95,
    size = 'lg',
    showConfidence = true,
    animate = true,
    className = ''
}) {
    // Determine risk level styling based on score
    const getRiskStyling = (score) => {
        if (score >= 75) {
            return {
                bg: 'bg-gradient-to-br from-red-500 to-rose-600',
                ring: 'ring-red-300',
                text: 'text-white',
                label: 'Critical',
                labelBg: 'bg-red-700',
                icon: AlertTriangle,
                pulse: true,
                glow: 'shadow-red-500/50'
            }
        }
        if (score >= 50) {
            return {
                bg: 'bg-gradient-to-br from-orange-400 to-amber-500',
                ring: 'ring-orange-300',
                text: 'text-white',
                label: 'High',
                labelBg: 'bg-orange-600',
                icon: TrendingUp,
                pulse: false,
                glow: 'shadow-orange-500/40'
            }
        }
        if (score >= 30) {
            return {
                bg: 'bg-gradient-to-br from-amber-400 to-yellow-500',
                ring: 'ring-amber-300',
                text: 'text-gray-900',
                label: 'Medium',
                labelBg: 'bg-amber-600 text-white',
                icon: Shield,
                pulse: false,
                glow: 'shadow-amber-500/30'
            }
        }
        return {
            bg: 'bg-gradient-to-br from-green-400 to-emerald-500',
            ring: 'ring-green-300',
            text: 'text-white',
            label: 'Normal',
            labelBg: 'bg-green-600',
            icon: CheckCircle,
            pulse: false,
            glow: 'shadow-green-500/30'
        }
    }

    const styling = getRiskStyling(score)
    const Icon = styling.icon

    // Size variants
    const sizeClasses = {
        sm: {
            container: 'w-20 h-20',
            score: 'text-2xl',
            label: 'text-[10px] px-1.5 py-0.5',
            icon: 'h-3 w-3',
            confidence: 'text-[9px]'
        },
        md: {
            container: 'w-28 h-28',
            score: 'text-3xl',
            label: 'text-xs px-2 py-0.5',
            icon: 'h-4 w-4',
            confidence: 'text-[10px]'
        },
        lg: {
            container: 'w-36 h-36',
            score: 'text-5xl',
            label: 'text-xs px-2.5 py-1',
            icon: 'h-5 w-5',
            confidence: 'text-xs'
        }
    }

    const sizes = sizeClasses[size] || sizeClasses.lg

    const containerVariants = {
        initial: { scale: 0.8, opacity: 0 },
        animate: {
            scale: 1,
            opacity: 1,
            transition: { type: 'spring', bounce: 0.4, duration: 0.6 }
        }
    }

    const scoreVariants = {
        initial: { y: 20, opacity: 0 },
        animate: {
            y: 0,
            opacity: 1,
            transition: { delay: 0.2, duration: 0.4 }
        }
    }

    return (
        <motion.div
            variants={animate ? containerVariants : undefined}
            initial={animate ? 'initial' : undefined}
            animate={animate ? 'animate' : undefined}
            className={`relative ${className}`}
        >
            {/* Glow effect for high scores */}
            {score >= 75 && (
                <motion.div
                    className={`absolute inset-0 ${styling.bg} rounded-full blur-xl opacity-40`}
                    animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            )}

            {/* Main badge */}
            <motion.div
                className={`
          relative ${sizes.container} rounded-full ${styling.bg}
          flex flex-col items-center justify-center
          shadow-2xl ${styling.glow}
          ${styling.pulse ? 'animate-pulse' : ''}
          ring-4 ${styling.ring} ring-opacity-30
        `}
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400 }}
            >
                {/* Icon */}
                <Icon className={`${sizes.icon} ${styling.text} opacity-80 mb-1`} />

                {/* Score */}
                <motion.div
                    variants={animate ? scoreVariants : undefined}
                    initial={animate ? 'initial' : undefined}
                    animate={animate ? 'animate' : undefined}
                    className={`${sizes.score} font-black ${styling.text} leading-none`}
                >
                    {score}
                </motion.div>

                {/* Label */}
                <div className={`
          ${sizes.label} ${styling.labelBg} rounded-full 
          font-bold uppercase tracking-wider mt-1
        `}>
                    {styling.label}
                </div>
            </motion.div>

            {/* Confidence Level */}
            {showConfidence && (
                <motion.div
                    initial={animate ? { opacity: 0, y: 5 } : undefined}
                    animate={animate ? { opacity: 1, y: 0 } : undefined}
                    transition={{ delay: 0.4 }}
                    className={`
            mt-2 text-center ${sizes.confidence} text-gray-500 font-medium
          `}
                >
                    {confidenceLevel}% Confidence
                </motion.div>
            )}
        </motion.div>
    )
}

/**
 * AnomalyScoreInline Component
 * 
 * Smaller inline version of the anomaly badge for use in tables/lists.
 */
export function AnomalyScoreInline({ score = 0, className = '' }) {
    const getColor = (score) => {
        if (score >= 75) return 'bg-red-100 text-red-700 border-red-200'
        if (score >= 50) return 'bg-orange-100 text-orange-700 border-orange-200'
        if (score >= 30) return 'bg-amber-100 text-amber-700 border-amber-200'
        return 'bg-green-100 text-green-700 border-green-200'
    }

    return (
        <span className={`
      inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold
      border ${getColor(score)} ${className}
    `}>
            {score >= 75 && <AlertTriangle className="h-3 w-3" />}
            {score}
        </span>
    )
}

export default AnomalyBadge
