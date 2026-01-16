import { motion } from 'framer-motion'
import { Info } from 'lucide-react'

/**
 * MapLegend Component
 * 
 * Fixed position legend explaining map colors and opacity.
 * 
 * @param {Object} props
 * @param {string} props.position - Position variant ('bottom-right', 'bottom-left', 'top-right', 'top-left')
 * @param {boolean} props.showOpacityInfo - Whether to show opacity explanation
 */
export function MapLegend({
    position = 'bottom-right',
    showOpacityInfo = true,
    className = ''
}) {
    const positionClasses = {
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4'
    }

    const legendItems = [
        {
            color: 'bg-red-500',
            border: 'border-red-600',
            label: 'High Risk',
            score: '> 75',
            pulse: true
        },
        {
            color: 'bg-amber-500',
            border: 'border-amber-600',
            label: 'Medium Risk',
            score: '30-75',
            pulse: false
        },
        {
            color: 'bg-green-500',
            border: 'border-green-600',
            label: 'Normal',
            score: '< 30',
            pulse: false
        }
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`
        absolute ${positionClasses[position] || positionClasses['bottom-right']}
        bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-100
        p-3 z-20
        ${className}
      `}
        >
            <div className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <Info className="h-3 w-3" />
                Anomaly Score Legend
            </div>

            <div className="space-y-1.5">
                {legendItems.map((item, index) => (
                    <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="flex items-center gap-2"
                    >
                        {/* Color indicator */}
                        <div className="relative">
                            {item.pulse && (
                                <div className={`absolute inset-0 ${item.color} rounded-full animate-ping opacity-50`} />
                            )}
                            <div className={`
                w-3 h-3 rounded-full ${item.color} ${item.border}
                ${item.pulse ? 'animate-pulse' : ''}
                shadow-sm
              `} />
                        </div>

                        {/* Label and score */}
                        <span className="text-xs text-gray-600 min-w-[70px]">{item.label}</span>
                        <span className="text-[10px] text-gray-400 font-mono">({item.score})</span>
                    </motion.div>
                ))}
            </div>

            {/* Opacity explanation */}
            {showOpacityInfo && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-3 pt-2 border-t border-gray-100"
                >
                    <div className="text-[10px] text-gray-400 flex items-start gap-1">
                        <span className="font-medium">Opacity:</span>
                        <span>Indicates deletion intensity</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                        <div className="flex-1 h-1.5 bg-gradient-to-r from-gray-200 to-red-500 rounded-full" />
                        <span className="text-[10px] text-gray-400">Low → High</span>
                    </div>
                </motion.div>
            )}
        </motion.div>
    )
}

export default MapLegend
