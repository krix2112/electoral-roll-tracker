/**
 * ForensicEvidenceCards - Display forensic evidence in interactive cards
 * Shows plain-English explanations with visual indicators
 */

import { motion } from 'framer-motion'
import { AlertTriangle, Users, Calendar, Home, TrendingUp } from 'lucide-react'
import { Card } from './ui/Card'

const EVIDENCE_ICONS = {
    'Network': Users,
    'Entropy': TrendingUp,
    'Behavioral': AlertTriangle,
    'Age': Calendar,
    'Address': Home,
    'Date': Calendar,
    'Name': Users
}

export function ForensicEvidenceCards({ evidence, className = '' }) {
    if (!evidence || evidence.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No evidence detected
            </div>
        )
    }

    // Parse evidence to extract type and severity
    const parseEvidence = (text) => {
        // Extract emoji and bold text
        const emojiMatch = text.match(/^([\u{1F300}-\u{1F9FF}])/u)
        const boldMatch = text.match(/\*\*(.*?)\*\*/)

        let type = 'General'
        if (text.includes('Network') || text.includes('island') || text.includes('cluster')) type = 'Network'
        else if (text.includes('Entropy') || text.includes('entropy')) type = 'Entropy'
        else if (text.includes('Behavioral') || text.includes('Age-Migration')) type = 'Behavioral'
        else if (text.includes('Registration') || text.includes('date')) type = 'Date'
        else if (text.includes('Address')) type = 'Address'
        else if (text.includes('Name')) type = 'Name'

        const severity = text.includes('Critical') || text.includes('Alert') ? 'high' :
            text.includes('Warning') || text.includes('Mismatch') ? 'medium' : 'low'

        return {
            emoji: emojiMatch ? emojiMatch[1] : '⚠️',
            title: boldMatch ? boldMatch[1] : 'Evidence',
            description: text.replace(/^[\u{1F300}-\u{1F9FF}]\s*/u, '').replace(/\*\*(.*?)\*\*/g, '$1'),
            type,
            severity
        }
    }

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high': return 'border-red-300 bg-red-50'
            case 'medium': return 'border-amber-300 bg-amber-50'
            default: return 'border-blue-300 bg-blue-50'
        }
    }

    const getSeverityBadge = (severity) => {
        switch (severity) {
            case 'high': return 'bg-red-100 text-red-700'
            case 'medium': return 'bg-amber-100 text-amber-700'
            default: return 'bg-blue-100 text-blue-700'
        }
    }

    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
            {evidence.map((item, index) => {
                const parsed = parseEvidence(item)
                const Icon = EVIDENCE_ICONS[parsed.type] || AlertTriangle

                return (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className={`border-l-4 ${getSeverityColor(parsed.severity)} hover:shadow-lg transition-shadow`}>
                            <div className="p-4">
                                <div className="flex items-start gap-3">
                                    {/* Icon */}
                                    <div className="flex-shrink-0">
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            <Icon className="h-5 w-5 text-indigo-600" />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h4 className="font-semibold text-gray-900 text-sm">
                                                {parsed.emoji} {parsed.title}
                                            </h4>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getSeverityBadge(parsed.severity)}`}>
                                                {parsed.severity.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {parsed.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )
            })}
        </div>
    )
}
