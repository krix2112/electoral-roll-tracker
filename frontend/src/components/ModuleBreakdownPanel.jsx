/**
 * ModuleBreakdownPanel - Shows individual detection module scores
 * Interactive cards that expand to show evidence and details
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Brain, Network, Zap, Info } from 'lucide-react'
import { Card } from './ui/Card'

const MODULE_ICONS = {
    'Behavioral Fingerprinting': Brain,
    'Network Analysis': Network,
    'Entropy Analysis': Zap
}

export function ModuleBreakdownPanel({ modules, className = '' }) {
    const [expandedModule, setExpandedModule] = useState(null)

    if (!modules || modules.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No module data available
            </div>
        )
    }

    const getScoreColor = (score) => {
        if (score >= 70) return 'text-red-600 bg-red-100'
        if (score >= 30) return 'text-amber-600 bg-amber-100'
        return 'text-emerald-600 bg-emerald-100'
    }

    const getProgressColor = (score) => {
        if (score >= 70) return 'bg-red-500'
        if (score >= 30) return 'bg-amber-500'
        return 'bg-emerald-500'
    }

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex items-center gap-2 mb-4">
                <Info className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-gray-900">Detection Module Breakdown</h3>
            </div>

            {modules.map((module, index) => {
                const Icon = MODULE_ICONS[module.module] || Brain
                const isExpanded = expandedModule === module.module

                return (
                    <motion.div
                        key={module.module}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card
                            className={`cursor-pointer transition-all hover:shadow-lg ${isExpanded ? 'ring-2 ring-indigo-500' : ''
                                }`}
                            onClick={() => setExpandedModule(isExpanded ? null : module.module)}
                        >
                            <div className="p-4">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-100 rounded-lg">
                                            <Icon className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{module.module}</h4>
                                            <p className="text-xs text-gray-500">Weight: {(module.weight * 100).toFixed(0)}%</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className={`px-3 py-1 rounded-full font-bold ${getScoreColor(module.score)}`}>
                                            {module.score.toFixed(1)}
                                        </div>
                                        <motion.div
                                            animate={{ rotate: isExpanded ? 180 : 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <ChevronDown className="h-5 w-5 text-gray-400" />
                                        </motion.div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-3">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>Module Score</span>
                                        <span>Contribution: {module.contribution?.toFixed(1) || 0}</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${module.score}%` }}
                                            transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                                            className={`h-full ${getProgressColor(module.score)}`}
                                        />
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="border-t border-gray-200 pt-3 mt-3"
                                        >
                                            {/* Evidence */}
                                            {module.evidence && module.evidence.length > 0 && (
                                                <div className="mb-3">
                                                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Evidence:</h5>
                                                    <ul className="space-y-1">
                                                        {module.evidence.map((item, i) => (
                                                            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                                                <span className="text-indigo-600 mt-0.5">•</span>
                                                                <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Details */}
                                            {module.details && Object.keys(module.details).length > 0 && (
                                                <div className="bg-gray-50 rounded-lg p-3">
                                                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Technical Details:</h5>
                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                        {Object.entries(module.details).map(([key, value]) => {
                                                            // Skip complex objects
                                                            if (typeof value === 'object') return null
                                                            return (
                                                                <div key={key} className="flex justify-between">
                                                                    <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}:</span>
                                                                    <span className="font-medium text-gray-900">{value}</span>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </Card>
                    </motion.div>
                )
            })}
        </div>
    )
}
