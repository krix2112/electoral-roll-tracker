/**
 * ForensicScoreGauge - Multi-layer anomaly score visualization
 * Displays the final fusion score with color-coded verdict
 */

import { motion } from 'framer-motion'
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react'

export function ForensicScoreGauge({ score, verdict, confidenceLevel, size = 'md' }) {
    // Determine color and icon based on score
    const getScoreConfig = (score) => {
        if (score >= 70) {
            return {
                color: 'red',
                gradient: 'from-red-500 to-red-600',
                bgGradient: 'from-red-50 to-red-100',
                textColor: 'text-red-700',
                icon: AlertTriangle,
                label: 'Critical'
            }
        } else if (score >= 30) {
            return {
                color: 'yellow',
                gradient: 'from-amber-500 to-amber-600',
                bgGradient: 'from-amber-50 to-amber-100',
                textColor: 'text-amber-700',
                icon: Shield,
                label: 'Moderate'
            }
        } else {
            return {
                color: 'green',
                gradient: 'from-emerald-500 to-emerald-600',
                bgGradient: 'from-emerald-50 to-emerald-100',
                textColor: 'text-emerald-700',
                icon: CheckCircle,
                label: 'Normal'
            }
        }
    }

    const config = getScoreConfig(score)
    const Icon = config.icon

    // Size configurations
    const sizes = {
        sm: { gauge: 120, stroke: 8, text: 'text-2xl', label: 'text-xs' },
        md: { gauge: 180, stroke: 12, text: 'text-4xl', label: 'text-sm' },
        lg: { gauge: 240, stroke: 16, text: 'text-6xl', label: 'text-base' }
    }

    const sizeConfig = sizes[size]
    const radius = (sizeConfig.gauge - sizeConfig.stroke) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (score / 100) * circumference

    return (
        <div className="flex flex-col items-center">
            {/* Circular Gauge */}
            <div className="relative" style={{ width: sizeConfig.gauge, height: sizeConfig.gauge }}>
                {/* Background Circle */}
                <svg className="transform -rotate-90" width={sizeConfig.gauge} height={sizeConfig.gauge}>
                    <circle
                        cx={sizeConfig.gauge / 2}
                        cy={sizeConfig.gauge / 2}
                        r={radius}
                        stroke="#e5e7eb"
                        strokeWidth={sizeConfig.stroke}
                        fill="none"
                    />
                    {/* Progress Circle */}
                    <motion.circle
                        cx={sizeConfig.gauge / 2}
                        cy={sizeConfig.gauge / 2}
                        r={radius}
                        stroke="url(#scoreGradient)"
                        strokeWidth={sizeConfig.stroke}
                        fill="none"
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                        style={{
                            strokeDasharray: circumference,
                            strokeDashoffset: offset
                        }}
                    />
                    {/* Gradient Definition */}
                    <defs>
                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" className={config.gradient.split(' ')[0].replace('from-', '')} stopColor={`var(--${config.color}-500)`} />
                            <stop offset="100%" className={config.gradient.split(' ')[1].replace('to-', '')} stopColor={`var(--${config.color}-600)`} />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Icon className={`h-8 w-8 ${config.textColor} mb-2`} />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className={`${sizeConfig.text} font-bold ${config.textColor}`}
                    >
                        {Math.round(score)}
                    </motion.div>
                    <div className={`${sizeConfig.label} text-gray-500 font-medium`}>/ 100</div>
                </div>
            </div>

            {/* Verdict Label */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-4 text-center"
            >
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${config.bgGradient}`}>
                    <span className={`font-bold ${config.textColor}`}>{verdict || config.label}</span>
                </div>
                {confidenceLevel && (
                    <div className="mt-2 text-xs text-gray-500">
                        Confidence: <span className="font-semibold">{confidenceLevel}</span>
                    </div>
                )}
            </motion.div>
        </div>
    )
}
