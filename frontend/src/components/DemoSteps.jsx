import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Map,
    MousePointer,
    Clock,
    BarChart2,
    Check,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    Sparkles
} from 'lucide-react'

/**
 * DemoSteps Component
 * 
 * Collapsible sidebar panel showing investigation steps with progress.
 * Clicking a step triggers navigation to that state.
 * 
 * @param {Object} props
 * @param {number} props.currentStep - Current step index (0-based)
 * @param {Object} props.completedSteps - Object with step IDs as keys, boolean values
 * @param {Function} props.onStepClick - Callback when a step is clicked
 * @param {boolean} props.isCollapsed - Whether the panel is collapsed
 * @param {Function} props.onToggleCollapse - Toggle collapse callback
 */
export function DemoSteps({
    currentStep = 0,
    completedSteps = {},
    onStepClick,
    isCollapsed = false,
    onToggleCollapse,
    onClose,
    className = ''
}) {
    const [collapsed, setCollapsed] = useState(isCollapsed)

    useEffect(() => {
        setCollapsed(isCollapsed)
    }, [isCollapsed])

    const toggleCollapse = () => {
        const newState = !collapsed
        setCollapsed(newState)
        if (onToggleCollapse) onToggleCollapse(newState)
    }

    const steps = [
        {
            id: 'heatmap',
            title: 'View Anomaly Heatmap',
            description: 'See geographic distribution of anomalies',
            icon: Map,
            action: 'heatmap'
        },
        {
            id: 'constituency',
            title: 'Select High-Risk Constituency',
            description: 'Click on a critical area marker',
            icon: MousePointer,
            action: 'selectConstituency'
        },
        {
            id: 'timeline',
            title: 'Slide to Critical Timeline: Oct 2023',
            description: 'Move to the peak anomaly period',
            icon: Clock,
            action: 'timeline'
        },
        {
            id: 'analyze',
            title: 'Analyze Unexplained Deletions',
            description: 'Review the deletion patterns',
            icon: BarChart2,
            action: 'analyze'
        }
    ]

    const handleStepClick = (step, index) => {
        if (onStepClick) {
            onStepClick(step.action, index)
        }
    }

    const completedCount = Object.values(completedSteps).filter(Boolean).length
    const progressPercent = (completedCount / steps.length) * 100

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden ${className}`}
        >
            {/* Header */}
            <div
                className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
            >
                <div className="flex items-center gap-2 cursor-pointer" onClick={toggleCollapse}>
                    <Sparkles className="h-4 w-4" />
                    <span className="font-semibold text-sm">Investigation Steps</span>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                        {completedCount}/{steps.length}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={toggleCollapse} className="hover:bg-white/20 p-1 rounded transition-colors">
                        {collapsed ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronUp className="h-4 w-4" />
                        )}
                    </button>
                    {onClose && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                            }}
                            className="hover:bg-white/20 p-1 rounded transition-colors"
                        >
                            <span className="sr-only">Close</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-gray-100">
                <motion.div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            {/* Steps List */}
            <AnimatePresence>
                {!collapsed && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="p-3 space-y-2">
                            {steps.map((step, index) => {
                                const StepIcon = step.icon
                                const isCompleted = completedSteps[step.id]
                                const isCurrent = currentStep === index
                                const isPast = index < currentStep || isCompleted

                                return (
                                    <motion.button
                                        key={step.id}
                                        onClick={() => handleStepClick(step, index)}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`
                      w-full flex items-start gap-3 p-3 rounded-lg text-left
                      transition-all duration-200 group
                      ${isCurrent
                                                ? 'bg-indigo-50 border border-indigo-200 shadow-sm'
                                                : 'hover:bg-gray-50 border border-transparent'
                                            }
                    `}
                                    >
                                        {/* Step Number / Check */}
                                        <div className={`
                      shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                      transition-all duration-300
                      ${isCompleted
                                                ? 'bg-green-500 text-white'
                                                : isCurrent
                                                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-200'
                                                    : 'bg-gray-100 text-gray-400'
                                            }
                    `}>
                                            {isCompleted ? (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: 'spring', bounce: 0.5 }}
                                                >
                                                    <Check className="h-4 w-4" />
                                                </motion.div>
                                            ) : (
                                                index + 1
                                            )}
                                        </div>

                                        {/* Step Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <StepIcon className={`h-4 w-4 shrink-0 ${isCurrent ? 'text-indigo-600' : isPast ? 'text-green-600' : 'text-gray-400'
                                                    }`} />
                                                <span className={`text-sm font-medium truncate ${isCurrent ? 'text-indigo-900' : isPast ? 'text-gray-900' : 'text-gray-500'
                                                    }`}>
                                                    {step.title}
                                                </span>
                                                {isCompleted && (
                                                    <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                                        ✓ Done
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-xs mt-0.5 ${isCurrent ? 'text-indigo-600' : 'text-gray-400'
                                                }`}>
                                                {step.description}
                                            </p>
                                        </div>

                                        {/* Arrow */}
                                        <ChevronRight className={`h-4 w-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${isCurrent ? 'text-indigo-400' : 'text-gray-300'
                                            }`} />
                                    </motion.button>
                                )
                            })}
                        </div>

                        {/* Completion Message */}
                        {completedCount === steps.length && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mx-3 mb-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100 text-center"
                            >
                                <div className="flex items-center justify-center gap-2 text-green-700 text-sm font-medium">
                                    <Check className="h-4 w-4" />
                                    Investigation Complete!
                                </div>
                                <p className="text-xs text-green-600 mt-1">
                                    All analysis steps reviewed
                                </p>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default DemoSteps
