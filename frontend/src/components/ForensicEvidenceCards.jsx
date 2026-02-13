/**
 * ForensicEvidenceCards - Display forensic evidence in interactive cards
 * Shows plain-English explanations with visual indicators
 * UI structure: colored top border, icon, title, description
 */

import { motion } from 'framer-motion'
import { Users, Calendar, Home, TrendingUp, Activity, FileText } from 'lucide-react'
import '../styles/forensicEvidence.css'

const EVIDENCE_ICONS = {
    'Network': Users,
    'Entropy': TrendingUp,
    'Behavioral': Activity,
    'Age': Calendar,
    'Address': Home,
    'Date': Calendar,
    'Name': FileText
}

// Color palette based on the provided image
// Each color set: { border (dark shade), bg (very light shade), iconBg, iconColor, hoverBg }
const CARD_COLORS = [
    {
        border: '#0B1E3B',       // Deep Navy
        bg: '#f5f7fb',           // Very light navy
        hoverBg: '#edf1f8',
        iconBg: '#0B1E3B',
        iconColor: '#ffffff',
        shadow: 'rgba(11, 30, 59, 0.18)',
    },
    {
        border: '#378A98',       // Teal
        bg: '#f2f9fa',           // Very light teal
        hoverBg: '#e8f4f6',
        iconBg: '#378A98',
        iconColor: '#ffffff',
        shadow: 'rgba(55, 138, 152, 0.18)',
    },
    {
        border: '#DEA843',       // Saffron
        bg: '#fdf8ef',           // Very light saffron
        hoverBg: '#faf2e3',
        iconBg: '#DEA843',
        iconColor: '#ffffff',
        shadow: 'rgba(222, 168, 67, 0.18)',
    },
    {
        border: '#5B8DB8',       // Frost Blue (darker shade for border)
        bg: '#f4f8fc',           // Very light frost blue
        hoverBg: '#ebf1f8',
        iconBg: '#5B8DB8',
        iconColor: '#ffffff',
        shadow: 'rgba(91, 141, 184, 0.18)',
    },
]

// Very light teal override for Network Isolation Alert & Low Name Diversity
const TEAL_OVERRIDE = {
    border: '#378A98',
    bg: '#eef8f9',           // Very very light teal
    hoverBg: '#e3f2f4',
    iconBg: '#378A98',
    iconColor: '#ffffff',
    shadow: 'rgba(55, 138, 152, 0.18)',
}

// Saffron override for Age-Migration Mismatch & Unrealistic Clusters
const SAFFRON_OVERRIDE = {
    border: '#DEA843',
    bg: '#fdf8ef',           // Very very light saffron
    hoverBg: '#faf2e3',
    iconBg: '#DEA843',
    iconColor: '#ffffff',
    shadow: 'rgba(222, 168, 67, 0.18)',
}

// Greyish-black override for Bulk Registration Alert
const GREY_BLACK_OVERRIDE = {
    border: '#2D2D2D',
    bg: '#f5f5f5',           // Very light grey
    hoverBg: '#ececec',
    iconBg: '#3a3a3a',
    iconColor: '#ffffff',
    shadow: 'rgba(45, 45, 45, 0.16)',
}

// Content-aware color assignment
const getCardColors = (type, index) => {
    if (type === 'Network' || type === 'Name') return TEAL_OVERRIDE
    if (type === 'Behavioral' || type === 'Address') return SAFFRON_OVERRIDE
    if (type === 'Date') return GREY_BLACK_OVERRIDE
    return CARD_COLORS[index % CARD_COLORS.length]
}

// Helper to strip all emojis from text
const stripEmojis = (text) => {
    return text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FE0F}\u{1F000}-\u{1FFFF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, '').trim()
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
        const boldMatch = text.match(/\*\*(.*?)\*\*/)

        let type = 'General'
        if (text.includes('Unrealistic')) type = 'Address'
        else if (text.includes('Network') || text.includes('island')) type = 'Network'
        else if (text.includes('Registration')) type = 'Date'
        else if (text.includes('Entropy') || text.includes('entropy')) type = 'Entropy'
        else if (text.includes('Behavioral') || text.includes('Age-Migration')) type = 'Behavioral'
        else if (text.includes('Address')) type = 'Address'
        else if (text.includes('Name')) type = 'Name'

        const severity = text.includes('Critical') || text.includes('Alert') ? 'high' :
            text.includes('Warning') || text.includes('Mismatch') ? 'medium' : 'low'

        // Clean title and description - remove emojis
        const rawTitle = boldMatch ? boldMatch[1] : 'Evidence'
        const rawDescription = text.replace(/^[\u{1F300}-\u{1F9FF}]\s*/u, '').replace(/\*\*(.*?)\*\*/g, '$1')

        return {
            title: stripEmojis(rawTitle),
            description: stripEmojis(rawDescription),
            type,
            severity
        }
    }

    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 ${className}`}>
            {evidence.map((item, index) => {
                const parsed = parseEvidence(item)
                const Icon = EVIDENCE_ICONS[parsed.type] || AlertTriangle
                const colors = getCardColors(parsed.type, index)

                return (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
                        whileHover={{
                            y: -6,
                            transition: { duration: 0.25, ease: 'easeOut' }
                        }}
                        style={{
                            '--card-border': colors.border,
                            '--card-bg': colors.bg,
                            '--card-hover-bg': colors.hoverBg,
                            '--card-shadow': colors.shadow,
                        }}
                        className="forensic-evidence-card group"
                    >
                        {/* Card */}
                        <div
                            className="forensic-evidence-card-inner"
                            style={{
                                borderTop: `4px solid ${colors.border}`,
                                backgroundColor: colors.bg,
                            }}
                        >
                            {/* Icon */}
                            <div
                                className="forensic-evidence-icon"
                                style={{
                                    backgroundColor: colors.iconBg,
                                    color: colors.iconColor,
                                }}
                            >
                                <Icon style={{ width: 20, height: 20 }} />
                            </div>

                            {/* Title */}
                            <h4 className="forensic-evidence-title">
                                {parsed.title}
                            </h4>

                            {/* Description */}
                            <p className="forensic-evidence-desc">
                                {parsed.description}
                            </p>

                        </div>

                        {/* Shadow element that appears on hover */}
                        <div
                            className="forensic-evidence-shadow"
                            style={{
                                background: `radial-gradient(ellipse at center, ${colors.shadow} 0%, transparent 70%)`,
                            }}
                        />
                    </motion.div>
                )
            })}
        </div>
    )
}
